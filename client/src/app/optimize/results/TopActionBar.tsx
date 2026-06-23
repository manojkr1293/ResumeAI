"use client"
import React, { useState } from "react"
import Link from "next/link"
import { Download, ArrowLeft, Link as LinkIcon, Check, Printer } from "lucide-react"

type Props = {
  reportId: string
  data: any
}

export default function TopActionBar({ reportId, data }: Props) {
  const [copied, setCopied] = useState(false)

  const handleDownloadDoc = () => {
    const summary = data?.optimizedResumeContent?.professionalSummary || ''
    const skills = data?.optimizedResumeContent?.skillsSection || {}
    const bullets = data?.optimizedResumeContent?.experienceBulletPoints || []
    
    const techSkills = Array.isArray(skills.technicalSkills) ? skills.technicalSkills.join(', ') : ''
    const softSkills = Array.isArray(skills.softSkills) ? skills.softSkills.join(', ') : ''
    const tools = Array.isArray(skills.tools) ? skills.tools.join(', ') : ''

    // Construct valid HTML Word document format
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Optimized Resume</title>
        <style>
          body { font-family: "Calibri", "Arial", sans-serif; line-height: 1.45; color: #333333; margin: 90px; }
          h1 { font-family: "Calibri Light", "Arial", sans-serif; color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 4px; font-size: 18pt; margin-top: 18pt; margin-bottom: 6pt; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { font-family: "Calibri", "Arial", sans-serif; color: #2c3e50; font-size: 13pt; margin-top: 12pt; margin-bottom: 4pt; }
          p { font-size: 11pt; margin-bottom: 8pt; text-align: justify; }
          ul { margin-top: 3pt; margin-bottom: 8pt; padding-left: 18pt; }
          li { font-size: 11pt; margin-bottom: 4pt; line-height: 1.45; }
          .skills-section { margin-bottom: 10pt; }
          .skills-label { font-weight: bold; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20pt;">
          <h2 style="font-size: 22pt; margin-bottom: 2pt; text-transform: uppercase; font-weight: bold; color: #111827;">[YOUR NAME]</h2>
          <p style="font-size: 10pt; color: #666; margin-top: 0;">Email: you@example.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/username</p>
        </div>

        \${summary ? \`
        <h1>Professional Summary</h1>
        <p>\${summary}</p>
        \` : ''}

        \${techSkills || softSkills || tools ? \`
        <h1>Skills</h1>
        <div class="skills-section">
          \${techSkills ? \`<p><span class="skills-label">Technical Skills:</span> \${techSkills}</p>\` : ''}
          \${softSkills ? \`<p><span class="skills-label">Soft Skills:</span> \${softSkills}</p>\` : ''}
          \${tools ? \`<p><span class="skills-label">Tools & Technologies:</span> \${tools}</p>\` : ''}
        </div>
        \` : ''}

        \${bullets.length > 0 ? \`
        <h1>Professional Experience</h1>
        <h2>Optimized Achievements & Bullet Points</h2>
        <ul>
          \${bullets.map((b: string) => \`<li>\${b}</li>\`).join('')}
        </ul>
        \` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimized-resume-${reportId}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const link = `${location.origin}/optimize/results?id=${reportId}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error("Failed to copy link", e)
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <Link 
          href="/optimize" 
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 hover:bg-slate-700/80 transition text-slate-300"
          title="Back to Optimization"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            ATS Match Report
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-mono select-all cursor-pointer">
              ID: {reportId}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-lg text-sm font-semibold transition shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95 animate-pulse hover:animate-none"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
        <button
          onClick={handleDownloadDoc}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Download Word (.doc)</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition active:scale-95 min-w-[130px] justify-center"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 text-slate-400" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}


