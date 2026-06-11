'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ImproveBulletsPage() {
  const params = useParams();
  const resumeId = params.id as string;
  
  const [bullets, setBullets] = useState('');
  const [improvedBullets, setImprovedBullets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImprove = async () => {
    const bulletArray = bullets.split('\n').filter(b => b.trim());
    
    if (bulletArray.length === 0) {
      setError('Please enter at least one bullet point');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/v1/ai/improve-bullets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          bullets: bulletArray,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to improve bullets');
      }

      setImprovedBullets(data.improvedBullets);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Improve Bullet Points</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your bullet points (one per line)
            </label>
            <textarea
              value={bullets}
              onChange={(e) => setBullets((e.target as any).value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="• Led a team of 5 developers&#10;• Improved application performance by 40%&#10;• Implemented CI/CD pipeline"
            />
            <button
              onClick={handleImprove}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Improving...' : 'Improve Bullets'}
            </button>
          </div>

          {improvedBullets.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Improved Bullet Points</h2>
              <ul className="space-y-2">
                {improvedBullets.map((bullet, index) => (
                  <li key={index} className="text-gray-700">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
