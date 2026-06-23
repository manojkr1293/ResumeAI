"use client"
import React from "react"
import { CheckCircle2, AlertTriangle, ChevronRight, Sparkles, AlertCircle } from "lucide-react"
import { ScoreGauge } from "./ScoreGauge"

type Props = {
  data: any
}

export default function OverviewTab({ data }: Props) {
  const overall = data?.overallScore ?? data?.atsAnalysis?.atsMatchScore ?? 70
  const stats = [
    { label: 'Keyword Match', value: data?.keywordScore ?? 65, color: 'from-amber-400 to-orange-500' },
    { label: 'Formatting Quality', value: data?.formatScore ?? 80, color: 'from-emerald-400 to-teal-500' },
    { label: 'Impact & Metrics', value: data?.impactScore ?? 60, color: 'from-rose-400 to-pink-500' },
    { label: 'Readability', value: data?.readabilityScore ?? 75, color: 'from-sky-400 to-indigo-500' },
  ]

  const strengths = data?.atsAnalysis?.resumeStrengths || [
    'Clear section headers and structure',
    'Good summary phrasing and tone'
  ]
  
  const weaknesses = data?.atsAnalysis?.resumeWeaknesses || [
    'Missing relevant cloud and infrastructure keywords',
    'Quantifiable business impact could be improved'
  ]

  const suggestions = data?.atsAnalysis?.sectionWiseSuggestions || {}
  const suggestionKeys = Object.keys(suggestions).filter(key => Array.isArray(suggestions[key]) && suggestions[key].length > 0)

  return (
    <div className="space-y-6 fade-in">
      {/* Top Scores section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Overall Match Circle */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/40 shadow-inner">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Overall ATS Score</h3>
          <ScoreGauge label="ATS Match Percentage" value={overall} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            Calculated by matching resume keywords, syntax, and formatting against the job description.
          </p>
        </div>

        {/* Detailed Metrics */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/40 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">{s.label}</span>
                <span className="text-base font-bold text-slate-100">{s.value}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-1000`}
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-5 bg-emerald-950/20 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold text-base">
            <CheckCircle2 className="h-5 w-5" />
            <h4>Resume Strengths</h4>
          </div>
          <ul className="space-y-3">
            {strengths.map((str: string, index: number) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas of Improvement */}
        <div className="p-5 bg-rose-950/20 rounded-2xl border border-rose-500/20">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-semibold text-base">
            <AlertTriangle className="h-5 w-5" />
            <h4>Critical Gaps & Weaknesses</h4>
          </div>
          <ul className="space-y-3">
            {weaknesses.map((weak: string, index: number) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section-wise Suggestions */}
      {suggestionKeys.length > 0 && (
        <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/40">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-semibold text-base">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <h4>Section-by-Section Action Plan</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestionKeys.map((key) => {
              const formattedName = key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
              return (
                <div key={key} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-200 capitalize">{formattedName}</span>
                  </div>
                  <ul className="space-y-2 mt-1">
                    {suggestions[key].map((item: string, i: number) => (
                      <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}