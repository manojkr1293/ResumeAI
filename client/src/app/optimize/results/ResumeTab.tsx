"use client"
import React, { useState } from "react"
import { FileText, Copy, Check, Briefcase, ListTodo, Award } from "lucide-react"

type Props = {
  data: any
}

export default function ResumeTab({ data }: Props) {
  const summary = data?.optimizedResumeContent?.professionalSummary || ""
  const bullets = data?.optimizedResumeContent?.experienceBulletPoints || []
  const skills = data?.optimizedResumeContent?.skillsSection || {}

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedSummary, setCopiedSummary] = useState(false)

  const handleCopy = async (text: string, index: number | 'summary') => {
    try {
      await navigator.clipboard.writeText(text)
      if (index === 'summary') {
        setCopiedSummary(true)
        setTimeout(() => setCopiedSummary(false), 2000)
      } else {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      }
    } catch (e) {
      console.error("Failed to copy", e)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Professional Summary */}
      {summary && (
        <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <h4 className="font-semibold text-slate-200">Optimized Professional Summary</h4>
            </div>
            <button
              onClick={() => handleCopy(summary, 'summary')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition duration-200"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans mt-2 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 shadow-inner">
            {summary}
          </p>
        </div>
      )}

      {/* Experience Bullet Improvements */}
      {bullets.length > 0 && (
        <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
            <Briefcase className="h-5 w-5 text-sky-400" />
            <h4 className="font-semibold text-slate-200">Optimized Experience Bullet Points</h4>
          </div>
          <div className="space-y-3">
            {bullets.map((bullet: string, idx: number) => (
              <div 
                key={idx} 
                className="flex items-start justify-between gap-4 p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 rounded-xl hover:border-slate-700/60 transition"
              >
                <div className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{bullet}</span>
                </div>
                <button
                  onClick={() => handleCopy(bullet, idx)}
                  className="p-2 bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition flex-shrink-0"
                  title="Copy bullet point"
                >
                  {copiedIndex === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Optimization Section */}
      {Object.keys(skills).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Technical Skills */}
          {Array.isArray(skills.technicalSkills) && skills.technicalSkills.length > 0 && (
            <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-3 text-sky-400 font-semibold text-sm">
                <ListTodo className="h-4.5 w-4.5" />
                <h5>Technical Skills</h5>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.technicalSkills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {Array.isArray(skills.softSkills) && skills.softSkills.length > 0 && (
            <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-3 text-purple-400 font-semibold text-sm">
                <Award className="h-4.5 w-4.5" />
                <h5>Soft Skills</h5>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.softSkills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {Array.isArray(skills.tools) && skills.tools.length > 0 && (
            <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-3 text-pink-400 font-semibold text-sm">
                <FileText className="h-4.5 w-4.5" />
                <h5>Tools & Tech</h5>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.tools.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}