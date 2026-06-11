'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResumeEditorPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;
  
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setIsMounted(true);
    fetchResume();
  }, [resumeId]);

  const fetchResume = async () => {
    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/v1/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch resume');
      }

      const resumeData = data.data?.resume;
      if (!resumeData) {
        throw new Error('Resume data not found in response');
      }

      setResume(resumeData);
      setTitle(resumeData.title || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:5000/api/v1/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update resume');
      }

      const resumeData = data.data?.resume;
      if (resumeData) {
        setResume(resumeData);
      }
      win?.alert('Resume saved successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const win = globalThis as any;
      const token = win?.localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/v1/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          format,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to export resume');
      }

      win?.alert(`Resume exported as ${format}!`);
    } catch (err: any) {
      setError(err.message);
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
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : resume ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle((e.target as any).value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Sections</h3>
                <p className="text-gray-500 mb-4">
                  Add sections to your resume (Experience, Education, Skills, etc.)
                </p>
                
                <div className="space-y-4">
                  {resume?.sections && Array.isArray(resume.sections) && resume.sections.length > 0 ? (
                    resume.sections.map((section: any) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{section.sectionType || 'Unknown Section'}</h4>
                        <p className="text-sm text-gray-500 mt-2">{section.content || 'No content yet'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No sections added yet.</p>
                  )}
                </div>

                <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                  Add Section
                </button>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href={`/resumes/${resumeId}/ai/improve-bullets`}
                    className="px-4 py-3 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-center"
                  >
                    Improve Bullet Points
                  </Link>
                  <Link
                    href={`/resumes/${resumeId}/ai/analyze-ats`}
                    className="px-4 py-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                  >
                    ATS Analysis
                  </Link>
                  <Link
                    href={`/resumes/${resumeId}/ai/coach`}
                    className="px-4 py-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-center"
                  >
                    Resume Coach
                  </Link>
                  <Link
                    href={`/resumes/${resumeId}/ai/roast`}
                    className="px-4 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-center"
                  >
                    Resume Roast
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Resume not found.</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
