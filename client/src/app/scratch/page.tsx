'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { Bot, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Share2, Sparkles, Trash2 } from 'lucide-react';

const SCRATCH_DRAFT_KEY = 'scratchResume';
const DEFAULT_RESUME_TITLE = 'My Resume';

const SECTION_ORDER = {
  CONTACT: 1,
  SUMMARY: 2,
  EXPERIENCE: 3,
  EDUCATION: 4,
  SKILLS: 5,
  PROJECTS: 6,
  CERTIFICATIONS: 7,
  LANGUAGES: 8,
} as const;

const BUILDER_STEPS = [
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'languages', label: 'Languages' },
  { id: 'ai', label: 'AI' },
] as const;

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Skill {
  id: string;
  name: string;
  level: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: string;
}

interface ResumeData {
  title: string;
  template: 'professional' | 'modern' | 'minimal';
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

export default function ScratchResumeBuilder() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: DEFAULT_RESUME_TITLE,
    template: 'minimal',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  });
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [summaryStatus, setSummaryStatus] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [atsCheckedAt, setAtsCheckedAt] = useState('');
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachAdvice, setCoachAdvice] = useState('');
  const [resumeRoast, setResumeRoast] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [realResumeId, setRealResumeId] = useState<string | null>(null);
  const activeStepIndex = Math.max(0, BUILDER_STEPS.findIndex((step) => step.id === activeSection));
  const activeStep = BUILDER_STEPS[activeStepIndex] || BUILDER_STEPS[0];
  const completedSteps = {
    personal: Boolean(resumeData.personalInfo.firstName && resumeData.personalInfo.email),
    summary: Boolean(resumeData.summary.trim()),
    experience: resumeData.experience.some((item) => item.position || item.company || item.bullets.length > 0),
    education: resumeData.education.some((item) => item.institution || item.degree),
    skills: resumeData.skills.length > 0,
    projects: resumeData.projects.length > 0,
    certifications: resumeData.certifications.length > 0,
    languages: resumeData.languages.length > 0,
    ai: Boolean(atsAnalysis || coachAdvice || resumeRoast),
  };
  const completionCount = Object.values(completedSteps).filter(Boolean).length;
  const requiredSectionKeys = ['personal', 'summary', 'experience', 'education', 'skills'] as const;
  const requiredCompletionCount = requiredSectionKeys.filter((key) => completedSteps[key]).length;
  const atsScore = Number(atsAnalysis?.overallScore ?? atsAnalysis?.score ?? 0);
  const hasMetricProof = resumeData.experience.some((item) =>
    item.bullets.some((bullet) => /\d|%|percent|reduced|increased|improved|saved/i.test(bullet))
  );
  const readinessActions = [
    !completedSteps.personal ? 'Add name and email in Personal section.' : '',
    !completedSteps.summary ? 'Generate or write a short professional summary.' : '',
    !completedSteps.experience ? 'Add at least one experience role with impact bullets.' : '',
    completedSteps.experience && !hasMetricProof ? 'Add measurable proof in experience bullets, such as %, time saved, or performance gains.' : '',
    resumeData.skills.length < 6 ? 'Add more role-specific skills from the job description.' : '',
    !completedSteps.projects ? 'Add one project that proves your technical skills.' : '',
    !atsAnalysis ? 'Run ATS Job Match with a job description.' : '',
    Array.isArray(atsAnalysis?.missingKeywords) && atsAnalysis.missingKeywords.length > 0
      ? `Add or address missing keywords: ${atsAnalysis.missingKeywords.slice(0, 3).join(', ')}.`
      : '',
  ].filter(Boolean).slice(0, 5);
  const readinessScore = atsAnalysis
    ? Math.round((atsScore * 0.6) + ((requiredCompletionCount / requiredSectionKeys.length) * 25) + (hasMetricProof ? 15 : 5))
    : Math.round(((requiredCompletionCount / requiredSectionKeys.length) * 70) + (hasMetricProof ? 15 : 5) + (resumeData.projects.length > 0 ? 10 : 0));
  const readinessStatus = readinessScore >= 80
    ? 'Ready to Apply'
    : readinessScore >= 60
      ? 'Almost Ready'
      : 'Needs Work';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    const win = globalThis as any;
    const searchParams = new URLSearchParams(win.location.search);
    const resumeId = searchParams.get('resumeId');
    const shouldPrint = searchParams.get('print') === '1';
    const shouldPreview = searchParams.get('preview') === '1';
    if (shouldPreview) {
      setShowPreview(true);
    }
    if (resumeId) {
      setRealResumeId(resumeId);
      void loadResumeFromApi(resumeId, shouldPrint);
      return;
    }

    loadFromLocalStorage();
  }, [isAuthenticated, isMounted, router]);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        if (realResumeId) {
          void saveResumeToApi({ silent: true });
        } else {
          autosave();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resumeData, isMounted]);

  const loadFromLocalStorage = () => {
    const win = globalThis as any;
    const saved = win?.localStorage.getItem(SCRATCH_DRAFT_KEY);
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved resume');
      }
    }
  };

  const autosave = () => {
    if (realResumeId) {
      return;
    }

    const win = globalThis as any;
    win?.localStorage.setItem(SCRATCH_DRAFT_KEY, JSON.stringify(resumeData));
    setAutosaveStatus('Saved');
    setTimeout(() => setAutosaveStatus(''), 2000);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      return response?.data?.error?.message || response?.data?.message || 'Failed to save resume';
    }
    return error instanceof Error ? error.message : 'Failed to save resume';
  };

  const getResumeTitle = () => {
    const title = resumeData.title.trim();
    const fullName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim();
    return title || (fullName ? `${fullName} Resume` : DEFAULT_RESUME_TITLE);
  };

  const toResumeSections = () => [
    {
      sectionType: 'CONTACT',
      sectionOrder: SECTION_ORDER.CONTACT,
      content: resumeData.personalInfo,
      isVisible: true,
    },
    {
      sectionType: 'SUMMARY',
      sectionOrder: SECTION_ORDER.SUMMARY,
      content: { text: resumeData.summary },
      isVisible: Boolean(resumeData.summary.trim()),
    },
    {
      sectionType: 'EXPERIENCE',
      sectionOrder: SECTION_ORDER.EXPERIENCE,
      content: { items: resumeData.experience },
      isVisible: resumeData.experience.length > 0,
    },
    {
      sectionType: 'EDUCATION',
      sectionOrder: SECTION_ORDER.EDUCATION,
      content: { items: resumeData.education },
      isVisible: resumeData.education.length > 0,
    },
    {
      sectionType: 'SKILLS',
      sectionOrder: SECTION_ORDER.SKILLS,
      content: { items: resumeData.skills },
      isVisible: resumeData.skills.length > 0,
    },
    {
      sectionType: 'PROJECTS',
      sectionOrder: SECTION_ORDER.PROJECTS,
      content: { items: resumeData.projects },
      isVisible: resumeData.projects.length > 0,
    },
    {
      sectionType: 'CERTIFICATIONS',
      sectionOrder: SECTION_ORDER.CERTIFICATIONS,
      content: { items: resumeData.certifications },
      isVisible: resumeData.certifications.length > 0,
    },
    {
      sectionType: 'LANGUAGES',
      sectionOrder: SECTION_ORDER.LANGUAGES,
      content: { items: resumeData.languages },
      isVisible: resumeData.languages.length > 0,
    },
    {
      sectionType: 'CUSTOM',
      sectionOrder: 9,
      content: { template: resumeData.template },
      isVisible: false,
    },
  ];

  const fromResumeSections = (resume: any): ResumeData => {
    const sections = Array.isArray(resume.sections) ? resume.sections : [];
    const byType = new Map(sections.map((section: any) => [section.sectionType, section.content || {}]));

    return {
      title: resume.title || DEFAULT_RESUME_TITLE,
      template: ((byType.get('CUSTOM') as any)?.template || 'minimal') as ResumeData['template'],
      personalInfo: {
        ...resumeData.personalInfo,
        ...(byType.get('CONTACT') as Partial<PersonalInfo> | undefined),
      },
      summary: ((byType.get('SUMMARY') as any)?.text || '') as string,
      experience: ((byType.get('EXPERIENCE') as any)?.items || []) as Experience[],
      education: ((byType.get('EDUCATION') as any)?.items || []) as Education[],
      skills: ((byType.get('SKILLS') as any)?.items || []) as Skill[],
      projects: ((byType.get('PROJECTS') as any)?.items || []) as Project[],
      certifications: ((byType.get('CERTIFICATIONS') as any)?.items || []) as Certification[],
      languages: ((byType.get('LANGUAGES') as any)?.items || []) as Language[],
    };
  };

  const loadResumeFromApi = async (resumeId: string, printAfterLoad = false) => {
    try {
      setSaveStatus('Loading...');
      const data = await apiGet<{ resume: any }>(API_ENDPOINTS.RESUMES.BY_ID(resumeId));
      setResumeData(fromResumeSections(data.resume));
      setSaveStatus('');
      if (printAfterLoad) {
        setTimeout(() => {
          const win = globalThis as any;
          win?.print();
        }, 300);
      }
    } catch (err: unknown) {
      setSaveStatus(getErrorMessage(err));
    }
  };

  const saveResumeToApi = async (options?: { silent?: boolean }): Promise<string | null> => {
    try {
      if (!options?.silent) {
        setSaveStatus('Saving...');
      }
      const title = getResumeTitle();
      let resumeId = realResumeId;

      if (!resumeId) {
        const created = await apiPost<{ resume: any }>(API_ENDPOINTS.RESUMES.BASE, {
          title,
          templateId: 'default',
          isPrimary: false,
        });
        resumeId = created.resume.id;
        setRealResumeId(resumeId);
      }

      if (!resumeId) {
        throw new Error('Failed to create resume');
      }

      const updated = await apiPut<{ resume: any }>(API_ENDPOINTS.RESUMES.BY_ID(resumeId), {
        title,
        sections: toResumeSections(),
      });

      setResumeData((prev) => ({ ...prev, title: updated.resume?.title || title }));
      const win = globalThis as any;
      win?.localStorage.removeItem(SCRATCH_DRAFT_KEY);
      setSaveStatus(options?.silent ? 'Autosaved' : 'Saved to dashboard');
      setTimeout(() => setSaveStatus(''), options?.silent ? 1200 : 2500);

      if (!new URLSearchParams(win.location.search).get('resumeId')) {
        router.replace(`/scratch?resumeId=${resumeId}`);
      }

      return resumeId;
    } catch (err: unknown) {
      setSaveStatus(getErrorMessage(err));
      return null;
    }
  };

  const goToStep = (offset: number) => {
    const nextStep = BUILDER_STEPS[activeStepIndex + offset];
    if (nextStep) {
      setActiveSection(nextStep.id);
    }
  };

  const downloadResume = () => {
    setTimeout(() => {
      const win = globalThis as any;
      win?.print();
    }, 50);
  };

  const shareResume = async () => {
    try {
      const resumeId = await saveResumeToApi();
      if (!resumeId) {
        return;
      }

      const win = globalThis as any;
      const shareUrl = `${win.location.origin}/share/${resumeId}`;
      await win.navigator?.clipboard?.writeText(shareUrl);
      setSaveStatus('Share link copied');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err: unknown) {
      setSaveStatus(getErrorMessage(err));
    }
  };

  const addSuggestedSkill = (name: string) => {
    const exists = resumeData.skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return;
    }

    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now().toString(), name, level: 'Intermediate' }],
    }));
  };

  const ensureSavedResume = async (): Promise<string> => {
    const resumeId = await saveResumeToApi();
    if (!resumeId) {
      throw new Error('Save your resume before using AI tools');
    }
    return resumeId;
  };

  const analyzeResumeForJob = async () => {
    if (!jobDescription.trim()) {
      setAiStatus('Paste a job description first.');
      return;
    }

    try {
      setAiStatus('Analyzing ATS match...');
      const resumeId = await ensureSavedResume();
      const data = await apiPost<{ analysis: any }>(API_ENDPOINTS.AI.ANALYZE_ATS, {
        resumeId,
        jobDescription,
      });
      setAtsAnalysis(data.analysis);
      setAtsCheckedAt(new Date().toLocaleString());
      setAiStatus('ATS analysis ready');
    } catch (err: unknown) {
      setAiStatus(getErrorMessage(err));
    } finally {
      setTimeout(() => setAiStatus(''), 3000);
    }
  };

  const askResumeCoach = async () => {
    if (!coachQuestion.trim()) {
      setAiStatus('Ask the coach a question first.');
      return;
    }

    try {
      setAiStatus('Getting coach advice...');
      const resumeId = await ensureSavedResume();
      const data = await apiPost<{ advice: string }>(API_ENDPOINTS.AI.COACH, {
        resumeId,
        question: coachQuestion,
      });
      setCoachAdvice(data.advice);
      setAiStatus('Advice ready');
    } catch (err: unknown) {
      setAiStatus(getErrorMessage(err));
    } finally {
      setTimeout(() => setAiStatus(''), 3000);
    }
  };

  const roastResume = async () => {
    try {
      setAiStatus('Reviewing resume quality...');
      const resumeId = await ensureSavedResume();
      const data = await apiPost<{ roast: string }>(API_ENDPOINTS.AI.ROAST, { resumeId });
      setResumeRoast(data.roast);
      setAiStatus('Resume quality review ready');
    } catch (err: unknown) {
      const fallbackReview = [
        'Resume Quality Review',
        '',
        'Overall quality score: Pending',
        'High priority: Add measurable outcomes to experience bullets, such as percentages, time saved, performance gains, or user impact.',
        'Medium priority: Remove generic wording and make each section specific to the target job.',
        'Medium priority: Compare skills against the job description and add only honest matching keywords.',
        'Quick fix: Keep the resume concise, proof-driven, and tailored for one job role.',
      ].join('\n');
      setResumeRoast(fallbackReview);
      setAiStatus('AI was slow, so a quick quality review was generated.');
    } finally {
      setTimeout(() => setAiStatus(''), 3000);
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bullets: [],
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const deleteExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const deleteEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate',
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const deleteSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      link: '',
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const deleteProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const deleteCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id),
    }));
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: Date.now().toString(),
      name: '',
      proficiency: 'Intermediate',
    };
    setResumeData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const deleteLanguage = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  };

  const generateSummary = async () => {
    try {
      if (!accessToken) {
        setSummaryStatus('Please login to use AI features.');
        return;
      }

      let resumeId = realResumeId;
      if (!resumeId) {
        resumeId = await saveResumeToApi();
        if (!resumeId) {
          throw new Error('Failed to get resume ID');
        }
      }

      setSummaryStatus('Generating summary...');
      const data = await apiPost<{ summary: string }>(API_ENDPOINTS.AI.GENERATE_SUMMARY, {
        resumeId,
        targetRole: getResumeTitle(),
      });

      if (data.summary) {
        const conciseSummary = data.summary
          .replace(/\s+/g, ' ')
          .split(/(?<=[.!?])\s+/)
          .slice(0, 2)
          .join(' ')
          .trim();
        setResumeData(prev => ({
          ...prev,
          summary: conciseSummary || data.summary,
        }));
        setSummaryStatus('Summary generated.');
      }
    } catch (err: unknown) {
      const role = getResumeTitle().replace(/resume$/i, '').trim() || 'professional';
      const topSkills = resumeData.skills.map((skill) => skill.name).filter(Boolean).slice(0, 5).join(', ');
      const latestExperience = resumeData.experience[0];
      const fallbackSummary = `${role} with experience${latestExperience?.position ? ` as ${latestExperience.position}` : ''}${latestExperience?.company ? ` at ${latestExperience.company}` : ''}. Skilled in ${topSkills || 'modern tools and problem solving'} with a focus on practical outcomes.`;
      setResumeData(prev => ({
        ...prev,
        summary: fallbackSummary,
      }));
      setSummaryStatus(`Quick summary generated because AI was slow. ${getErrorMessage(err)}`);
    } finally {
      setTimeout(() => setSummaryStatus(''), 3000);
    }
  };


  if (!isMounted) {
    return null;
  }

  return (
    <>
    <div className="app-screen min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ResumeReadinessBadge
                score={Math.min(100, readinessScore)}
                status={readinessStatus}
                actionCount={readinessActions.length}
                onOpenAI={() => setActiveSection('ai')}
              />
              {(aiStatus || saveStatus || autosaveStatus) && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {aiStatus || saveStatus || autosaveStatus}
                </span>
              )}
              <button
                onClick={() => void saveResumeToApi()}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save to Dashboard
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={downloadResume}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={() => void shareResume()}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              
              <button
                onClick={() => {
                  const win = globalThis as any;
                  win?.localStorage.removeItem(SCRATCH_DRAFT_KEY);
                  setRealResumeId(null);
                  setResumeData({
                    title: DEFAULT_RESUME_TITLE,
                    template: 'minimal',
                    personalInfo: {
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      location: '',
                      linkedin: '',
                      github: '',
                      website: '',
                    },
                    summary: '',
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: [],
                    languages: [],
                  });
                  win?.alert('Resume cleared');
                }}
                className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Resume title
                </label>
                <input
                  type="text"
                  value={resumeData.title}
                  onChange={(e) => setResumeData(prev => ({ ...prev, title: (e.target as any).value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Frontend Developer Resume, Data Analyst Resume..."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Frontend Developer', 'Backend Engineer', 'Data Analyst', 'Product Manager'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setResumeData((prev) => ({ ...prev, title: `${role} Resume` }))}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minimal', 'modern', 'professional'] as const).map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setResumeData((prev) => ({ ...prev, template }))}
                      className={`rounded-md border px-3 py-2 text-sm font-medium capitalize ${
                        resumeData.template === template
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                  <Bot className="h-4 w-4" />
                  AI tools are built into this form
                </div>
                <p className="mt-1 text-sm text-indigo-700">
                  Save once, then generate summaries, improve bullets, and tailor for job descriptions.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Step {activeStepIndex + 1} of {BUILDER_STEPS.length}
                </p>
                <h2 className="text-lg font-semibold text-slate-950">{activeStep.label}</h2>
                <p className="text-sm text-slate-500">{completionCount} of {BUILDER_STEPS.length} sections have content</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToStep(-1)}
                  disabled={activeStepIndex === 0}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  disabled={activeStepIndex === BUILDER_STEPS.length - 1}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-9">
              {BUILDER_STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveSection(step.id)}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition ${
                    activeSection === step.id
                      ? 'bg-indigo-600 text-white'
                      : completedSteps[step.id as keyof typeof completedSteps]
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {completedSteps[step.id as keyof typeof completedSteps] ? '✓ ' : ''}
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {!showPreview ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-6">
              

              {/* Section Content */}
              <div className="lg:col-span-3 xl:col-span-3">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  {activeSection === 'personal' && (
                    <PersonalInfoSection
                      data={resumeData.personalInfo}
                      onChange={handlePersonalInfoChange}
                    />
                  )}
                  {activeSection === 'summary' && (
                    <SummarySection
                      summary={resumeData.summary}
                      onChange={(value) => setResumeData(prev => ({ ...prev, summary: value }))}
                      onGenerate={generateSummary}
                      status={summaryStatus}
                    />
                  )}
                  {activeSection === 'experience' && (
                    <ExperienceSection
                      experiences={resumeData.experience}
                      onAdd={addExperience}
                      onUpdate={updateExperience}
                      onDelete={deleteExperience}
                    />
                  )}
                  {activeSection === 'education' && (
                    <EducationSection
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onDelete={deleteEducation}
                    />
                  )}
                  {activeSection === 'skills' && (
                    <SkillsSection
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onAddSuggested={addSuggestedSkill}
                      onUpdate={updateSkill}
                      onDelete={deleteSkill}
                      resumeTitle={resumeData.title}
                    />
                  )}
                  {activeSection === 'projects' && (
                    <ProjectsSection
                      projects={resumeData.projects}
                      onAdd={addProject}
                      onUpdate={updateProject}
                      onDelete={deleteProject}
                    />
                  )}
                  {activeSection === 'certifications' && (
                    <CertificationsSection
                      certifications={resumeData.certifications}
                      onAdd={addCertification}
                      onUpdate={updateCertification}
                      onDelete={deleteCertification}
                    />
                  )}
                  {activeSection === 'languages' && (
                    <LanguagesSection
                      languages={resumeData.languages}
                      onAdd={addLanguage}
                      onUpdate={updateLanguage}
                      onDelete={deleteLanguage}
                    />
                  )}
                  {activeSection === 'ai' && (
                    <AIAssistantSection
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                      onAnalyze={analyzeResumeForJob}
                      atsAnalysis={atsAnalysis}
                      coachQuestion={coachQuestion}
                      onCoachQuestionChange={setCoachQuestion}
                      onAskCoach={askResumeCoach}
                      coachAdvice={coachAdvice}
                      onRoast={roastResume}
                      roast={resumeRoast}
                      aiStatus={aiStatus}
                      onAddSuggestedSkill={addSuggestedSkill}
                      readinessScore={Math.min(100, readinessScore)}
                      readinessStatus={readinessStatus}
                      completionCount={completionCount}
                      totalSections={BUILDER_STEPS.length}
                      atsScore={atsScore}
                      hasAtsAnalysis={Boolean(atsAnalysis)}
                      missingKeywordCount={Array.isArray(atsAnalysis?.missingKeywords) ? atsAnalysis.missingKeywords.length : 0}
                      hasMetricProof={hasMetricProof}
                      readinessActions={readinessActions}
                      atsCheckedAt={atsCheckedAt}
                    />
                  )}
                  <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => goToStep(-1)}
                      disabled={activeStepIndex === 0}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      disabled={activeStepIndex === BUILDER_STEPS.length - 1}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <aside className="hidden xl:col-span-3 xl:block">
                <div className="sticky top-20 space-y-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live preview</h3>
                    <button
                      type="button"
                      onClick={downloadResume}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </div>
                  <div className="max-h-[calc(100vh-7rem)] overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-3 shadow-sm">
                    <ResumePreview data={resumeData} />
                  </div>
                  <ResumeReadinessCompactBar
                    score={Math.min(100, readinessScore)}
                    status={readinessStatus}
                    actionCount={readinessActions.length}
                    onOpenAI={() => setActiveSection('ai')}
                  />
                </div>
              </aside>
            </div>
          ) : (
            <div>
              <ResumePreview data={resumeData} />
            </div>
          )}
        </div>
      </main>
    </div>
    <div className="resume-print print-only">
      <ResumePreview data={resumeData} />
    </div>
    </>
  );
}

// Section Components
function getReadinessTone(status: string) {
  if (status === 'Ready to Apply') {
    return {
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-600',
    };
  }

  if (status === 'Almost Ready') {
    return {
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
    };
  }

  return {
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  };
}

function ResumeReadinessBadge({
  score,
  status,
  actionCount,
  onOpenAI,
}: {
  score: number;
  status: string;
  actionCount: number;
  onOpenAI: () => void;
}) {
  const tone = getReadinessTone(status);

  return (
    <button
      type="button"
      onClick={onOpenAI}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.badge}`}
      title="Open AI section for readiness details"
    >
      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
      <span>Readiness {score}%</span>
      <span className="font-medium opacity-80">{actionCount > 0 ? `${actionCount} fixes` : 'Ready'}</span>
    </button>
  );
}

function ResumeReadinessCompactBar({
  score,
  status,
  actionCount,
  onOpenAI,
}: {
  score: number;
  status: string;
  actionCount: number;
  onOpenAI: () => void;
}) {
  const tone = getReadinessTone(status);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resume Readiness</p>
          <p className="text-xs text-slate-500">{actionCount > 0 ? `${actionCount} suggested fixes` : 'Looks ready for final review'}</p>
        </div>
        <button
          type="button"
          onClick={onOpenAI}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Details
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-slate-100">
          <div className={`h-2 rounded-full ${tone.bar}`} style={{ width: `${Math.min(100, score)}%` }} />
        </div>
        <span className="text-sm font-bold text-slate-950">{score}%</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{status}</p>
    </div>
  );
}

function ResumeReadinessPanel({
  score,
  status,
  completionCount,
  totalSections,
  atsScore,
  hasAtsAnalysis,
  missingKeywordCount,
  hasMetricProof,
  actions,
  checkedAt,
}: {
  score: number;
  status: string;
  completionCount: number;
  totalSections: number;
  atsScore: number;
  hasAtsAnalysis: boolean;
  missingKeywordCount: number;
  hasMetricProof: boolean;
  actions: string[];
  checkedAt: string;
}) {
  const statusClass = status === 'Ready to Apply'
    ? 'bg-emerald-100 text-emerald-700'
    : status === 'Almost Ready'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-rose-100 text-rose-700';
  const scoreClass = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-rose-700';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resume Readiness</h3>
          <p className="mt-1 text-sm text-slate-600">Confidence signal before downloading or applying.</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
          {status}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-slate-100 bg-slate-50">
          <span className={`text-2xl font-bold ${scoreClass}`}>{score}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Completion</span>
              <span>{completionCount}/{totalSections}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: `${Math.min(100, (completionCount / totalSections) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Last checked: {checkedAt || 'Run ATS analysis'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">ATS Score</p>
          <p className="font-semibold text-slate-950">{hasAtsAnalysis ? `${atsScore}/100` : 'Not checked'}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Keyword Match</p>
          <p className="font-semibold text-slate-950">{hasAtsAnalysis ? (missingKeywordCount === 0 ? 'Good' : `${missingKeywordCount} missing`) : 'Pending'}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Impact Proof</p>
          <p className="font-semibold text-slate-950">{hasMetricProof ? 'Good' : 'Needs metrics'}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Next fixes</p>
        {actions.length > 0 ? (
          <div className="space-y-2">
            {actions.map((action) => (
              <div key={action} className="flex gap-2 rounded-md border border-slate-100 bg-slate-50 p-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            Looks ready. Download the PDF and do one final visual check.
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalInfoSection({ data, onChange }: { data: PersonalInfo; onChange: (field: keyof PersonalInfo, value: string) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange('firstName', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange('lastName', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="City, State, Country"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input
            type="url"
            value={data.linkedin}
            onChange={(e) => onChange('linkedin', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
          <input
            type="url"
            value={data.github}
            onChange={(e) => onChange('github', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="https://github.com/..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onChange('website', (e.target as any).value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

function SummarySection({
  summary,
  onChange,
  onGenerate,
  status,
}: {
  summary: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  status: string;
}) {
  const isGenerating = status.toLowerCase().includes('generating');
  const summaryIdeas = [
    'Results-driven professional with hands-on experience delivering measurable business impact through modern tools, clear communication, and cross-functional execution.',
    'Detail-oriented candidate skilled at solving complex problems, improving workflows, and translating goals into practical outcomes for fast-moving teams.',
    'Adaptable professional with a strong foundation in project execution, stakeholder collaboration, and continuous improvement across high-priority initiatives.',
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Professional Summary</h2>
        <p className="mt-1 text-sm text-slate-500">Keep it short: target role, key skills, and one value signal.</p>
      </div>
      <div className="rounded-md border border-purple-100 bg-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-900">
          <Sparkles className="h-4 w-4" />
          Quick suggestions
        </div>
        <div className="flex flex-wrap gap-2">
          {summaryIdeas.map((idea, index) => (
            <button
              key={idea}
              type="button"
              onClick={() => onChange(idea)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-100"
            >
              Use summary {index + 1}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => onChange((e.target as any).value)}
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Write a compelling professional summary..."
        />
      </div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGenerating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Sparkles className="h-4 w-4" />}
        {isGenerating ? 'Generating...' : 'Generate with AI'}
      </button>
      {status && (
        <div className={`rounded-md border px-3 py-2 text-sm ${
          isGenerating ? 'border-purple-100 bg-purple-50 text-purple-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}

function ExperienceSection({
  experiences,
  onAdd,
  onUpdate,
  onDelete,
}: {
  experiences: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Experience, value: any) => void;
  onDelete: (id: string) => void;
}) {
  const [bulletSuggestionTarget, setBulletSuggestionTarget] = useState<{ experienceId: string; index: number } | null>(null);
  const [descriptionSuggestionFor, setDescriptionSuggestionFor] = useState<string | null>(null);

  const getRoleContext = (exp: Experience) => {
    const title = exp.position || 'this role';
    const company = exp.company || 'the company';
    return { title, company };
  };

  const getBulletSuggestions = (exp: Experience, bullet: string) => {
    const { title, company } = getRoleContext(exp);
    const base = bullet.trim();

    if (base) {
      return [
        `${base} while improving delivery quality and stakeholder confidence.`,
        `Improved ${base.charAt(0).toLowerCase()}${base.slice(1)} with clearer ownership, measurable outcomes, and faster execution.`,
        `Delivered ${base.charAt(0).toLowerCase()}${base.slice(1)}, resulting in stronger performance and a better user experience.`,
      ];
    }

    return [
      `Delivered key ${title} initiatives at ${company}, improving product quality and team execution.`,
      `Collaborated with cross-functional teams to ship reliable features and improve user-facing workflows.`,
      `Improved operational efficiency by identifying blockers, refining processes, and delivering measurable outcomes.`,
    ];
  };

  const getDescriptionSuggestions = (exp: Experience) => {
    const { title, company } = getRoleContext(exp);

    return [
      `Worked as ${title} at ${company}, contributing to product delivery, cross-functional collaboration, and measurable improvements across core workflows.`,
      `Owned ${title} responsibilities at ${company}, focusing on execution quality, user impact, and reliable delivery in a fast-moving team environment.`,
      `Supported business and product goals at ${company} through strong ${title} execution, clear communication, and practical problem solving.`,
    ];
  };

  const updateBullet = (experienceId: string, index: number, value: string) => {
    const experience = experiences.find((item) => item.id === experienceId);
    if (!experience) return;

    const nextBullets = [...experience.bullets];
    nextBullets[index] = value;
    onUpdate(experienceId, 'bullets', nextBullets);
  };

  const addBullet = (experienceId: string, value = '') => {
    const experience = experiences.find((item) => item.id === experienceId);
    if (!experience) return;

    onUpdate(experienceId, 'bullets', [...experience.bullets, value]);
  };

  const removeBullet = (experienceId: string, index: number) => {
    const experience = experiences.find((item) => item.id === experienceId);
    if (!experience) return;

    onUpdate(experienceId, 'bullets', experience.bullets.filter((_, bulletIndex) => bulletIndex !== index));
    if (bulletSuggestionTarget?.experienceId === experienceId && bulletSuggestionTarget.index === index) {
      setBulletSuggestionTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
		  <small className="mt-1 text-slate-500">Add your relevant experience. Focus on your achievements and the impact you made.</small>
          <p className="mt-1 text-sm text-blue-500">{experiences.length} role{experiences.length === 1 ? '' : 's'} added</p>
        </div>
      </div>
      {experiences.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <p className="text-sm font-medium text-slate-700">No experience added yet.</p>
          <p className="mt-1 text-sm text-slate-500">Add your latest role first, then use AI to sharpen the bullet points.</p>
        </button>
      ) : (
        <div className="space-y-5">
          <div className="relative space-y-5 before:absolute before:left-3 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-slate-200">
            {experiences.map((exp, expIndex) => (
            <div key={exp.id} className="relative pl-8">
              <div className="absolute left-0 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700">
                {expIndex + 1}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {exp.position || 'Untitled role'}
                    {exp.company ? <span className="font-normal text-slate-500"> at {exp.company}</span> : null}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(exp.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => onUpdate(exp.id, 'company', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => onUpdate(exp.id, 'position', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Frontend Developer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => onUpdate(exp.id, 'startDate', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => onUpdate(exp.id, 'current', (e.target as any).checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Current role
                    </label>
                  </div>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => onUpdate(exp.id, 'endDate', (e.target as any).value)}
                    disabled={exp.current}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  />
                </div>
                <details className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">Role description</summary>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDescriptionSuggestionFor(descriptionSuggestionFor === exp.id ? null : exp.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                    >
                      <Sparkles className="h-3 w-3" />
                      Improve with AI
                    </button>
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => onUpdate(exp.id, 'description', (e.target as any).value)}
                    rows={3}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Short context about the team, product, or responsibilities."
                  />
                  {descriptionSuggestionFor === exp.id && (
                    <div className="mt-3 rounded-md border border-purple-100 bg-white p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700">Choose a better description</p>
                      <div className="space-y-2">
                        {getDescriptionSuggestions(exp).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              onUpdate(exp.id, 'description', suggestion);
                              setDescriptionSuggestionFor(null);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-purple-200 hover:bg-purple-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </details>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 md:col-span-2">
                  <div className="mb-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Impact bullet points</label>
                      <p className="text-xs text-slate-500">Use action + metric + outcome where possible.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={`${exp.id}-${bulletIndex}`} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex gap-2">
                          <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                          <textarea
                            value={bullet}
                            onChange={(e) => updateBullet(exp.id, bulletIndex, (e.target as any).value)}
                            rows={2}
                            className="min-h-12 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="Increased conversion by 18% by redesigning the onboarding flow."
                          />
                          <div className="flex shrink-0 flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => removeBullet(exp.id, bulletIndex)}
                              className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                              title="Delete bullet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulletSuggestionTarget({ experienceId: exp.id, index: bulletIndex })}
                              className="rounded-md bg-purple-600 px-2 py-2 text-white hover:bg-purple-700"
                              title="Improve with AI"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {bulletSuggestionTarget?.experienceId === exp.id && bulletSuggestionTarget.index === bulletIndex && (
                          <div className="mt-3 rounded-md border border-purple-100 bg-purple-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700">Choose an AI suggestion</p>
                            <div className="space-y-2">
                              {getBulletSuggestions(exp, bullet).map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => {
                                    updateBullet(exp.id, bulletIndex, suggestion);
                                    setBulletSuggestionTarget(null);
                                  }}
                                  className="w-full rounded-md border border-purple-100 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:border-purple-300 hover:bg-purple-50"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addBullet(exp.id)}
                    className="mt-3 w-full rounded-md border border-dashed border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    Add Bullet Point
                  </button>
                </div>
              </div>
            </div>
            </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Add Another Experience
          </button>
        </div>
      )}
    </div>
  );
}

function EducationSection({ education, onAdd, onUpdate, onDelete }: { education: Education[]; onAdd: () => void; onUpdate: (id: string, field: keyof Education, value: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
        <p className="mt-1 text-sm text-slate-500">Add your educational background.</p>
      </div>
      {education.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <span className="mr-3 text-lg leading-none">+</span>
          Add Education
        </button>
      ) : (
        <div className="space-y-5">
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {edu.degree || 'Education Entry'}
                    {edu.institution ? <span className="font-normal text-slate-500"> at {edu.institution}</span> : null}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {edu.startDate || 'Start Year'} - {edu.endDate || 'End Year'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(edu.id)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                  title="Delete education"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Certificate</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => onUpdate(edu.id, 'degree', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => onUpdate(edu.id, 'field', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
				<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => onUpdate(edu.id, 'institution', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA / CGPA / Percentage</label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => onUpdate(edu.id, 'gpa', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="8.2 CGPA or 76%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    value={edu.startDate}
                    onChange={(e) => onUpdate(edu.id, 'startDate', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="2021"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    value={edu.endDate}
                    onChange={(e) => onUpdate(edu.id, 'endDate', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="2025"
                  />
                </div>
              </div>
            </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Another Education
          </button>
        </div>
      )}
    </div>
  );
}

function SkillsSection({
  skills,
  onAdd,
  onAddSuggested,
  onUpdate,
  onDelete,
  resumeTitle,
}: {
  skills: Skill[];
  onAdd: () => void;
  onAddSuggested: (name: string) => void;
  onUpdate: (id: string, field: keyof Skill, value: string) => void;
  onDelete: (id: string) => void;
  resumeTitle: string;
}) {
  const lowerTitle = resumeTitle.toLowerCase();
  const [skillJobDescription, setSkillJobDescription] = useState('');
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [analysisMessage, setAnalysisMessage] = useState('');

  const roleSkills = lowerTitle.includes('data')
    ? ['SQL', 'Python', 'Power BI', 'Excel', 'Data Visualization', 'Statistics']
    : lowerTitle.includes('backend')
      ? ['Node.js', 'REST APIs', 'PostgreSQL', 'Docker', 'System Design', 'Testing']
      : ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'API Integration', 'Git'];

  const skillLibrary = [
    'React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'Express.js', 'REST APIs',
    'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Docker', 'AWS', 'Git', 'CI/CD',
    'Testing', 'Tailwind CSS', 'Redux', 'HTML', 'CSS', 'Python', 'SQL', 'Excel',
    'Power BI', 'Data Visualization', 'Statistics', 'Machine Learning', 'Communication',
    'Leadership', 'Agile', 'Problem Solving',
  ];

  const normalizeSkill = (value: string) => value.trim().toLowerCase();
  const existingSkillNames = skills.map((skill) => normalizeSkill(skill.name)).filter(Boolean);

  const analyzeSkills = () => {
    const jd = skillJobDescription.toLowerCase();
    if (!jd.trim()) {
      setAnalysisMessage('Paste a job description first.');
      setRecommendedSkills([]);
      setSelectedSkills([]);
      return;
    }

    const matches = skillLibrary.filter((skill) => jd.includes(skill.toLowerCase()));
    const combined = Array.from(new Set([...matches, ...roleSkills]));
    const missing = combined.filter((skill) => !existingSkillNames.includes(normalizeSkill(skill)));

    setRecommendedSkills(missing);
    setSelectedSkills(missing.slice(0, 6));
    setAnalysisMessage(
      missing.length > 0
        ? `${missing.length} useful skills found. Select only the ones you can honestly claim.`
        : 'Your skills already cover the strongest matches found in this job description.'
    );
  };

  const toggleSelectedSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
    );
  };

  const applySelectedSkills = () => {
    selectedSkills.forEach((skill) => onAddSuggested(skill));
    setRecommendedSkills((prev) => prev.filter((skill) => !selectedSkills.includes(skill)));
    setSelectedSkills([]);
    setAnalysisMessage('Selected skills added.');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        <p className="mt-1 text-sm text-slate-500">Optimize skills against a job description, then add the matching ones.</p>
      </div>

      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bot className="h-4 w-4 text-indigo-600" />
          Job Match Analysis
        </div>
        <textarea
          value={skillJobDescription}
          onChange={(e) => setSkillJobDescription((e.target as any).value)}
          rows={5}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Paste job description here to find missing skills and keywords..."
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={analyzeSkills}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            Analyze & Optimize Resume
          </button>
          {analysisMessage && <p className="text-sm text-slate-600">{analysisMessage}</p>}
        </div>

        {recommendedSkills.length > 0 && (
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended skills</p>
              <button
                type="button"
                onClick={applySelectedSkills}
                disabled={selectedSkills.length === 0}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Selected
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedSkills.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSelectedSkill(skill)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Added skills</h3>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Add Custom Skill
          </button>
        </div>
        {skills.length === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            + Add your first skill manually or use Job Match Analysis above.
          </button>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_40px] md:items-end">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => onUpdate(skill.id, 'name', (e.target as any).value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="React"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(skill.id)}
                    className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                    title="Delete skill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectsSection({ projects, onAdd, onUpdate, onDelete }: { projects: Project[]; onAdd: () => void; onUpdate: (id: string, field: keyof Project, value: string) => void; onDelete: (id: string) => void }) {
  const [descriptionSuggestionFor, setDescriptionSuggestionFor] = useState<string | null>(null);

  const getProjectDescriptionSuggestions = (project: Project) => {
    const name = project.name || 'this project';
    const technologies = project.technologies || 'modern tools';

    return [
      `Built ${name} using ${technologies}, focusing on clean user experience, reliable functionality, and maintainable implementation.`,
      `Developed ${name} to solve a practical problem, applying ${technologies} and improving usability through focused design decisions.`,
      `Created ${name} with ${technologies}, delivering core features, responsive UI, and a polished workflow from idea to implementation.`,
    ];
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <p className="mt-1 text-sm text-slate-500">Add projects that prove your skills with real outcomes.</p>
      </div>
      {projects.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <span className="mr-3 text-lg leading-none">+</span>
          Add Project
        </button>
      ) : (
        <div className="space-y-5">
          <div className="relative space-y-4 before:absolute before:left-3 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-slate-200">
            {projects.map((project, projectIndex) => (
              <div key={project.id} className="relative pl-8">
                <div className="absolute left-0 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700">
                  {projectIndex + 1}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{project.name || 'Project Entry'}</h3>
                  {project.technologies && <p className="mt-1 text-xs text-slate-500">{project.technologies}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(project.id)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => onUpdate(project.id, 'name', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Portfolio Website"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button
                      type="button"
                      onClick={() => setDescriptionSuggestionFor(descriptionSuggestionFor === project.id ? null : project.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                    >
                      <Sparkles className="h-3 w-3" />
                      Improve with AI
                    </button>
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) => onUpdate(project.id, 'description', (e.target as any).value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Briefly explain what you built, why it matters, and the impact."
                  />
                  {descriptionSuggestionFor === project.id && (
                    <div className="mt-3 rounded-md border border-purple-100 bg-purple-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700">Choose an AI suggestion</p>
                      <div className="space-y-2">
                        {getProjectDescriptionSuggestions(project).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              onUpdate(project.id, 'description', suggestion);
                              setDescriptionSuggestionFor(null);
                            }}
                            className="w-full rounded-md border border-purple-100 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:border-purple-300 hover:bg-purple-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                  <input
                    type="text"
                    value={project.technologies}
                    onChange={(e) => onUpdate(project.id, 'technologies', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => onUpdate(project.id, 'link', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Another Project
          </button>
        </div>
      )}
    </div>
  );
}

function CertificationsSection({ certifications, onAdd, onUpdate, onDelete }: { certifications: Certification[]; onAdd: () => void; onUpdate: (id: string, field: keyof Certification, value: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
        <p className="mt-1 text-sm text-slate-500">Add certifications, courses, or credentials that support this role.</p>
      </div>
      {certifications.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <span className="mr-3 text-lg leading-none">+</span>
          Add Certification
        </button>
      ) : (
        <div className="space-y-5">
          <div className="relative space-y-4 before:absolute before:left-3 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-slate-200">
            {certifications.map((cert, certIndex) => (
              <div key={cert.id} className="relative pl-8">
                <div className="absolute left-0 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700">
                  {certIndex + 1}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{cert.name || 'Certification Entry'}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {cert.issuer || 'Issuer'}{cert.date ? ` · ${cert.date}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(cert.id)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                  title="Delete certification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => onUpdate(cert.id, 'name', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="AWS Certified Cloud Practitioner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => onUpdate(cert.id, 'issuer', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="month"
                    value={cert.date}
                    onChange={(e) => onUpdate(cert.id, 'date', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <details className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">Credential ID / URL optional</summary>
                  <input
                    type="text"
                    value={cert.credentialId}
                    onChange={(e) => onUpdate(cert.id, 'credentialId', (e.target as any).value)}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Credential ID or certificate link"
                  />
                </details>
              </div>
            </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Another Certification
          </button>
        </div>
      )}
    </div>
  );
}

function LanguagesSection({ languages, onAdd, onUpdate, onDelete }: { languages: Language[]; onAdd: () => void; onUpdate: (id: string, field: keyof Language, value: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
        <p className="mt-1 text-sm text-slate-500">Add spoken or written languages relevant to the role.</p>
      </div>
      {languages.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <span className="mr-3 text-lg leading-none">+</span>
          Add Language
        </button>
      ) : (
        <div className="space-y-5">
          <div className="space-y-4">
            {languages.map((lang) => (
              <div key={lang.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{lang.name || 'Language Entry'}</h3>
                  <p className="mt-1 text-xs text-slate-500">{lang.proficiency || 'Proficiency'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(lang.id)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-600 hover:bg-rose-50"
                  title="Delete language"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => onUpdate(lang.id, 'name', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                  <select
                    value={lang.proficiency}
                    onChange={(e) => onUpdate(lang.id, 'proficiency', (e.target as any).value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Professional">Professional</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                </div>
              </div>
            </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Another Language
          </button>
        </div>
      )}
    </div>
  );
}

function AIAssistantSection({
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  atsAnalysis,
  coachQuestion,
  onCoachQuestionChange,
  onAskCoach,
  coachAdvice,
  onRoast,
  roast,
  aiStatus,
  onAddSuggestedSkill,
  readinessScore,
  readinessStatus,
  completionCount,
  totalSections,
  atsScore,
  hasAtsAnalysis,
  missingKeywordCount,
  hasMetricProof,
  readinessActions,
  atsCheckedAt,
}: {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  atsAnalysis: any;
  coachQuestion: string;
  onCoachQuestionChange: (value: string) => void;
  onAskCoach: () => void;
  coachAdvice: string;
  onRoast: () => void;
  roast: string;
  aiStatus: string;
  onAddSuggestedSkill: (name: string) => void;
  readinessScore: number;
  readinessStatus: string;
  completionCount: number;
  totalSections: number;
  atsScore: number;
  hasAtsAnalysis: boolean;
  missingKeywordCount: number;
  hasMetricProof: boolean;
  readinessActions: string[];
  atsCheckedAt: string;
}) {
  const score = atsAnalysis?.overallScore ?? atsAnalysis?.score ?? 0;
  const reviewLines = roast
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^resume quality review$/i.test(line));
  const qualityScore = reviewLines.find((line) => /^overall quality score:/i.test(line));
  const reviewItems = reviewLines.filter((line) => !/^overall quality score:/i.test(line));
  const coachBlocks = coachAdvice
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const cleanMarkdown = (line: string) =>
    line
      .replace(/^\*\s+/, '')
      .replace(/^[-•]\s+/, '')
      .replace(/\*\*/g, '')
      .trim();
  const isCoachHeading = (line: string) => /^\*\*.*\*\*:?\s*$/.test(line) || /^\d+\.\s+/.test(line);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-700">
          <Bot className="h-5 w-5" />
          <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Save your resume, then use AI to tailor it for a role, improve content, and get focused feedback.
        </p>
      </div>

      {aiStatus && (
        <div className="rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800">
          {aiStatus}
        </div>
      )}

      <ResumeReadinessPanel
        score={readinessScore}
        status={readinessStatus}
        completionCount={completionCount}
        totalSections={totalSections}
        atsScore={atsScore}
        hasAtsAnalysis={hasAtsAnalysis}
        missingKeywordCount={missingKeywordCount}
        hasMetricProof={hasMetricProof}
        actions={readinessActions}
        checkedAt={atsCheckedAt}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-slate-950">ATS Job Match</h3>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange((e.target as any).value)}
            rows={7}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste the job description here..."
          />
          <button
            type="button"
            onClick={onAnalyze}
            className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Analyze ATS Match
          </button>

          {atsAnalysis && (
            <div className="mt-4 rounded-md bg-white p-4 text-sm shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Overall score</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">{score}%</span>
              </div>
              {Array.isArray(atsAnalysis.missingKeywords) && atsAnalysis.missingKeywords.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 font-medium text-slate-700">Missing keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {atsAnalysis.missingKeywords.map((keyword: string) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => onAddSuggestedSkill(keyword)}
                        className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                      >
                        + 
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(atsAnalysis.suggestions) && atsAnalysis.suggestions.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-slate-700">
                  {atsAnalysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={`${suggestion}-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-3 font-semibold text-slate-950">Resume Coach</h3>
            <textarea
              value={coachQuestion}
              onChange={(e) => onCoachQuestionChange((e.target as any).value)}
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Ask: How can I improve this for a frontend developer role?"
            />
            <button
              type="button"
              onClick={onAskCoach}
              className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Get Advice
            </button>
            {coachAdvice && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="space-y-3">
                  {coachBlocks.map((line, index) => {
                    const heading = isCoachHeading(line);
                    return (
                      <div
                        key={`${line}-${index}`}
                        className={heading ? 'rounded-md bg-white px-3 py-2 font-semibold text-slate-950' : 'flex gap-2 rounded-md bg-white p-3 text-slate-700'}
                      >
                        {heading ? (
                          cleanMarkdown(line)
                        ) : (
                          <>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                            <span>{cleanMarkdown(line)}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-2 font-semibold text-slate-950">Resume Quality Review</h3>
            <p className="mb-3 text-sm text-slate-500">Get a practical checklist for weak sections, generic wording, missing proof, and quick fixes.</p>
            <button
              type="button"
              onClick={onRoast}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Review My Resume
            </button>
            {roast && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                {qualityScore && (
                  <div className="mb-3 rounded-md bg-white px-3 py-2 font-semibold text-slate-900">
                    {qualityScore}
                  </div>
                )}
                <div className="space-y-2">
                  {reviewItems.map((item, index) => {
                    const isHigh = item.toLowerCase().startsWith('high priority');
                    const isMedium = item.toLowerCase().startsWith('medium priority');
                    const isQuick = item.toLowerCase().startsWith('quick fix');
                    return (
                      <div key={`${item}-${index}`} className="flex gap-2 rounded-md bg-white p-3 text-slate-700">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isHigh ? 'text-rose-600' : isMedium ? 'text-amber-600' : isQuick ? 'text-indigo-600' : 'text-emerald-600'
                        }`} />
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  const theme = {
    minimal: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border border-slate-100',
      header: 'text-center border-b border-slate-200 pb-6 mb-6',
      name: 'text-3xl font-bold text-slate-950',
      heading: 'text-sm font-bold uppercase tracking-wide text-slate-950 border-b border-slate-200 pb-1 mb-3',
      chip: 'rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700',
    },
    modern: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border-t-8 border-cyan-600',
      header: 'text-left border-b border-cyan-100 pb-6 mb-6',
      name: 'text-4xl font-extrabold text-slate-950',
      heading: 'text-sm font-bold uppercase tracking-wide text-cyan-700 mb-3',
      chip: 'rounded-md bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800',
    },
    professional: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border border-slate-300',
      header: 'text-left bg-slate-900 px-6 py-5 text-white -m-8 mb-6 rounded-t-lg',
      name: 'text-3xl font-bold text-white',
      heading: 'text-base font-bold text-slate-950 border-l-4 border-slate-900 pl-3 mb-3',
      chip: 'rounded-sm bg-slate-900 px-3 py-1 text-sm text-white',
    },
  }[data.template];

  const contactTextClass = data.template === 'professional' ? 'text-slate-200' : 'text-slate-600';
  const linkClass = data.template === 'professional' ? 'text-cyan-200' : 'text-blue-600';
  const sectionTitle = (label: string) => <h2 className={theme.heading}>{label}</h2>;

  return (
    <div className={theme.shell}>
      {/* Header */}
      <div className={theme.header}>
        <h1 className={theme.name}>
          {`${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim() || data.title || 'Your Name'}
        </h1>
        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm ${contactTextClass}`}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} className={linkClass}>LinkedIn</a>}
          {data.personalInfo.github && <a href={data.personalInfo.github} className={linkClass}>GitHub</a>}
          {data.personalInfo.website && <a href={data.personalInfo.website} className={linkClass}>Website</a>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          {sectionTitle('Professional Summary')}
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Experience')}
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <span className="text-gray-600 text-sm">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <p className="text-gray-700">{exp.company}</p>
              {exp.description && <p className="text-gray-600 mt-1">{exp.description}</p>}
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-gray-700">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Education')}
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                <span className="text-gray-600 text-sm">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p className="text-gray-700">{edu.institution}</p>
              {edu.gpa && <p className="text-gray-600 text-sm">GPA / CGPA / Percentage: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Skills')}
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill.id} className={theme.chip}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Projects')}
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              {project.technologies && <p className="text-gray-600 text-sm">{project.technologies}</p>}
              <p className="text-gray-700 mt-1">{project.description}</p>
              {project.link && <a href={project.link} className="text-blue-600 text-sm">View Project</a>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Certifications')}
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <span className="text-gray-900">{cert.name}</span>
              <span className="text-gray-600"> - {cert.issuer}</span>
              <span className="text-gray-600 text-sm"> ({cert.date})</span>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Languages')}
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <span key={lang.id} className={theme.chip}>
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
