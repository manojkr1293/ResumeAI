'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResumeCoachPage() {
  const params = useParams();
  const resumeId = params.id as string;
  
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/v1/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          question,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get advice');
      }

      setAdvice(data.advice);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Coach</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a question about your resume
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion((e.target as any).value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="How can I improve my experience section? What skills should I highlight for a software engineering role?"
            />
            <button
              onClick={handleAsk}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Getting advice...' : 'Get Advice'}
            </button>
          </div>

          {advice && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Coach's Advice</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{advice}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
