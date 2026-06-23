"use client"
import React, { useState } from "react"
import { Linkedin, Copy, Check, Star, Award, MessageSquare } from "lucide-react"

type Props = {
  data: any
}

export default function LinkedInTab({ data }: Props) {
  const linkedin = data?.linkedinOptimization || {}
  const headlines = linkedin.headlineVariations || [
    'Software Engineer experienced in Full-Stack Web Development',
    'Full-Stack Developer | React & Node.js Enthusiast'
  ]
  const skills = linkedin.topSkills || ['JavaScript', 'React', 'Node.js']
  const about = linkedin.aboutSection || 'Passionate developer dedicated to writing clean and performant code.'

  const [copiedHeadline, setCopiedHeadline] = useState<number | null>(null)
  const [copiedAbout, setCopiedAbout] = useState(false)

  const handleCopy = async (text: string, type: 'headline' | 'about', idx?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'about') {
        setCopiedAbout(true)
        setTimeout(() => setCopiedAbout(false), 2000)
      } else if (typeof idx === 'number') {
        setCopiedHeadline(idx)
        setTimeout(() => setCopiedHeadline(null), 2000)
      }
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Headlines Card */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <Linkedin className="h-5 w-5 text-sky-400" />
          <h4 className="font-semibold text-slate-200">LinkedIn Headline Variations</h4>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Select one of these recruiter-optimized headlines to increase your search visibility on LinkedIn:
        </p>
        <div className="space-y-3">
          {headlines.map((h: string, idx: number) => (
            <div 
              key={idx} 
              className="flex items-start justify-between gap-4 p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 rounded-xl hover:border-slate-700/60 transition"
            >
              <div className="flex items-start gap-2.5 text-sm text-slate-300 font-medium">
                <Star className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{h}</span>
              </div>
              <button
                onClick={() => handleCopy(h, 'headline', idx)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold rounded-lg transition"
              >
                {copiedHeadline === idx ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* About Section Card */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
            <h4 className="font-semibold text-slate-200">LinkedIn About Section</h4>
          </div>
          <button
            onClick={() => handleCopy(about, 'about')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition"
          >
            {copiedAbout ? (
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
        <div className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 shadow-inner whitespace-pre-line">
          {about}
        </div>
      </div>

      {/* Top Skills Card */}
      {skills.length > 0 && (
        <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-3">
            <Award className="h-5 w-5 text-pink-400" />
            <h4 className="font-semibold text-slate-200">Suggested LinkedIn Skills</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Add these top skills to your profile to match recruiter search filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s: string) => (
              <span 
                key={s} 
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition duration-200 select-all cursor-pointer"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}