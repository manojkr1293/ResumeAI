import React from 'react';
import Link from 'next/link';
import { FileText, Linkedin, Sparkles, Upload } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Resume Builder</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Generate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Resume</span>
        </h1>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          Create a professional, ATS-friendly resume in minutes. Let our AI write your bullet points, optimize your keywords, and format your layout.
        </p>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <Link
            href="/profile"
            className="group flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all hover:-translate-y-1"
          >
            <FileText className="h-8 w-8 mb-3" />
            <span className="font-semibold text-lg">Start Free</span>
            <span className="text-blue-200 text-sm mt-1">Start from scratch</span>
          </Link>

          <button className="group flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all hover:-translate-y-1">
            <Upload className="h-8 w-8 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="font-semibold text-lg">Upload Resume</span>
            <span className="text-gray-500 text-sm mt-1">PDF or DOCX</span>
          </button>

          <button className="group flex flex-col items-center justify-center p-6 bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] rounded-xl hover:bg-[#0077b5]/20 transition-all hover:-translate-y-1 sm:col-span-2">
            <Linkedin className="h-8 w-8 mb-3" />
            <span className="font-semibold text-lg">Import from LinkedIn</span>
            <span className="opacity-80 text-sm mt-1">Auto-fill your details securely</span>
          </button>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10" />
    </div>
  );
}
