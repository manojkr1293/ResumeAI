"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LivePreview } from '../../components/ui/LivePreview';
import { Button } from '../../components/ui/Button';

const WIZARD_STEPS = [
  { path: '/profile', name: 'Profile' },
  { path: '/experience', name: 'Experience' },
  { path: '/education-skills', name: 'Education & Skills' },
  { path: '/match', name: 'Job Match' },
  { path: '/design', name: 'Design' },
  { path: '/preview', name: 'Preview' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current step index
  const currentStepIndex = WIZARD_STEPS.findIndex((step) => pathname?.includes(step.path));
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const totalSteps = WIZARD_STEPS.length;

  // Don't render dual-pane on the landing page if there's a base wizard page
  if (pathname === '/') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const handleNext = () => {
    const nextStep = WIZARD_STEPS[currentStepIndex + 1];
    if (currentStepIndex < totalSteps - 1 && nextStep) {
      router.push(nextStep.path);
    }
  };

  const handleBack = () => {
    const prevStep = WIZARD_STEPS[currentStepIndex - 1];
    if (currentStepIndex > 0 && prevStep) {
      router.push(prevStep.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar & Progress */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">ResumeAI</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Wizard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBack} disabled={currentStepIndex <= 0}>
              Back
            </Button>
            <Button size="sm" onClick={handleNext} disabled={currentStepIndex >= totalSteps - 1}>
              {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next Step'}
            </Button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </header>

      {/* Main Dual-Pane Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">
        {/* Left Pane (Forms) */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 overflow-y-auto">
            {children}
          </div>
        </div>

        {/* Right Pane (Live Preview) */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col">
          <div className="sticky top-24 h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 p-4">
            <LivePreview />
          </div>
        </div>
      </main>
    </div>
  );
}
