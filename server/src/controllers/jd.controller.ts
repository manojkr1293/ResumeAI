import env from '../config/env';
import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, AuthorizationError } from '../errors/index';
import { sendSuccess, sendCreated } from '../utils/response';
import repositories from '../repositories';
import openai from '../config/openai';

/**
 * Job Description Controller
 * Handles JD extraction, matching, and tailoring
 */
export class JDController {
  /**
   * Create a new job description
   */
  createJD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { title, company, rawText } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!title || !rawText) {
        throw new ValidationError('Title and raw text are required');
      }

      const jd = await repositories.getPrisma().jobDescription.create({
        data: {
          user: { connect: { id: userId } },
          title,
          company: company || '',
          rawText,
          extractedData: {},
        },
      });

      sendCreated(res, { jd });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all job descriptions for user
   */
  getAllJDs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const jds = await repositories.getPrisma().jobDescription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, { jds });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single job description by ID
   */
  getJDById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Job description ID is required');
      }

      const jd = await repositories.getPrisma().jobDescription.findUnique({
        where: { id },
      });

      if (!jd) {
        throw new NotFoundError('Job description not found');
      }

      if (jd.userId !== userId) {
        throw new AuthorizationError('You do not have permission to access this job description');
      }

      sendSuccess(res, { jd });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Extract keywords from job description
   */
  extractKeywords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { jdId } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!jdId) {
        throw new ValidationError('Job description ID is required');
      }

      if (!openai) {
        throw new ValidationError('OpenAI service is not configured');
      }

      const jd = await repositories.getPrisma().jobDescription.findUnique({
        where: { id: jdId },
      });

      if (!jd || jd.userId !== userId) {
        throw new NotFoundError('Job description not found');
      }

      // Call OpenAI to extract keywords
      const prompt = `Extract key skills, technologies, and requirements from this job description. Return as JSON with fields: skills (array), technologies (array), requirements (array), qualifications (array).\n\n${jd.rawText}`;

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_PREMIUM_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert at analyzing job descriptions.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const extractedData = JSON.parse(completion.choices[0]?.message?.content || '{}');

      // Update JD with extracted data
      const updatedJD = await repositories.getPrisma().jobDescription.update({
        where: { id: jdId },
        data: { extractedData: extractedData as any },
      });

      sendSuccess(res, { jd: updatedJD, extractedData });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Match resume to job description
   */
  matchResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, jdId } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId || !jdId) {
        throw new ValidationError('Resume ID and Job description ID are required');
      }

      if (!openai) {
        throw new ValidationError('OpenAI service is not configured');
      }

      // Get resume and JD
      const resume = await repositories.resume.findWithSections(resumeId);
      const jd = await repositories.getPrisma().jobDescription.findUnique({
        where: { id: jdId },
      });

      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      if (!jd || jd.userId !== userId) {
        throw new NotFoundError('Job description not found');
      }

      // Call OpenAI to match resume to JD
      const prompt = `Compare this resume against the job description and provide:
1. Match percentage (0-100)
2. Missing skills
3. Missing keywords
4. Suggestions to improve match
Return as JSON with these fields.

Resume:\n${resume.sections.map((s: any) => `${s.sectionType}: ${s.content}`).join('\n\n')}

Job Description:\n${jd.rawText}`;

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_PREMIUM_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert at matching resumes to job descriptions.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const matchResult = JSON.parse(completion.choices[0]?.message?.content || '{}');

      // Create ATS score record
      const atsScore = await repositories.getPrisma().aTSScore.create({
        data: {
          resumeId,
          jobDescriptionId: jdId,
          overallScore: matchResult.matchPercentage || 0,
          keywordScore: matchResult.matchPercentage || 0,
          formatScore: 0,
          impactScore: 0,
          readabilityScore: 0,
          breakdown: matchResult as any,
          missingKeywords: matchResult.missingKeywords || [],
          suggestions: matchResult.suggestions || [],
        },
      });

      sendSuccess(res, { matchResult, atsScore });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tailor resume to job description
   */
  tailorResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, jdId } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId || !jdId) {
        throw new ValidationError('Resume ID and Job description ID are required');
      }

      if (!openai) {
        throw new ValidationError('OpenAI service is not configured');
      }

      // Get resume and JD
      const resume = await repositories.resume.findWithSections(resumeId);
      const jd = await repositories.getPrisma().jobDescription.findUnique({
        where: { id: jdId },
      });

      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      if (!jd || jd.userId !== userId) {
        throw new NotFoundError('Job description not found');
      }

      // Call OpenAI to tailor resume to JD
      const prompt = `Tailor this resume to better match the job description. Provide improved versions of sections that need enhancement. Return as JSON with tailored sections.

Resume:\n${resume.sections.map((s: any) => `${s.sectionType}: ${s.content}`).join('\n\n')}

Job Description:\n${jd.rawText}`;

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_PREMIUM_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert at tailoring resumes to specific job descriptions.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const tailoredResume = JSON.parse(completion.choices[0]?.message?.content || '{}');

      // Log AI feedback
      await repositories.ai.logFeedback({
        userId,
        resumeId,
        moduleName: 'JD_TAILORING',
        originalText: jd.rawText,
        aiResponse: JSON.stringify(tailoredResume),
        tokenUsage: completion.usage?.total_tokens || 0,
      });

      sendSuccess(res, { tailoredResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete job description
   */
  deleteJD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Job description ID is required');
      }

      const jd = await repositories.getPrisma().jobDescription.findUnique({
        where: { id },
      });

      if (!jd) {
        throw new NotFoundError('Job description not found');
      }

      if (jd.userId !== userId) {
        throw new AuthorizationError('You do not have permission to delete this job description');
      }

      await repositories.getPrisma().jobDescription.delete({
        where: { id },
      });

      sendSuccess(res, { message: 'Job description deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default new JDController();

