'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Download, Link as LinkIcon, Loader2 } from 'lucide-react';
import { ResumePreview, type ResumePreviewData } from '@/components/resume/resume-preview';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

const emptyResume: ResumePreviewData = {
  title: 'Shared Resume',
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
};

function contentByType(sections: any[], type: string) {
  return sections.find((section) => section.sectionType === type)?.content || {};
}

function resumeFromSections(resume: any): ResumePreviewData {
  const sections = Array.isArray(resume.sections) ? resume.sections : [];
  const contact = contentByType(sections, 'CONTACT');
  const summary = contentByType(sections, 'SUMMARY');
  const experience = contentByType(sections, 'EXPERIENCE');
  const education = contentByType(sections, 'EDUCATION');
  const skills = contentByType(sections, 'SKILLS');
  const projects = contentByType(sections, 'PROJECTS');
  const certifications = contentByType(sections, 'CERTIFICATIONS');
  const languages = contentByType(sections, 'LANGUAGES');
  const custom = contentByType(sections, 'CUSTOM');

  return {
    ...emptyResume,
    title: resume.title || emptyResume.title,
    template: custom.template || 'minimal',
    personalInfo: { ...emptyResume.personalInfo, ...contact },
    summary: summary.text || '',
    experience: experience.items || [],
    education: education.items || [],
    skills: skills.items || [],
    projects: projects.items || [],
    certifications: certifications.items || [],
    languages: languages.items || [],
  };
}

export default function SharedResumePage() {
  const params = useParams<{ id: string }>();
  const [resume, setResume] = useState<ResumePreviewData | null>(null);
  const [status, setStatus] = useState('Loading resume...');

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await apiGet<{ resume: any }>(API_ENDPOINTS.RESUMES.PUBLIC(params.id));
        setResume(resumeFromSections(data.resume));
        setStatus('');
      } catch {
        setStatus('This shared resume could not be opened.');
      }
    };

    if (params.id) {
      void loadResume();
    }
  }, [params.id]);

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setStatus('Share link copied');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="no-print mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
          ResumeAI
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>

      {status && (
        <div className="no-print mx-auto mb-4 flex max-w-5xl items-center gap-2 px-4 text-sm text-slate-600">
          {!resume && status.includes('Loading') && <Loader2 className="h-4 w-4 animate-spin" />}
          {status}
        </div>
      )}

      {resume && (
        <div className="resume-print px-4 pb-10">
          <ResumePreview data={resume} />
        </div>
      )}
    </main>
  );
}
