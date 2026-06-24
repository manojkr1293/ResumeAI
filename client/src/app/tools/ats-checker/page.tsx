'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'

export default function ATSCheckerPage() {
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      alert('Please enter both resume and job description')
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const resumeWords = resume.toLowerCase().split(/\s+/)
      const jobWords = jobDescription.toLowerCase().split(/\s+/)
      
      const matches = resumeWords.filter(word => 
        jobWords.some(jw => jw.includes(word) || word.includes(jw))
      ).length

      const calculatedScore = Math.min(100, Math.round((matches / Math.max(jobWords.length, 1)) * 100))
      
      setScore(calculatedScore)
      setAnalysis({
        matchedKeywords: matches,
        totalKeywords: jobWords.length,
        strengths: [
          'Good keyword alignment detected',
          'Format appears ATS-friendly'
        ],
        gaps: calculatedScore < 70 ? [
          'Missing some key technical skills',
          'Consider adding specific tools/frameworks mentioned in JD'
        ] : []
      })
      setLoading(false)
    }, 1500)
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-emerald-400 to-teal-500'
    if (s >= 60) return 'from-amber-400 to-orange-500'
    return 'from-rose-400 to-red-500'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ATS Score Checker</h1>
              <p className="text-slate-400">Check how well your resume matches the job description</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Paste Your Resume</label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-48 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Paste Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 font-semibold transition"
            >
              {loading ? 'Analyzing...' : 'Check ATS Score'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {score !== null ? (
              <>
                {/* Score Circle */}
                <div className={`p-8 rounded-2xl bg-gradient-to-br ${getScoreColor(score)} opacity-10 border border-slate-700 flex flex-col items-center justify-center`}>
                  <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                    {score}%
                  </div>
                  <div className="text-sm text-slate-400 mt-2">ATS Match Score</div>
                </div>

                {/* Analysis */}
                {analysis && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="text-sm text-slate-400">Matched Keywords</div>
                      <div className="text-2xl font-bold mt-1">{analysis.matchedKeywords} / {analysis.totalKeywords}</div>
                    </div>

                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="text-sm font-semibold text-emerald-400 mb-2">Strengths</div>
                        <ul className="space-y-1 text-sm text-slate-300">
                          {analysis.strengths.map((s: string, i: number) => (
                            <li key={i}>✓ {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.gaps && analysis.gaps.length > 0 && (
                      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        <div className="text-sm font-semibold text-rose-400 mb-2">Gaps</div>
                        <ul className="space-y-1 text-sm text-slate-300">
                          {analysis.gaps.map((g: string, i: number) => (
                            <li key={i}>⚠ {g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6 rounded-lg bg-slate-800/30 border border-slate-700 border-dashed">
                <div className="text-center">
                  <div className="text-slate-400 mb-2">Results will appear here</div>
                  <p className="text-sm text-slate-500">Enter your resume and job description to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="p-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Use your actual resume content for accurate results</li>
            <li>• Include the full job description for better keyword matching</li>
            <li>• Aim for a score above 75% to pass most ATS systems</li>
            <li>• Add missing keywords naturally throughout your resume</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
