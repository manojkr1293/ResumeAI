"use client";

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useResumeStore } from '../../../store/useResumeStore';
import { Button } from '../../../components/ui/Button';
import { LivePreview } from '../../../components/ui/LivePreview';
import { Download, Share2, FileText, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PreviewPage() {
  const { fullName } = useResumeStore();
  const resumeRef = useRef(null as any);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null as any);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${fullName.replace(/\s+/g, '_')}_Resume`,
  });

  const handleAudit = () => {
    setIsAuditing(true);
    setAuditResult(null);
    setTimeout(() => {
      setAuditResult('success'); // Mock success result
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Pane: Document Outline & Actions */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Final Review & Export</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review your resume, run a final ATS check, and download it.
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <Button onClick={handlePrint} className="w-full flex items-center justify-center gap-2" size="lg">
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              DOCX / TXT
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
          </div>
        </div>

        {/* AI Final Check Widget */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-blue-200/50">
            <Sparkles className="h-24 w-24" />
          </div>
          <h3 className="font-semibold text-blue-900 text-lg mb-2 relative z-10">Final ATS Audit</h3>
          <p className="text-sm text-blue-700 mb-4 relative z-10">
            Ensure your resume is perfectly parsed by applicant tracking systems before you download.
          </p>
          <Button 
            variant="magic" 
            className="w-full shadow-sm" 
            onClick={handleAudit}
            disabled={isAuditing || auditResult === 'success'}
          >
            {isAuditing ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running Audit...
              </span>
            ) : auditResult === 'success' ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" /> Passed Audit
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" /> Run Final Audit
              </span>
            )}
          </Button>

          <AnimatePresence>
            {auditResult === 'success' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                className="bg-white/80 rounded border border-green-200 p-3"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">All Clear!</h4>
                    <p className="text-xs text-green-700 mt-0.5">Formatting, keywords, and sections are perfectly aligned for ATS systems.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Document Outline */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1">
          <h3 className="font-semibold text-gray-900 mb-4">Document Outline</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 text-blue-600 cursor-pointer hover:underline">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold">1</div>
              Personal Information
            </li>
            <li className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-blue-600 hover:underline transition-colors">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">2</div>
              Work Experience
            </li>
            <li className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-blue-600 hover:underline transition-colors">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">3</div>
              Education
            </li>
            <li className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-blue-600 hover:underline transition-colors">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">4</div>
              Skills
            </li>
          </ul>
        </div>
      </div>

      {/* Right Pane: PDF Style Preview */}
      <div className="w-full lg:w-2/3 flex justify-center">
        {/* We wrap LivePreview in a container that simulates an A4 paper for print layout */}
        <div className="w-full max-w-[850px] bg-gray-200 p-4 sm:p-8 rounded-xl overflow-y-auto max-h-[calc(100vh-140px)]">
          <div 
            ref={resumeRef}
            className="bg-white shadow-2xl mx-auto"
            style={{ 
              width: '100%', 
              minHeight: '1056px', // 8.5x11 aspect ratio roughly
              aspectRatio: '8.5/11'
            }}
          >
            {/* 
              We reuse LivePreview here, but since it's the target for react-to-print,
              it will render exactly what the user sees.
              If we want it to look exactly like an A4 document without the scrolling borders, 
              we pass a prop to disable its internal scrolling, but our LivePreview doesn't have it by default.
            */}
            <div className="h-full w-full">
              <LivePreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
