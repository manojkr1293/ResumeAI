"use client";

import React, { useState } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Card, CardContent } from '../../../components/ui/Card';
import { Sparkles, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchPage() {
  const { addSkill } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    missingKeywords: string[];
    recommendations: string[];
  } | null>(null);

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    // Mock AI Analysis
    setTimeout(() => {
      setResults({
        score: 65,
        missingKeywords: ['Agile', 'Docker', 'CI/CD', 'AWS', 'Team Leadership'],
        recommendations: [
          "Your resume lacks 'Project Management' and 'Agile' - consider adding these to your Experience if applicable.",
          "Add quantifiable metrics to your most recent role to improve impact score.",
          "Ensure your target role matches the job title 'Senior Software Engineer'."
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleAddKeyword = (keyword: string) => {
    addSkill(keyword);
    if (results) {
      setResults({
        ...results,
        missingKeywords: results.missingKeywords.filter(k => k !== keyword),
        score: Math.min(100, results.score + 5) // Bump score for demo
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Job Match Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste the job description you are applying for. Our AI will analyze your resume against it.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Paste the full job description here..."
          className="min-h-[200px]"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <Button
          onClick={handleAnalyze}
          disabled={!jobDescription.trim()}
          isLoading={isAnalyzing}
          className="w-full"
          size="lg"
          variant="magic"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Analyze & Optimize Resume
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 overflow-hidden pt-4 border-t border-gray-200"
          >
            {/* Score Gauge (Simple visual) */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="relative flex items-center justify-center w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <motion.circle
                    className={`${results.score >= 80 ? 'text-green-500' : results.score >= 60 ? 'text-yellow-500' : 'text-red-500'} stroke-current`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    initial={{ strokeDasharray: '251.2', strokeDashoffset: '251.2' }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * results.score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  ></motion.circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{results.score}%</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">ATS Match</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 font-medium text-center">
                {results.score >= 80 ? 'Excellent match! You are ready to apply.' : 
                 results.score >= 60 ? 'Good start. Add missing keywords to improve.' : 
                 'Needs work. Heavily tailor your resume.'}
              </p>
            </div>

            {/* Missing Keywords */}
            {results.missingKeywords.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    Missing Keywords
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    The job description mentions these keywords, but they aren't in your resume. Click to add them to your Skills section.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {results.missingKeywords.map(keyword => (
                        <motion.button
                          key={keyword}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0, width: 0, padding: 0, margin: 0 }}
                          onClick={() => handleAddKeyword(keyword)}
                          className="flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800 hover:bg-yellow-400 hover:text-yellow-900 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          {keyword}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  AI Recommendations
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                      <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
