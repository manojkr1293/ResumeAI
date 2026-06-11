"use client";

import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Chips } from '../../../components/ui/Chips';
import { Card } from '../../../components/ui/Card';
import { Plus, Trash2, Sparkles, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EducationSkillsPage() {
  const { 
    education, addEducation, updateEducation, removeEducation,
    skills, reorderSkills, addSkill, targetRole
  } = useResumeStore();

  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null);

  useEffect(() => {
    if (targetRole && aiSkills.length === 0) {
      setIsLoadingSkills(true);
      // Mock AI Call
      setTimeout(() => {
        setAiSkills(['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'GraphQL']);
        setIsLoadingSkills(false);
      }, 1000);
    }
  }, [targetRole, aiSkills.length]);

  const handleDragStart = (e: React.DragEvent, skill: string) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to make it look better
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, skill: string) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill === skill) return;

    const newSkills = [...skills];
    const draggedIndex = newSkills.indexOf(draggedSkill);
    const targetIndex = newSkills.indexOf(skill);

    newSkills.splice(draggedIndex, 1);
    newSkills.splice(targetIndex, 0, draggedSkill);

    reorderSkills(newSkills);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedSkill(null);
  };

  const handleAddAiSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      addSkill(skill);
      setAiSkills(aiSkills.filter(s => s !== skill));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Education Section */}
      <section>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add your educational background.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <AnimatePresence>
            {education.map((edu) => (
              <Card key={edu.id} className="p-4 bg-gray-50/50">
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Degree / Certificate"
                    placeholder="B.S."
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                  />
                  <Input
                    label="Field of Study"
                    placeholder="Computer Science"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                  />
                  <Input
                    label="Institution"
                    placeholder="University of Technology"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Graduation Year"
                      placeholder="YYYY"
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                    />
                    <Input
                      label="GPA (Optional)"
                      placeholder="3.8/4.0"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </AnimatePresence>
          <Button
            variant="outline"
            className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-300"
            onClick={addEducation}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Education
          </Button>
        </div>
      </section>

      {/* Skills Section */}
      <section className="pt-4 border-t border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add your core skills. Drag to reorder them (most important first).
          </p>
        </div>

        <div className="mt-4">
          <Chips
            skills={skills}
            onChange={reorderSkills}
            label="Your Skills"
          />

          {/* Draggable Area for Reordering */}
          {skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reorder Skills (Drag & Drop)</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    draggable
                    onDragStart={(e) => handleDragStart(e, skill)}
                    onDragOver={(e) => handleDragOver(e, skill)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm font-medium text-gray-700 cursor-move shadow-sm hover:border-blue-400 hover:shadow"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900 text-sm">
                AI Suggested Skills {targetRole ? `for ${targetRole}` : ''}
              </h3>
            </div>
            
            {isLoadingSkills ? (
              <p className="text-sm text-blue-600 animate-pulse">Analyzing role...</p>
            ) : aiSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aiSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleAddAiSkill(skill)}
                    className="flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1 text-sm text-blue-700 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                    {skill}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {targetRole ? "You've added all our suggestions!" : "Enter a Target Role in Profile to get suggestions."}
              </p>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
