"use client";

import React, { useState } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { LayoutTemplate, Palette, Type, Maximize, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TEMPLATES = [
  { id: 'professional', name: 'Professional', desc: 'Clean and ATS-friendly' },
  { id: 'creative', name: 'Creative', desc: 'Stand out with color' },
  { id: 'minimal', name: 'Minimal', desc: 'Focus on content' },
  { id: 'technical', name: 'Technical', desc: 'Great for engineering roles' },
];

const FONTS = [
  { id: 'inter', name: 'Inter (Sans-serif)' },
  { id: 'roboto', name: 'Roboto (Sans-serif)' },
  { id: 'merriweather', name: 'Merriweather (Serif)' },
  { id: 'fira-code', name: 'Fira Code (Monospace)' },
];

const COLORS = [
  { id: '#2563eb', name: 'Blue', class: 'bg-blue-600' },
  { id: '#10b981', name: 'Green', class: 'bg-green-500' },
  { id: '#8b5cf6', name: 'Purple', class: 'bg-purple-500' },
  { id: '#f59e0b', name: 'Orange', class: 'bg-orange-500' },
  { id: '#0f172a', name: 'Slate', class: 'bg-slate-900' },
];

const SPACINGS = [
  { id: 'compact', name: 'Compact' },
  { id: 'normal', name: 'Normal' },
  { id: 'relaxed', name: 'Relaxed' },
];

export default function DesignPage() {
  const { template, font, color, spacing, updateDesign } = useResumeStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'customize'>('templates');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col h-full"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Design & Layout</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a template and customize it to match your style.
        </p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'templates' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('templates')}
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </div>
          {activeTab === 'templates' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'customize' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('customize')}
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Customize
          </div>
          {activeTab === 'customize' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {activeTab === 'templates' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                onClick={() => updateDesign({ template: t.id })}
                className={`relative group cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  template === t.id ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Mock Thumbnail */}
                <div className="h-40 bg-gray-100 flex flex-col p-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className={`h-2 w-1/3 rounded-full mb-3 ${template === t.id ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div className="h-1.5 w-1/4 bg-gray-300 rounded-full mb-4" />
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-4/6 bg-gray-200 rounded-full" />
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    {template === t.id && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Color Selection */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Palette className="h-4 w-4 mr-2" /> Primary Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateDesign({ color: c.id })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.class} ${color === c.id ? 'ring-4 ring-offset-2 ring-blue-200 shadow-lg scale-110' : 'shadow-sm'}`}
                    aria-label={`Select ${c.name} color`}
                  >
                    {color === c.id && <CheckCircle2 className="h-5 w-5 text-white" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Type className="h-4 w-4 mr-2" /> Typography
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FONTS.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => updateDesign({ font: f.id })}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      font === f.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-900 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    {f.name}
                  </div>
                ))}
              </div>
            </section>

            {/* Spacing */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Maximize className="h-4 w-4 mr-2" /> Spacing & Layout
              </h3>
              <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-sm">
                {SPACINGS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateDesign({ spacing: s.id })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      spacing === s.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </section>

            {/* ATS Warning Banner */}
            {(template === 'creative' || spacing === 'compact') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 mt-6"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">ATS Parsing Warning</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Creative templates and compact spacing can sometimes cause issues with older Applicant Tracking Systems. Consider the Professional template if applying through corporate portals.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
