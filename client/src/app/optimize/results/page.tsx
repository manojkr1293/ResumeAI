"use client"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import TopActionBar from "./TopActionBar"
import TabsNav from "./TabsNav"
import OverviewTab from "./OverviewTab"
import KeywordsTab from "./KeywordsTab"
import ResumeTab from "./ResumeTab"
import LinkedInTab from "./LinkedInTab"
import ApplyTab from "./ApplyTab"

const TABS = ['Overview', 'Keywords', 'Resume', 'LinkedIn', 'Apply']

const MOCK_FALLBACK = {
  overallScore: 78,
  keywordScore: 72,
  formatScore: 85,
  impactScore: 70,
  readabilityScore: 88,
  atsAnalysis: {
    atsMatchScore: 78,
    missingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Architecture', 'Golang'],
    matchingKeywords: ['React', 'Next.js', 'TypeScript', 'Node.js', 'REST APIs', 'Agile'],
    skillGapAnalysis: [
      'Lack of cloud orchestration tools (Kubernetes/ECS) in the experience description.',
      'Infrastructure-as-Code (Terraform) is mentioned in the job post but missing from the resume.'
    ],
    resumeStrengths: [
      'Strong usage of impact verbs and quantified achievements.',
      'Excellent technical stack alignment with modern frontend development.',
      'Readable, single-column layout structure optimized for ATS parsing.'
    ],
    resumeWeaknesses: [
      'Short duration at the latest role might raise tenure questions.',
      'No certification details listed for AWS/Cloud competencies.'
    ],
    sectionWiseSuggestions: {
      professionalSummary: ['Lead with 5+ years of experience instead of focusing only on tasks.', 'Integrate cloud architecture keywords directly into the summary.'],
      skills: ['Group technologies by category (Frontend, Backend, Devops) to make it scannable.', 'Remove deprecated libraries to save space.'],
      experience: ['Rewrite bullet 2 in role 1 using the STAR method: "Reduced database query latency by 40%..."', 'Make sure to highlight leadership of cross-functional teams.'],
      education: ['Ensure graduation date is formatted correctly.', 'Add honors/relevant coursework if applicable.'],
      projects: ['Include GitHub links or live demo links for the projects section.', 'Mention scaling challenges solved.'],
      formatting: ['Avoid multi-column tables which might confuse legacy parser layouts.', 'Ensure standard margins of 0.75" to 1".']
    }
  },
  missingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Architecture'],
  suggestions: [
    'Add cloud-native infrastructure keywords to match job requirements.',
    'Highlight database optimization achievements.'
  ],
  optimizedResumeContent: {
    professionalSummary: 'Accomplished Senior Software Engineer with over 5 years of experience architecting and deploying scalable web applications. Expert in React, Next.js, Node.js, and TypeScript, with a proven track record of optimizing application performance by up to 40% and leading cross-functional teams to deliver cloud-based SaaS solutions. Passionate about implementing DevOps best practices including CI/CD and containerized deployments to accelerate product delivery.',
    skillsSection: {
      technicalSkills: ['TypeScript', 'JavaScript', 'Node.js', 'Go (Golang)', 'React', 'Next.js', 'HTML5', 'CSS3', 'Sass', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis'],
      softSkills: ['Team Leadership', 'Cross-Functional Collaboration', 'Agile Methodology', 'Problem Solving', 'Mentoring'],
      tools: ['Docker', 'Kubernetes', 'Git', 'Webpack', 'Jira', 'AWS (S3, EC2)', 'Vercel']
    },
    experienceBulletPoints: [
      'Led the transition of A/B landing pages to Next.js, increasing customer conversion rates by 12% and page performance by 35%.',
      'Designed and implemented a real-time analytics dashboard using WebSocket and Redis, supporting over 10k concurrent active connections with sub-100ms latency.',
      'Mentored 4 junior developers and established code review guidelines, reducing production bug occurrence by 25% and increasing team velocity by 15%.',
      'Containerized all microservices using Docker, simplifying local development setup time from 2 days to under 10 minutes.'
    ],
    keywordsToAddNaturally: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'DevOps', 'Microservices Architecture']
  },
  linkedinOptimization: {
    headlineVariations: [
      'Senior Software Engineer | React, Next.js, Node.js | Containerization & Cloud Solutions',
      'Lead Developer | Building High-Performance Web Applications & Scalable APIs',
      'Full Stack Engineer | Specialized in TypeScript, Microservices, and DevOps Orchestration',
      'Software Architect | Passionate about System Design, Performance Optimization, and Team Mentorship',
      'Senior Product Developer | Next.js Enthusiast | Helping Teams Build Robust Handoffs'
    ],
    aboutSection: 'I am a passionate Full Stack Software Engineer and Architect with a track record of driving technical excellence and high-impact business outcomes. Over the past 5+ years, I have specialized in building robust web applications using the modern JavaScript/TypeScript ecosystem (React, Next.js, Node.js) and designing scalable microservices.\n\nMy focus lies at the intersection of technical innovation and user experience. Whether it is reducing page load times by 35% using Next.js Server Components, optimizing database queries to support high concurrency, or containerizing applications for seamless cloud delivery, I strive to write clean, maintainable code that solves real-world problems.\n\nI thrive in collaborative, agile environments where mentoring and continuous learning are prioritized. Let\'s connect to discuss software engineering, clean code architecture, or how to build high-performing teams.',
    topSkills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Docker', 'Kubernetes', 'Software Architecture', 'REST APIs', 'System Design', 'Git', 'PostgreSQL', 'MongoDB', 'Agile Methodologies', 'Cloud Computing', 'CI/CD', 'Microservices', 'Redis', 'Web Performance', 'Team Leadership', 'Mentorship'],
    featuredAchievementHighlights: [
      'Successfully migrated legacy architecture to Next.js, improving page load speed by 35%.',
      'Developed real-time dashboard supporting 10k+ concurrent users.'
    ],
    recruiterFriendlyKeywords: ['Senior Engineer', 'Full Stack', 'Software Architect', 'NextJS Developer', 'DevOps Specialist']
  },
  coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the Senior Software Engineer position. With over five years of experience in full stack software engineering and a strong focus on the React, Next.js, and Node.js ecosystems, I am confident in my ability to make an immediate impact on your engineering team.\n\nIn my previous roles, I have consistently focused on building scalable, highly-performant web applications. For instance, when leading a migration to Next.js, I not only improved page load times by 35% but also worked closely with product stakeholders to align the architecture with our growth goals. Additionally, my experience containerizing applications with Docker and designing real-time systems using Redis matches perfectly with the requirements of this role.\n\nWhat excites me most about your company is your commitment to technical innovation and engineering excellence. I am eager to bring my background in system design, team mentorship, and performance optimization to help drive your products forward.\n\nThank you for your time and consideration. I look forward to the opportunity to discuss how my skills and experience align with your team\'s needs.\n\nSincerely,\n[Your Name]',
  interviewQuestions: [
    'How do you handle state management and performance optimization in large-scale Next.js applications?',
    'Describe a scenario where you had to containerize a complex microservice architecture. What challenges did you face?',
    'How do you approach code reviews and mentoring junior developers to ensure code quality?',
    'Explain how you would design a real-time messaging system supporting thousands of concurrent active clients.'
  ],
  emailToRecruiter: {
    subject: 'Application for Senior Software Engineer - [Your Name]',
    body: 'Hi [Recruiter Name],\n\nI hope this email finds you well.\n\nI recently submitted my application for the Senior Software Engineer position and wanted to reach out directly to express my interest.\n\nWith over 5 years of experience in JavaScript/TypeScript, React, Next.js, and backend web services, I have spent my career designing scalable architectures and driving technical projects. My skills in containerization (Docker) and API design align closely with the requirements of your open role.\n\nI have attached my resume and cover letter for your convenience. I would love the opportunity to chat about how my experience can contribute to the team\'s success.\n\nBest regards,\n[Your Name]\n[Your Phone Number]\n[Your Portfolio/LinkedIn Link]'
  }
}

export default function ResultsPage() {
  const search = useSearchParams()
  const paramId = search?.get('id') || ''
  const [active, setActive] = useState<string>('Overview')
  const [reportId, setReportId] = useState<string>(paramId || 'demo-1234')
  const [analysisData, setAnalysisData] = useState<any>(null)

  useEffect(() => {
    if (paramId) setReportId(paramId)
  }, [paramId])

  useEffect(() => {
    if (reportId) {
      const dataStr = sessionStorage.getItem(`resumeReport:${reportId}`)
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr)
          if (parsed && typeof parsed === 'object') {
            setAnalysisData(parsed)
          }
        } catch (e) {
          console.error("Error parsing analysis data", e)
        }
      }
    }
  }, [reportId])

  const currentData = analysisData || MOCK_FALLBACK

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-500 print:bg-white print:text-black print:p-0">
      <div className="max-w-6xl mx-auto space-y-6 print:space-y-0">
        <section className="glass-card p-5 border border-slate-800/80 shadow-2xl rounded-2xl print:hidden">
          <TopActionBar reportId={reportId} data={currentData} />
        </section>
        
        <section className="print:hidden">
          <TabsNav tabs={TABS} active={active} onChange={setActive} />
        </section>

        <section className="glass-card p-6 min-h-[400px] border border-slate-800/80 shadow-2xl rounded-2xl bg-slate-900/40 backdrop-blur-xl print:bg-transparent print:border-none print:shadow-none print:p-0 print:text-black">
          {active === 'Overview' && <OverviewTab data={currentData} />}
          {active === 'Keywords' && <KeywordsTab data={currentData} />}
          {active === 'Resume' && <ResumeTab data={currentData} />}
          {active === 'LinkedIn' && <LinkedInTab data={currentData} />}
          {active === 'Apply' && <ApplyTab data={currentData} />}
        </section>
      </div>
    </main>
  )
}
