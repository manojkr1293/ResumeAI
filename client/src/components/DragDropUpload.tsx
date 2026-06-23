import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

type Props = {
  setResumeFile: (file: File) => void;
  setResumeText: (text: string) => void;
};

export default function DragDropUpload({ setResumeFile, setResumeText }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setResumeFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setResumeText(text);
      };
      try {
        reader.readAsText(file);
      } catch (_) {
        setResumeText('');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        dragActive 
          ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_15px_rgba(56,189,248,0.25)] scale-[0.99]' 
          : 'border-slate-700/80 bg-slate-900/35 hover:border-slate-500 hover:bg-slate-800/20'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
        onChange={e => handleFiles(e.target.files)}
      />
      <Upload className={`mx-auto mb-3 h-10 w-10 transition-transform duration-300 ${dragActive ? 'text-sky-400 scale-110 animate-bounce' : 'text-slate-400'}`} />
      <p className="text-sm font-medium text-slate-300">
        Drag &amp; drop your resume here, or <span className="text-sky-400 underline underline-offset-4">browse files</span>
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Supports PDF, DOCX, TXT, MD
      </p>
    </div>
  );
}

