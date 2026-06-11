import { create } from 'zustand';

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  year: string;
  gpa: string;
}

export interface ResumeState {
  // Basic Info
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;

  // Sections
  experience: Experience[];
  education: Education[];
  skills: string[];

  // Design Options
  template: string;
  font: string;
  color: string;
  spacing: string;

  // Editor State
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;

  // Actions
  updateBasicInfo: (info: Partial<ResumeState>) => void;
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  reorderSkills: (skills: string[]) => void;

  updateDesign: (design: Partial<{ template: string; font: string; color: string; spacing: string }>) => void;

  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useResumeStore = create<ResumeState>((set) => ({
  fullName: '',
  targetRole: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',

  experience: [],
  education: [],
  skills: [],

  template: 'professional',
  font: 'inter',
  color: '#2563eb',
  spacing: 'normal',

  saveStatus: 'idle',
  lastSavedAt: null,

  updateBasicInfo: (info) => set((state) => ({ ...state, ...info })),
  
  addExperience: () => set((state) => ({
    experience: [
      ...state.experience,
      { id: generateId(), title: '', company: '', startDate: '', endDate: '', location: '', bullets: [''] }
    ]
  })),
  
  updateExperience: (id, data) => set((state) => ({
    experience: state.experience.map(exp => exp.id === id ? { ...exp, ...data } : exp)
  })),

  removeExperience: (id) => set((state) => ({
    experience: state.experience.filter(exp => exp.id !== id)
  })),

  addEducation: () => set((state) => ({
    education: [
      ...state.education,
      { id: generateId(), degree: '', field: '', institution: '', year: '', gpa: '' }
    ]
  })),

  updateEducation: (id, data) => set((state) => ({
    education: state.education.map(edu => edu.id === id ? { ...edu, ...data } : edu)
  })),

  removeEducation: (id) => set((state) => ({
    education: state.education.filter(edu => edu.id !== id)
  })),

  addSkill: (skill) => set((state) => ({
    skills: state.skills.includes(skill) ? state.skills : [...state.skills, skill]
  })),

  removeSkill: (skill) => set((state) => ({
    skills: state.skills.filter(s => s !== skill)
  })),

  reorderSkills: (skills) => set({ skills }),

  updateDesign: (design) => set((state) => ({ ...state, ...design })),

  setSaveStatus: (status) => set({ saveStatus: status, ...(status === 'saved' ? { lastSavedAt: new Date() } : {}) }),
}));
