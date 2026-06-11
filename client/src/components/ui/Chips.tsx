import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ChipsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const Chips: React.FC<ChipsProps> = ({ skills, onChange, label, placeholder = 'Type and press Enter...' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        onChange([...skills, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="w-full">
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-wrap gap-2 rounded-md border border-gray-300 bg-white p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-colors min-h-[42px]">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="rounded-full p-0.5 hover:bg-blue-200 transition-colors"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {skill}</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};
