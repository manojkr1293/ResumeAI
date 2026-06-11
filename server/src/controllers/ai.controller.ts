import { Request, Response, NextFunction } from 'express';
import { AIRepository } from '../repositories/ai.repository';
import { ValidationError, NotFoundError, AIServiceError } from '../errors/index';
import { sendSuccess } from '../utils/response';
import repositories from '../repositories';
import env from '../config/env';

type GeminiGenerationConfig = {
  temperature?: number;
  responseMimeType?: string;
  timeoutMs?: number;
};

export class AIController {
  private aiRepository: AIRepository;

  constructor() {
    this.aiRepository = repositories.ai;
  }

  private getGeminiApiKey(): string {
    const googleOpenAICompatKey = env.OPENAI_BASE_URL?.includes('generativelanguage.googleapis.com')
      ? env.OPENAI_API_KEY
      : '';

    return env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || env.GOOGLE_API_KEY || googleOpenAICompatKey || '';
  }

  private async generateGeminiText(prompt: string, config: GeminiGenerationConfig = {}): Promise<string> {
    const apiKey = this.getGeminiApiKey();

    if (!apiKey) {
      throw new AIServiceError('Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.');
    }

    const preferredModel = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const models = Array.from(new Set([preferredModel, 'gemini-2.5-flash-lite']));
    let lastError = 'Gemini request failed';

    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 12000);
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: config.temperature ?? 0.7,
                ...(config.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
              },
            }),
          });

          const payload = await response.json() as any;

          if (!response.ok) {
            lastError = payload?.error?.message || `Gemini request failed with status ${response.status}`;
            const retryable = response.status === 429 || response.status >= 500 || /high demand|overloaded|temporar/i.test(lastError);
            if (retryable) {
              continue;
            }
            throw new AIServiceError(lastError);
          }

          const text = payload?.candidates?.[0]?.content?.parts
            ?.map((part: any) => part?.text || '')
            .join('')
            .trim();

          if (text) {
            return text;
          }

          lastError = payload?.candidates?.[0]?.finishReason
            ? `Gemini returned no text. Finish reason: ${payload.candidates[0].finishReason}`
            : 'Gemini returned an empty response';
        } catch (error) {
          if (error instanceof AIServiceError) {
            throw error;
          }
          lastError = error instanceof Error ? error.message : 'Gemini request failed';
        } finally {
          clearTimeout(timeout);
        }
      }
    }

    throw new AIServiceError(lastError);
  }

  private extractJson(text: string): string {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const firstArray = cleaned.indexOf('[');
    const lastArray = cleaned.lastIndexOf(']');
    const firstObject = cleaned.indexOf('{');
    const lastObject = cleaned.lastIndexOf('}');

    if (firstArray !== -1 && lastArray > firstArray && (firstObject === -1 || firstArray < firstObject)) {
      return cleaned.slice(firstArray, lastArray + 1);
    }

    if (firstObject !== -1 && lastObject > firstObject) {
      return cleaned.slice(firstObject, lastObject + 1);
    }

    return cleaned;
  }

  private parseJson<T>(text: string, fallback: T): T {
    try {
      return JSON.parse(this.extractJson(text)) as T;
    } catch {
      return fallback;
    }
  }

  private serializeResumeSections(resume: any): string {
    return (resume.sections || [])
      .map((section: any) => `${section.sectionType}: ${JSON.stringify(section.content)}`)
      .join('\n\n');
  }

  private async logFeedbackSafely(data: Parameters<AIRepository['logFeedback']>[0]): Promise<void> {
    try {
      await this.aiRepository.logFeedback(data);
    } catch {
      // Do not block the AI response if usage logging fails.
    }
  }

  private buildLocalResumeReview(resume: any): string {
    const sections = resume.sections || [];
    const content = (type: string) => sections.find((section: any) => section.sectionType === type)?.content || {};
    const summary = content('SUMMARY')?.text || '';
    const experience = content('EXPERIENCE')?.items || [];
    const skills = content('SKILLS')?.items || [];
    const projects = content('PROJECTS')?.items || [];

    const feedback = [
      'Resume Quality Review',
      '',
      `Overall quality score: ${Math.min(88, 45 + (summary ? 10 : 0) + Math.min(experience.length * 10, 20) + Math.min(skills.length * 2, 16) + (projects.length ? 7 : 0))}/100`,
      summary.length < 80
        ? 'High priority: Summary is too short or generic. Add your target role, strongest technical stack, and one measurable business/result outcome.'
        : 'Medium priority: Summary is present. Make sure it names the target role and includes one concrete achievement.',
      experience.length === 0
        ? 'High priority: Experience section is missing. Add at least one role with 2-4 impact bullets.'
        : 'High priority: Experience bullets should avoid generic wording. Use action + metric + outcome, for example: "Reduced page load time by 40% by optimizing API calls."',
      skills.length < 6
        ? 'Medium priority: Skills section looks light. Add role-specific keywords from the job description, but only skills you can honestly defend.'
        : 'Low priority: Skills section has enough keywords. Keep it focused and remove unrelated items for each job-specific resume.',
      projects.length === 0
        ? 'Medium priority: Projects section is missing. Add 1-2 projects that prove your skills with technology, problem, and result.'
        : 'Medium priority: Project descriptions should explain what you built, what technologies you used, and why the project mattered.',
      'Quick fix: Add proof wherever possible: percentages, time saved, number of users, performance gains, team size, or business impact.',
    ];

    return feedback.join('\n');
  }

  private buildLocalSummary(resume: any, targetRole?: string): string {
    const sections = resume.sections || [];
    const content = (type: string) => sections.find((section: any) => section.sectionType === type)?.content || {};
    const experience = content('EXPERIENCE')?.items || [];
    const skills = content('SKILLS')?.items || [];
    const role = targetRole || resume.title || experience[0]?.position || 'professional';
    const topSkills = skills
      .map((skill: any) => skill.name)
      .filter(Boolean)
      .slice(0, 5)
      .join(', ');
    const latestRole = experience[0]?.position || role;
    const latestCompany = experience[0]?.company ? ` at ${experience[0].company}` : '';

    return `${role.replace(/resume$/i, '').trim()} with experience as ${latestRole}${latestCompany}. Skilled in ${topSkills || 'modern tools and problem solving'} with a focus on practical outcomes.`;
  }

  improveBullets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, sectionId, bullets } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
        throw new ValidationError('Bullets array is required');
      }

      const prompt = `System: You are an expert resume writer.
Return only valid JSON as an array of improved bullet strings.

User: Improve these resume bullets to be action-oriented, measurable, and ATS-friendly:
${bullets.join('\n')}`;

      const responseText = await this.generateGeminiText(prompt, {
        temperature: 0.7,
        responseMimeType: 'application/json',
      });
      const improvedBullets = this.parseJson<string[]>(responseText, bullets);

      await this.logFeedbackSafely({
        userId,
        resumeId,
        sectionId,
        moduleName: 'BULLET_IMPROVER',
        originalText: bullets.join('\n'),
        aiResponse: JSON.stringify(improvedBullets),
        tokenUsage: 0,
      });

      sendSuccess(res, { originalBullets: bullets, improvedBullets });
    } catch (error) {
      next(error);
    }
  };

  analyzeATS = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, jobDescription } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId || !jobDescription) {
        throw new ValidationError('Resume ID and job description are required');
      }

      const resume = await repositories.resume.findWithSections(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      const prompt = `System: You are an expert ATS resume analyzer.
Return only valid JSON with this shape:
{
  "overallScore": number,
  "keywordScore": number,
  "formatScore": number,
  "impactScore": number,
  "readabilityScore": number,
  "missingKeywords": string[],
  "suggestions": string[]
}

User: Analyze this resume against the job description.

Resume:
${this.serializeResumeSections(resume)}

Job description:
${jobDescription}`;

      const responseText = await this.generateGeminiText(prompt, {
        temperature: 0.3,
        responseMimeType: 'application/json',
      });
      const analysis = this.parseJson(responseText, {
        overallScore: 0,
        keywordScore: 0,
        formatScore: 0,
        impactScore: 0,
        readabilityScore: 0,
        missingKeywords: [],
        suggestions: ['AI returned an unreadable analysis. Please try again.'],
      });

      await this.logFeedbackSafely({
        userId,
        resumeId,
        moduleName: 'ATS_ANALYZER',
        originalText: jobDescription,
        aiResponse: JSON.stringify(analysis),
        tokenUsage: 0,
      });

      sendSuccess(res, { analysis });
    } catch (error) {
      next(error);
    }
  };

  resumeCoach = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, question } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId || !question) {
        throw new ValidationError('Resume ID and question are required');
      }

      const resume = await repositories.resume.findWithSections(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      const prompt = `System: You are an expert career coach. Give practical, specific resume advice.

User question:
${question}

Resume:
${this.serializeResumeSections(resume)}`;

      const advice = await this.generateGeminiText(prompt, { temperature: 0.7 });

      await this.logFeedbackSafely({
        userId,
        resumeId,
        moduleName: 'RESUME_COACH',
        originalText: question,
        aiResponse: advice,
        tokenUsage: 0,
      });

      sendSuccess(res, { question, advice });
    } catch (error) {
      next(error);
    }
  };

  resumeRoast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await repositories.resume.findWithSections(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      const prompt = `System: You are a direct but constructive resume reviewer. Be honest, specific, and helpful.

User: Review this resume. Point out weak sections, generic wording, missing proof, and improvements.

Resume:
${this.serializeResumeSections(resume)}`;

      let roast: string;
      try {
        roast = await this.generateGeminiText(prompt, { temperature: 0.8, timeoutMs: 7000 });
      } catch {
        roast = this.buildLocalResumeReview(resume);
      }

      await this.logFeedbackSafely({
        userId,
        resumeId,
        moduleName: 'ROAST_ENGINE',
        originalText: resume.title,
        aiResponse: roast,
        tokenUsage: 0,
      });

      sendSuccess(res, { roast });
    } catch (error) {
      next(error);
    }
  };

  generateSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, targetRole } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await repositories.resume.findWithSections(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      const prompt = `System: You are an expert resume writer.
Write a short professional resume summary.
Rules:
- Maximum 35 words.
- Exactly 2 short sentences.
- Mention target role and strongest skills.
- Do not write a long paragraph.

Target role: ${targetRole || resume.title || 'General'}

Resume:
${this.serializeResumeSections(resume)}`;

      let summary: string;
      try {
        summary = await this.generateGeminiText(prompt, { temperature: 0.7, timeoutMs: 7000 });
      } catch {
        summary = this.buildLocalSummary(resume, targetRole);
      }

      await this.logFeedbackSafely({
        userId,
        resumeId,
        moduleName: 'SUMMARY_GENERATOR',
        originalText: targetRole || 'General',
        aiResponse: summary,
        tokenUsage: 0,
      });

      sendSuccess(res, { summary });
    } catch (error) {
      next(error);
    }
  };

  getUserAIStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const stats = await this.aiRepository.getUserAIStats(userId);
      sendSuccess(res, { stats });
    } catch (error) {
      next(error);
    }
  };

  rateFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { feedbackId, rating } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!feedbackId || rating === undefined) {
        throw new ValidationError('Feedback ID and rating are required');
      }

      if (rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5');
      }

      const feedback = await this.aiRepository.rateFeedback(feedbackId, rating);
      sendSuccess(res, { feedback });
    } catch (error) {
      next(error);
    }
  };
}

export default new AIController();
