'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit3, Copy, Check, Sparkles } from 'lucide-react'

export default function SummaryGeneratorPage() {
  const [role, setRole] = useState('')
  const [skills, setSkills] = useState('')
  const [achievements, setAchievements] = useState('')
  const [experience, setExperience] = useState('')
  const [summaries, setSummaries] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!role.trim()) {
      alert('Please enter your job title')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const achievementsList = achievements.split(',').filter(a => a.trim()).slice(0, 2)
      const skillsList = skills.split(',').filter(s => s.trim()).slice(0, 3)
      
      const generated = [
        `Accomplished ${role} with ${experience || '5+'} years of proven expertise in driving business results through innovative problem-solving and technical excellence. Skilled in ${skillsList.join(', ') || 'modern technologies'}. Passionate about delivering high-impact solutions that align with organizational goals.`,
        
        `Results-driven ${role} leveraging ${experience || 'extensive'} experience to build scalable solutions and lead high-performing teams. ${achievementsList[0] ? `Demonstrated success in ${achievementsList[0].toLowerCase()}.` : ''} Proficient in ${skillsList.join(', ') || 'key technologies'}.`,
        
        `Dynamic professional with ${experience || 'comprehensive'} background as a ${role}, combining technical acumen with strategic vision. Committed to driving innovation and delivering exceptional value through ${skillsList.join(', ') || 'expertise in modern tools'}.`,
        
        `Experienced ${role} known for delivering results and fostering collaborative environments. Strong proficiency in ${skillsList.join(', ') || 'specialized domains'}. ${achievementsList[0] ? `Track record includes ${achievementsList[0].toLowerCase()}.` : ''} Dedicated to continuous learning and professional growth.`,
        
        `Proactive ${role} with a track record of transforming complex challenges into strategic opportunities. Expertise spans ${skillsList.join(', ') || 'multiple domains'}, with a focus on innovation and operational excellence. Eager to contribute to ambitious projects.`
      ]
      
      setSummaries(generated)
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-violet-400 to-purple-500">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Resume Summary Generator</h1>
              <p className="text-slate-400">Create impactful professional summaries that highlight your strengths</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">Your Profile</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">Current/Target Job Title *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Product Manager, Full Stack Engineer"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Years of Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g., 8, or leave blank for default"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Key Skills (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Product Strategy, Leadership"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Key Achievements (comma-separated)</label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g., Led $2M project successfully, Increased efficiency by 40%, Mentored 5+ team members"
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2"
            >
              <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Summaries'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">Generated Summaries</h2>

            {summaries.length > 0 ? (
              <div className="space-y-3">
                {summaries.map((summary, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 transition group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Option {index + 1}</div>
                      <button
                        onClick={() => handleCopy(summary, index)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-violet-600 transition text-slate-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {summary}
                    </p>
                    <div className="text-xs text-slate-500 mt-3">
                      {summary.length} characters
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 rounded-lg bg-slate-800/30 border border-slate-700 border-dashed">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-slate-400 mb-1">No summaries yet</div>
                  <p className="text-sm text-slate-500">Fill in your information to generate personalized summaries</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>💡 How to Use Your Summary</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-indigo-400 mb-2">Best Practices:</p>
              <ul className="space-y-1">
                <li>• Keep it 2-3 sentences maximum</li>
                <li>• Use action-oriented language</li>
                <li>• Highlight quantifiable achievements</li>
                <li>• Include relevant keywords for ATS</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-indigo-400 mb-2">Pro Tips:</p>
              <ul className="space-y-1">
                <li>• Customize for each job application</li>
                <li>• Align with job description keywords</li>
                <li>• Update as you gain experience</li>
                <li>• Test different versions to see what works</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
