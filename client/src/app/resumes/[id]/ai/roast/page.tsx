'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResumeRoastPage() {
  const params = useParams();
  const resumeId = params.id as string;
  
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRoast = async () => {
    setLoading(true);
    setError('');

    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/v1/ai/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to roast resume');
      }

      setRoast(data.roast);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Roast</h1>
          <p className="text-gray-600 mb-6">
            Get constructive criticism about your resume. Be ready for honest feedback!
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <button
              onClick={handleRoast}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Roasting...' : 'Roast My Resume'}
            </button>
          </div>

          {roast && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">The Roast</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{roast}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
