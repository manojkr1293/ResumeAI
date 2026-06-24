'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Copy, Check, RefreshCw } from 'lucide-react'

export default function LinkedInGeneratorPage() {
  const [title, setTitle] = useState('')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [headlines, setHeadlines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('Please enter your job title')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const generated = [
        `${title} | ${skills.split(',')[0]?.trim() || 'Professional'} | Helping companies succeed`,
        `${title} | ${skills.split(',')[0]?.trim() || 'Expert'} | ${experience.split(',')[0]?.trim() || 'Passionate'}`,
        `Senior ${title} | ${skills.split(',').slice(0, 2).join(', ').trim() || 'Specialized'} | Open to opportunities`,
        `${title} | Building solutions with ${skills.split(',')[0]?.trim() || 'modern tech'} | Available for projects`,
        `${title} | ${experience || 'Experienced'} professional | Let's connect!`
      ]
      setHeadlines(generated)
      setLoading(false)
    }, 1200)
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">LinkedIn Headline Generator</h1>
              <p className="text-slate-400">Create compelling headlines that attract recruiters and increase visibility</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Current/Target Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Product Manager"
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Key Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Python, Leadership, UI/UX"
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Years of Experience (Optional)</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 5+ years in SaaS, 10 years in tech"
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Generate Headlines'}
          </button>
        </div>

        {/* Results */}
        {headlines.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Your LinkedIn Headlines</span>
              <span className="text-sm text-slate-400">({headlines.length} options)</span>
            </h2>

            <div className="space-y-3">
              {headlines.map((headline, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Headline Option {index + 1}</div>
                      <p className="text-white font-medium leading-relaxed">{headline}</p>
                      <div className="text-xs text-slate-500 mt-2">
                        {headline.length} / 220 characters
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(headline, index)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-600 transition text-slate-400 hover:text-white flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mt-6">
              <h3 className="font-semibold mb-2">💡 Pro Tips for LinkedIn Headlines</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Keep it under 120 characters for full visibility on mobile</li>
                <li>• Include keywords that recruiters search for</li>
                <li>• Highlight unique value, not just job title</li>
                <li>• Use pipe separators (|) to break up content visually</li>
                <li>• Update your headline when changing roles or skills</li>
                <li>• Add a call-to-action like "Open to opportunities"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
