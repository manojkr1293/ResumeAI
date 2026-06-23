"use client"
import React, { useState } from "react"
import { Check, Copy, AlertCircle, Sparkles, BookOpen } from "lucide-react"

type Props = {
  data: any
}

const Chip = ({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: string }) => {
  const styles = {
    missing: 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20',
    matching: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20',
    suggested: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700'
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 select-all cursor-pointer ${styles[variant as keyof typeof styles] || styles.neutral}`}>
      {children}
    </span>
  )
}

export default function KeywordsTab({ data }: Props) {
  const missing = data?.atsAnalysis?.missingKeywords || data?.missingKeywords || []
  const matching = data?.atsAnalysis?.matchingKeywords || []
  const suggested = data?.optimizedResumeContent?.keywordsToAddNaturally || data?.suggestions || []

  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyAll = async (section: string, list: string[]) => {
    try {
      await navigator.clipboard.writeText(list.join(', '))
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      {/* Missing Keywords */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-full min-h-[300px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <h4 className="font-semibold text-slate-200">Missing Keywords</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {missing.length}
            </span>
          </div>

          {missing.length === 0 ? (
            <p className="text-sm text-slate-500 italic mt-8 text-center">No missing keywords found.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((k: string) => (
                <Chip key={k} variant="missing">{k}</Chip>
              ))}
            </div>
          )}
        </div>

        {missing.length > 0 && (
          <button 
            onClick={() => copyAll('missing', missing)} 
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-xl transition duration-200"
          >
            {copiedSection === 'missing' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy All Missing</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Matching Keywords */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-full min-h-[300px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <h4 className="font-semibold text-slate-200">Matching Keywords</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {matching.length}
            </span>
          </div>

          {matching.length === 0 ? (
            <p className="text-sm text-slate-500 italic mt-8 text-center">No matching keywords found yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matching.map((k: string) => (
                <Chip key={k} variant="matching">{k}</Chip>
              ))}
            </div>
          )}
        </div>

        {matching.length > 0 && (
          <button 
            onClick={() => copyAll('matching', matching)} 
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-xl transition duration-200"
          >
            {copiedSection === 'matching' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy All Matching</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Suggested Keywords (Keywords to Add Naturally) */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-full min-h-[300px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h4 className="font-semibold text-slate-200">Keywords to Add Naturally</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {suggested.length}
            </span>
          </div>

          {suggested.length === 0 ? (
            <p className="text-sm text-slate-500 italic mt-8 text-center">No keywords suggested to add.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggested.map((k: string) => (
                <Chip key={k} variant="suggested">{k}</Chip>
              ))}
            </div>
          )}
        </div>

        {suggested.length > 0 && (
          <button 
            onClick={() => copyAll('suggested', suggested)} 
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-xl transition duration-200"
          >
            {copiedSection === 'suggested' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy All Suggested</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}