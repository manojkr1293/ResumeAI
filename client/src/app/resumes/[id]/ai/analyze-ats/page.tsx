'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type SectionWiseSuggestions = {
  professionalSummary?: string[];
  skills?: string[];
  experience?: string[];
  education?: string[];
  projects?: string[];
  formatting?: string[];
};

type ATSWorkflowAnalysis = {
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
    sectionWiseSuggestions?: SectionWiseSuggestions;
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

const WORKFLOW_STEPS = [
  'Resume Upload',
  'ATS Score',
  'Resume Rewrite',
  'LinkedIn Profile Optimization',
  'Cover Letter',
  'Interview Questions',
  'Email to Recruiter',
];

function getItems(items?: string[]) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function ListBlock({
  items,
  emptyText = 'No items returned.',
}: {
  items?: string[];
  emptyText?: string;
}) {
  const safeItems = getItems(items);

  if (safeItems.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {safeItems.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-gray-700">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChipList({
  items,
  tone = 'indigo',
}: {
  items?: string[];
  tone?: 'indigo' | 'red' | 'green' | 'slate';
}) {
  const safeItems = getItems(items);
  const toneClass = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }[tone];

  if (safeItems.length === 0) {
    return <p className="text-sm text-gray-500">No keywords returned.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {safeItems.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function TextPanel({
  text,
  emptyText = 'No content returned.',
}: {
  text?: string;
  emptyText?: string;
}) {
  if (!text?.trim()) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-gray-800">
      {text}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-200 py-8 first:border-t-0 first:pt-0">
      <h2 className="mb-4 text-xl font-semibold text-gray-950">{title}</h2>
      {children}
    </section>
  );
}

export default function ATSAnalysisPage() {
  const params = useParams();
  const resumeId = params.id as string;

  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSWorkflowAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scoreCards = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return [
      ['ATS Match Score', analysis.atsAnalysis?.atsMatchScore ?? analysis.overallScore ?? 0],
      ['Keyword Score', analysis.keywordScore ?? 0],
      ['Format Score', analysis.formatScore ?? 0],
      ['Impact Score', analysis.impactScore ?? 0],
      ['Readability Score', analysis.readabilityScore ?? 0],
    ];
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/api/v1/ai/analyze-ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || 'Failed to analyze ATS');
      }

      setAnalysis(data?.data?.analysis || data?.analysis || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-950">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-950">Optimize Saved Resume</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Paste the target job description to generate an ATS analysis, optimized resume content,
            LinkedIn profile copy, a cover letter, interview questions, and a recruiter email.
          </p>
        </div>

        <div className="mb-6 overflow-x-auto rounded-md border border-gray-200 bg-white p-3">
          <div className="flex min-w-max items-center gap-2">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {step}
                </span>
                {index < WORKFLOW_STEPS.length - 1 && <span className="text-gray-300">/</span>}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-md border border-gray-200 bg-white p-6">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Target Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={12}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm leading-6 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste the full target job description here..."
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Generating Workflow...' : 'Generate Career Workflow'}
          </button>
        </div>

        {analysis && (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <ResultSection title="ATS Analysis">
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {scoreCards.map(([label, score]) => (
                  <div key={label} className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-950">{score}%</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Missing Keywords</h3>
                  <ChipList
                    items={analysis.atsAnalysis?.missingKeywords || analysis.missingKeywords}
                    tone="red"
                  />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Matching Keywords</h3>
                  <ChipList items={analysis.atsAnalysis?.matchingKeywords} tone="green" />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Skill Gap Analysis</h3>
                  <ListBlock items={analysis.atsAnalysis?.skillGapAnalysis} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Recommendations</h3>
                  <ListBlock items={analysis.suggestions} />
                </div>
              </div>
            </ResultSection>

            <ResultSection title="Resume Strengths And Weaknesses">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Strengths</h3>
                  <ListBlock items={analysis.atsAnalysis?.resumeStrengths} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Weaknesses</h3>
                  <ListBlock items={analysis.atsAnalysis?.resumeWeaknesses} />
                </div>
              </div>
            </ResultSection>

            <ResultSection title="Section-Wise Improvement Suggestions">
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(analysis.atsAnalysis?.sectionWiseSuggestions || {}).map(
                  ([section, items]) => (
                    <div key={section}>
                      <h3 className="mb-3 text-sm font-semibold capitalize text-gray-950">
                        {section.replace(/([A-Z])/g, ' $1')}
                      </h3>
                      <ListBlock items={items} />
                    </div>
                  ),
                )}
              </div>
            </ResultSection>

            <ResultSection title="ATS Optimized Resume Content">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Professional Summary</h3>
                  <TextPanel text={analysis.optimizedResumeContent?.professionalSummary} />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-950">Technical Skills</h3>
                    <ChipList
                      items={analysis.optimizedResumeContent?.skillsSection?.technicalSkills}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-950">Soft Skills</h3>
                    <ChipList
                      items={analysis.optimizedResumeContent?.skillsSection?.softSkills}
                      tone="slate"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-950">Tools</h3>
                    <ChipList
                      items={analysis.optimizedResumeContent?.skillsSection?.tools}
                      tone="slate"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">
                    Experience Bullet Points
                  </h3>
                  <ListBlock items={analysis.optimizedResumeContent?.experienceBulletPoints} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">
                    Keywords To Add Naturally
                  </h3>
                  <ChipList items={analysis.optimizedResumeContent?.keywordsToAddNaturally} />
                </div>
              </div>
            </ResultSection>

            <ResultSection title="LinkedIn Optimization">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">Headline Variations</h3>
                  <ListBlock items={analysis.linkedinOptimization?.headlineVariations} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">About Section</h3>
                  <TextPanel text={analysis.linkedinOptimization?.aboutSection} />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-950">Top 20 Skills</h3>
                    <ChipList items={analysis.linkedinOptimization?.topSkills} />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-950">
                      Recruiter-Friendly Keywords
                    </h3>
                    <ChipList
                      items={analysis.linkedinOptimization?.recruiterFriendlyKeywords}
                      tone="green"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-950">
                    Featured Achievement Highlights
                  </h3>
                  <ListBlock items={analysis.linkedinOptimization?.featuredAchievementHighlights} />
                </div>
              </div>
            </ResultSection>

            <ResultSection title="Cover Letter">
              <TextPanel text={analysis.coverLetter} />
            </ResultSection>

            <ResultSection title="Interview Questions">
              <ListBlock items={analysis.interviewQuestions} />
            </ResultSection>

            <ResultSection title="Email To Recruiter">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-950">Subject</h3>
                  <TextPanel text={analysis.emailToRecruiter?.subject} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-950">Body</h3>
                  <TextPanel text={analysis.emailToRecruiter?.body} />
                </div>
              </div>
            </ResultSection>
          </div>
        )}
      </main>
    </div>
  );
}
