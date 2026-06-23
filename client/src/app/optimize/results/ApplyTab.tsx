"use client"
import React, { useState } from "react"
import { Mail, FileText, HelpCircle, Copy, Check, Terminal } from "lucide-react"

type Props = {
  data: any
}

export default function ApplyTab({ data }: Props) {
  const coverLetter = data?.coverLetter || ""
  const emailSubject = data?.emailToRecruiter?.subject || "Application for Software Engineer"
  const emailBody = data?.emailToRecruiter?.body || "Dear Recruiting Team..."
  const interviewQuestions = data?.interviewQuestions || []

  const [copiedCover, setCopiedCover] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedQuesIdx, setCopiedQuesIdx] = useState<number | null>(null)

  const handleCopy = async (text: string, type: 'cover' | 'email' | 'subject' | number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'cover') {
        setCopiedCover(true)
        setTimeout(() => setCopiedCover(false), 2000)
      } else if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else if (type === 'subject') {
        setCopiedSubject(true)
        setTimeout(() => setCopiedSubject(false), 2000)
      } else if (typeof type === 'number') {
        setCopiedQuesIdx(type)
        setTimeout(() => setCopiedQuesIdx(null), 2000)
      }
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Cover Letter */}
      {coverLetter && (
        <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <h4 className="font-semibold text-slate-200">Tailored Cover Letter</h4>
            </div>
            <button
              onClick={() => handleCopy(coverLetter, 'cover')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition"
            >
              {copiedCover ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Cover Letter</span>
                </>
              )}
            </button>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-5 rounded-xl border border-slate-900/60 shadow-inner whitespace-pre-line max-h-[400px] overflow-y-auto">
            {coverLetter}
          </div>
        </div>
      )}

      {/* Recruiter outreach email template */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-400" />
            <h4 className="font-semibold text-slate-200">Recruiter Outreach Email</h4>
          </div>
          <button
            onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`, 'email')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition"
          >
            {copiedEmail ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Full Email!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Full Email</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* Email Subject Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-sky-400" />
              <span>SUBJECT:</span>
              <span className="font-mono text-slate-200 select-all">{emailSubject}</span>
            </div>
            <button
              onClick={() => handleCopy(emailSubject, 'subject')}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xxs font-bold rounded transition border border-slate-700/60"
            >
              {copiedSubject ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          {/* Email Body */}
          <div className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 shadow-inner whitespace-pre-line">
            {emailBody}
          </div>
        </div>
      </div>

      {/* Interview Prep Questions */}
      {interviewQuestions.length > 0 && (
        <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
            <HelpCircle className="h-5 w-5 text-pink-400" />
            <h4 className="font-semibold text-slate-200">Suggested Interview Preparation</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Prepare tailored talking points for these potential interview questions:
          </p>
          <div className="space-y-3">
            {interviewQuestions.map((q: string, idx: number) => (
              <div 
                key={idx} 
                className="flex items-start justify-between gap-4 p-3 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-slate-700/60 transition"
              >
                <div className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold mt-0.5 flex-shrink-0">
                    ?
                  </span>
                  <span>{q}</span>
                </div>
                <button
                  onClick={() => handleCopy(q, idx)}
                  className="p-1.5 bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition flex-shrink-0"
                >
                  {copiedQuesIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}