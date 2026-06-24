'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Copy, Check, Download } from 'lucide-react'

export default function CoverLetterPage() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [letterContent, setLetterContent] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (!name.trim() || !role.trim() || !company.trim()) {
      alert('Please fill in name, role, and company')
      return
    }

    const content = `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${role} position at ${company}. With ${experience || 'several years of'} professional experience and a strong background in ${skills || 'my field'}, I am confident in my ability to make a significant impact on your team.

Throughout my career, I have developed expertise in key areas that align perfectly with your requirements. I have consistently delivered results by combining technical expertise with strong problem-solving skills and a collaborative approach to work.

What excites me most about this opportunity is ${company}'s commitment to innovation and excellence. I am eager to bring my skills, experience, and passion to contribute to your team's success and help achieve your organizational goals.

I am confident that my experience and skills make me an excellent fit for this role. I would welcome the opportunity to discuss how my background aligns with your team's needs.

Thank you for considering my application. I look forward to speaking with you soon.

Sincerely,
${name}`

    setLetterContent(content)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([letterContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `cover-letter-${role.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
              <p className="text-slate-400">Generate professional cover letters tailored to job descriptions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Information</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Position Title *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Software Engineer"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Inc."
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Years of Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g., 5 years in software development"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Key Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Python, Leadership, Problem-solving"
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-semibold transition"
            >
              Generate Cover Letter
            </button>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Preview</h2>

            {letterContent ? (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-mono">
                    {letterContent}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-rose-500 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="font-semibold mb-2 text-sm">✏️ Next Steps</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Personalize the letter with specific achievements</li>
                    <li>• Add details about the company and role</li>
                    <li>• Use a professional email signature</li>
                    <li>• Proofread before sending</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center p-6 rounded-lg bg-slate-800/30 border border-slate-700 border-dashed">
                <div className="text-center">
                  <div className="text-slate-400 mb-2">No cover letter generated yet</div>
                  <p className="text-sm text-slate-500">Fill in your information and click "Generate" to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
