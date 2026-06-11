"use client";

import React, { useState } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Card } from '../../../components/ui/Card';
import { Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExperiencePage() {
  const { experience, addExperience, updateExperience, removeExperience } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  
  // Slide out panel state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [activeBulletIndex, setActiveBulletIndex] = useState<{expId: string, bulletIdx: number} | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleImproveBullet = (expId: string, bulletIdx: number, text: string) => {
    setImprovingId(`${expId}-${bulletIdx}`);
    // Mock AI Call
    setTimeout(() => {
      setAiSuggestions([
        `Spearheaded ${text || 'project'} resulting in 30% increase in efficiency.`,
        `Led cross-functional team to deliver ${text || 'initiative'} ahead of schedule.`,
        `Optimized ${text || 'process'} generating $50k in annual savings.`
      ]);
      setActiveBulletIndex({ expId, bulletIdx });
      setShowAiPanel(true);
      setImprovingId(null);
    }, 1500);
  };

  const applyAiSuggestion = (suggestion: string) => {
    if (!activeBulletIndex) return;
    
    const { expId, bulletIdx } = activeBulletIndex;
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      const newBullets = [...exp.bullets];
      newBullets[bulletIdx] = suggestion;
      updateExperience(expId, { bullets: newBullets });
    }
    setShowAiPanel(false);
    setActiveBulletIndex(null);
  };

  return (
    <div className="relative overflow-hidden h-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-6 pb-20 ${showAiPanel ? 'w-2/3 pr-4' : 'w-full'} transition-all duration-300`}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add your relevant experience. Focus on your achievements and the impact you made.
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {experience.map((exp) => (
              <Card key={exp.id} className="overflow-hidden">
                <div 
                  className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpand(exp.id)}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {exp.title || 'New Position'} {exp.company && `at ${exp.company}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {exp.startDate || 'MM/YYYY'} - {exp.endDate || 'Present'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedId === exp.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === exp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-6 space-y-4 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Job Title"
                          placeholder="Software Engineer"
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                        />
                        <Input
                          label="Company"
                          placeholder="Acme Corp"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Start Date"
                            placeholder="MM/YYYY"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            error={!exp.startDate ? 'Required' : undefined}
                          />
                          <Input
                            label="End Date"
                            placeholder="MM/YYYY or Present"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Location"
                          placeholder="New York, NY"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Responsibilities & Achievements
                        </label>
                        {exp.bullets.map((bullet, bIndex) => (
                          <div key={bIndex} className="mb-3">
                            <div className="flex gap-2">
                              <Textarea
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...exp.bullets];
                                  newBullets[bIndex] = e.target.value;
                                  updateExperience(exp.id, { bullets: newBullets });
                                }}
                                placeholder="Describe what you did and the impact it had..."
                                className="min-h-[60px]"
                                helperText={`${bullet.length} chars (Recommended: 60-120)`}
                              />
                            </div>
                            <div className="flex justify-end mt-1">
                              <Button
                                variant="magic"
                                size="sm"
                                className="text-xs h-7 rounded px-2"
                                onClick={() => handleImproveBullet(exp.id, bIndex, bullet)}
                                isLoading={improvingId === `${exp.id}-${bIndex}`}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Improve with AI
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Bullet Point
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </AnimatePresence>

          <Button
            variant="outline"
            className="w-full border-dashed border-2 py-8 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
            onClick={() => {
              addExperience();
              // Expand the new one. In a real app we'd get the ID returned.
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Position
          </Button>
        </div>
      </motion.div>

      {/* AI Side Panel */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-0 right-0 w-1/3 h-full bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center text-blue-800 font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(false)}>Close</Button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Select a rewritten bullet point to replace your current one:</p>
              {aiSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-white border border-blue-100 rounded-lg shadow-sm hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => applyAiSuggestion(suggestion)}
                >
                  <p className="text-sm text-gray-800 leading-relaxed">{suggestion}</p>
                  <div className="mt-2 text-right">
                    <span className="text-xs font-medium text-blue-600">Use this</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
