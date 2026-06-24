'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Copy, Check } from 'lucide-react'

export default function KeywordScannerPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [keywords, setKeywords] = useState<{ keyword: string; found: boolean }[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description')
      return
    }

    setLoading(true)
    setTimeout(() => {
      // Extract keywords (simple implementation)
      const words = jobDescription
        .toLowerCase()
        .split(/[,\s\.!?;:]+/)
        .filter(w => w.length > 4)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 15)

      const resumeWords = resume.toLowerCase()
      const keywordResults = words.map(keyword => ({
        keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        found: resumeWords.includes(keyword)
      }))

      setKeywords(keywordResults)
      setLoading(false)
    }, 1000)
  }

  const foundCount = keywords.filter(k => k.found).length
  const totalCount = keywords.length
  const coverage = totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0

  const handleCopy = () => {
    const missingKeywords = keywords
      .filter(k => !k.found)
      .map(k => k.keyword)
      .join(', ')
    navigator.clipboard.writeText(missingKeywords)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Resume Keyword Scanner</h1>
              <p className="text-slate-400">Identify and match keywords between job posting and your resume</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 mb-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Your Resume (Optional)</label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume to see which keywords you already have..."
                className="w-full h-48 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 font-semibold transition"
          >
            {loading ? 'Scanning...' : 'Scan Keywords'}
          </button>
        </div>

        {/* Results */}
        {keywords.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400">Total Keywords</div>
                <div className="text-3xl font-bold mt-1">{totalCount}</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-sm text-emerald-400">Found in Resume</div>
                <div className="text-3xl font-bold mt-1">{foundCount}</div>
              </div>
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <div className="text-sm text-rose-400">Missing</div>
                <div className="text-3xl font-bold mt-1">{totalCount - foundCount}</div>
              </div>
            </div>

            {/* Coverage Bar */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Keyword Coverage</span>
                <span className="text-lg font-bold text-amber-400">{coverage}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${coverage}%` }}
                />
              </div>
            </div>

            {/* Keywords List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Keyword Analysis</h3>
                {keywords.some(k => !k.found) && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Missing
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Found Keywords */}
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Found in Your Resume ✓</h4>
                  <div className="space-y-2">
                    {keywords.filter(k => k.found).map((k, i) => (
                      <div key={i} className="text-sm text-slate-300">
                        • {k.keyword}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                  <h4 className="text-sm font-semibold text-rose-400 mb-3">Missing Keywords ⚠</h4>
                  <div className="space-y-2">
                    {keywords.filter(k => !k.found).length > 0 ? (
                      keywords.filter(k => !k.found).map((k, i) => (
                        <div key={i} className="text-sm text-slate-300">
                          • {k.keyword}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400 italic">Great! All keywords are present.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <h4 className="font-semibold mb-2">💡 Next Steps</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Add missing keywords naturally to your resume</li>
                <li>• Focus on keywords related to your experience</li>
                <li>• Aim for at least 80% keyword coverage</li>
                <li>• Use keywords in job descriptions and skills sections</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
