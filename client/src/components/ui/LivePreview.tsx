"use client";

import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export const LivePreview = () => {
  const { fullName, targetRole, email, phone, location, linkedin, experience, education, skills } = useResumeStore();

  return (
    <div className="w-full h-full bg-white shadow-lg border border-gray-200 p-8 text-sm text-gray-800 overflow-y-auto">
      <header className="border-b-2 border-gray-800 pb-4 mb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">
          {fullName || 'Your Name'}
        </h1>
        <p className="text-lg font-medium text-blue-600 mt-1">
          {targetRole || 'Target Role'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-gray-600">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {linkedin && <span>{linkedin}</span>}
        </div>
      </header>

      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider text-gray-800">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>{exp.title || 'Job Title'} at {exp.company || 'Company'}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                {exp.location && <p className="text-xs italic text-gray-600 mb-1">{exp.location}</p>}
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  {exp.bullets.filter(b => b.trim()).map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider text-gray-800">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <p className="font-bold">{edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}</p>
                  <p className="text-gray-700">{edu.institution || 'Institution'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-normal text-gray-500">{edu.year}</p>
                  {edu.gpa && <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider text-gray-800">
            Skills
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {skills.join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
};
