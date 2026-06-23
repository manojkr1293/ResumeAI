import React, { ReactNode } from 'react';

interface WizardStepperProps {
  steps: string[]; // step titles
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode; // content for the current step
}

export default function WizardStepper({ steps, currentStep, onNext, onBack, children }: WizardStepperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center mb-8 justify-between relative px-2">
        {steps.map((title, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center z-10">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 ${
                  idx === currentStep 
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-110 border border-sky-300/30' 
                    : idx < currentStep 
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-xxs font-medium mt-2 hidden sm:inline ${idx <= currentStep ? 'text-slate-200' : 'text-slate-500'}`}>
                {title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-slate-800 relative -top-3 sm:-top-1">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-all duration-500" 
                  style={{ width: idx < currentStep ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current step title and content */}
      <div className="bg-slate-900/30 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 pb-2 border-b border-slate-800/80">
          {steps[currentStep]}
        </h2>
        <div className="space-y-4">
          {children}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition duration-200 text-sm font-semibold hover:bg-slate-700/80 active:scale-95"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-450 text-white rounded-xl transition duration-200 text-sm font-semibold active:scale-95 shadow-lg shadow-sky-500/10"
          >
            Next Step
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

