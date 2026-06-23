import React from 'react'

export default function ReportPage({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold">Shared Resume Optimization Report</h2>
        <p className="text-sm text-slate-500 mt-1">Report ID: {id} · View-only</p>

        <section className="mt-6">
          <h3 className="font-semibold">ATS Score</h3>
          <div className="mt-2">
            <div className="text-4xl font-bold">78</div>
            <div className="h-3 bg-slate-200 rounded mt-2"><div className="h-3 bg-sky-600 rounded" style={{ width: '78%' }} /></div>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-semibold">Keywords</h3>
          <div className="mt-2 flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded">leadership</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">product</span>
            <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded">analytics</span>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-semibold">Resume Recommendations</h3>
          <ul className="list-disc ml-5 mt-2 text-sm text-slate-600">
            <li>Add role-specific keywords in professional summary</li>
            <li>Quantify impact in experience bullets</li>
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="font-semibold">LinkedIn Highlights</h3>
          <p className="text-sm text-slate-600 mt-2">Suggested headline and About section included in the private dashboard.</p>
        </section>

      </div>
    </div>
  )
}
