import React from 'react';

interface ResumePreviewProps {
  text: string;
  setText: (value: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ text, setText }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        Resume Text Preview (editable)
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="w-full rounded-xl border border-slate-700/80 bg-slate-900/40 text-slate-200 p-3.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-md outline-none transition duration-200 font-mono text-xs leading-relaxed"
        placeholder="Your resume text will appear here..."
      />
    </div>
  );
};

export default ResumePreview;

