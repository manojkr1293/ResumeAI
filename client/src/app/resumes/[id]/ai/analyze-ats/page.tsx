'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ATSAnalysisPage() {
  const params = useParams();
  const resumeId = params.id as string;
  
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/v1/ai/analyze-ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze ATS');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/resumes/${resumeId}`} className="text-gray-700 hover:text-gray-900">
                ← Back to Resume
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">ATS Analysis</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription((e.target as any).value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste the job description here..."
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze ATS'}
            </button>
          </div>

          {analysis && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-700">Overall Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{analysis.overallScore || 0}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-700">Keyword Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{analysis.keywordScore || 0}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-700">Format Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{analysis.formatScore || 0}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-700">Impact Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{analysis.impactScore || 0}%</p>
                </div>
              </div>

              {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Suggestions</h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
