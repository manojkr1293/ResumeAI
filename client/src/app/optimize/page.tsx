'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Sparkles, Sun, Moon, CheckCircle2, ChevronRight, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import WizardStepper from '@/components/WizardStepper';
import DragDropUpload from '@/components/DragDropUpload';
import ResumePreview from '@/components/ResumePreview';

// Import design styles
import "./styles/designTokens.css";
import "./styles/glassCard.css";
import "./styles/animations.css";

const getErrorMessage = (error: any): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return (error as any).message;
  return 'An unexpected error occurred';
};



type WorkflowAnalysis = {
  overallScore?: number;
  keywordScore?: number;
  formatScore?: number;
  impactScore?: number;
  readabilityScore?: number;
  missingKeywords?: string[];
  suggestions?: string[];
  atsAnalysis?: {
    atsMatchScore?: number;
    missingKeywords?: string[];
    matchingKeywords?: string[];
    skillGapAnalysis?: string[];
    resumeStrengths?: string[];
    resumeWeaknesses?: string[];
    sectionWiseSuggestions?: Record<string, string[]>;
  };
  optimizedResumeContent?: {
    professionalSummary?: string;
    skillsSection?: {
      technicalSkills?: string[];
      softSkills?: string[];
      tools?: string[];
    };
    experienceBulletPoints?: string[];
    keywordsToAddNaturally?: string[];
  };
  linkedinOptimization?: {
    headlineVariations?: string[];
    aboutSection?: string;
    topSkills?: string[];
    featuredAchievementHighlights?: string[];
    recruiterFriendlyKeywords?: string[];
  };
  coverLetter?: string;
  interviewQuestions?: string[];
  emailToRecruiter?: {
    subject?: string;
    body?: string;
  };
};

export default function OptimizeResumePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMounted, setIsMounted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Detect system preference on mount
  useEffect(() => {
    setIsMounted(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    setTheme(stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light');
  }, []);

  // Apply theme class to html element
  useEffect(() => {
    if (!isMounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isMounted, router]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleOptimize = async () => {
    if (!resumeFile && !resumeText.trim()) {
      setError('Upload a resume or paste resume text first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Paste the target job description first.');
      return;
    }
    const formData = new FormData();
    if (resumeFile) formData.append('resumeFile', resumeFile);
    formData.append('resumeText', resumeText);
    formData.append('jobDescription', jobDescription);
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.post(API_ENDPOINTS.AI.OPTIMIZE_UPLOADED_RESUME, formData, { timeout: 120000 });      const analysisData = (response.data as any)?.data?.analysis || null;
      setAnalysis(analysisData);
      const id = `rpt-${Date.now()}`;
      sessionStorage.setItem(`resumeReport:${id}`, JSON.stringify(analysisData));
      router.push(`/optimize/results?id=${encodeURIComponent(id)}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4 fade-in">
            <DragDropUpload setResumeFile={setResumeFile} setResumeText={setResumeText} />
            {resumeText && <ResumePreview text={resumeText} setText={setResumeText} />}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 fade-in">
            <label className="block text-sm font-medium text-slate-300">Target Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/40 text-slate-200 p-3.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-md outline-none transition duration-200 font-sans text-sm"
              placeholder="Paste the full job description here to analyze and target key requirements..."
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 fade-in">
            <div className="p-4 bg-slate-950/45 rounded-xl border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <div className="text-sm">
                  <span className="font-semibold text-slate-200 block">Resume Data Ready</span>
                  <span className="text-xs text-slate-400">
                    {resumeFile ? `File: ${resumeFile.name}` : `Pasted text (${resumeText.substring(0, 40)}...)`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-800/60 pt-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div className="text-sm">
                  <span className="font-semibold text-slate-200 block">Job Description Ready</span>
                  <span className="text-xs text-slate-400">
                    {jobDescription.substring(0, 60)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-550 text-white font-bold px-8 py-4 text-base shadow-lg shadow-indigo-500/25 transition duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none min-w-[220px]"
              >
                <Sparkles className={`h-5 w-5 ${loading ? 'animate-spin text-sky-200' : 'animate-pulse text-yellow-300'}`} />
                {loading ? 'Optimizing Resume...' : 'Analyze & Optimize'}
              </button>
              <p className="text-xxs text-slate-500 text-center max-w-sm">
                This takes up to a minute. We parse your text, compare keywords, and draft optimized bullet points, a cover letter, and interview prep.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 pb-12 transition-colors duration-500">
      

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 tracking-tight">
            Job‑Specific Optimization
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Upload your resume and the target job description to get a complete ATS gap-analysis, rewrite suggestions, LinkedIn optimization, and recruiter email.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-start gap-3 shadow-lg shadow-rose-950/10 animate-shake">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-card p-6 border border-slate-800/80 shadow-2xl rounded-2xl bg-slate-900/20 backdrop-blur-md">
          <WizardStepper
            steps={['Upload Resume', 'Job Description', 'Review & Optimize']}
            currentStep={step}
            onNext={() => setStep((s) => Math.min(s + 1, 2))}
            onBack={() => setStep((s) => Math.max(s - 1, 0))}
          >
            {renderStep()}
          </WizardStepper>
        </div>
      </div>
    </main>
  );
}

