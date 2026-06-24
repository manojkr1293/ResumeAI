'use client'
import React from 'react'
import Link from 'next/link'
import { Zap, Search, Lightbulb, FileText, Edit3, ArrowRight } from 'lucide-react'

const tools = [
  {
    title: 'ATS Score Checker',
    description: 'Analyze your resume against job descriptions and get an ATS compatibility score.',
    icon: Zap,
    href: '/tools/ats-checker',
    color: 'from-sky-400 to-indigo-500',
    features: ['Real-time scoring', 'Keyword matching', 'Formatting analysis']
  },
  {
    title: 'Resume Keyword Scanner',
    description: 'Extract and analyze keywords from job postings and match them with your resume.',
    icon: Search,
    href: '/tools/keyword-scanner',
    color: 'from-amber-400 to-orange-500',
    features: ['Keyword extraction', 'Gap analysis', 'Suggestions']
  },
  {
    title: 'LinkedIn Headline Generator',
    description: 'Create compelling LinkedIn headlines that attract recruiters and increase visibility.',
    icon: Lightbulb,
    href: '/tools/linkedin-generator',
    color: 'from-emerald-400 to-teal-500',
    features: ['AI-powered suggestions', 'Multiple variants', 'Recruiter-friendly']
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate professional cover letters tailored to job descriptions in seconds.',
    icon: FileText,
    href: '/tools/cover-letter',
    color: 'from-rose-400 to-pink-500',
    features: ['Job-tailored', 'Professional tone', 'Customizable']
  },
  {
    title: 'Resume Summary Generator',
    description: 'Create impactful professional summaries that highlight your best skills and achievements.',
    icon: Edit3,
    href: '/tools/summary-generator',
    color: 'from-violet-400 to-purple-500',
    features: ['Achievement-focused', 'Keyword-optimized', 'ATS-friendly']
  }
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              Resume Tools
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Powerful, free tools to optimize your resume, boost your profile, and land your dream job. Each tool is designed to give you a competitive edge in your job search.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group relative h-full p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-slate-600/80 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer hover:-translate-y-1">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 space-y-4">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${tool.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-indigo-400 transition-all">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="pt-4 space-y-2">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-sky-300 transition-colors">
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Call to action */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <h2 className="text-2xl font-bold mb-3">Want all these tools in one place?</h2>
          <p className="text-slate-300 mb-6">Upgrade to ResumeAI Premium for advanced features, unlimited tool usage, and priority support.</p>
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg font-semibold transition-all"
          >
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
