import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { UploadCloud, FileText, X, BookOpen } from 'lucide-react';
import { extractTextFromFile } from '../../lib/extractText';

interface FileUploaderProps {
  onContentReady: (text: string, filename: string) => void;
  isLoading: boolean;
}

export function FileUploader({ onContentReady, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manuscripts, setManuscripts] = useState<string[]>([]);
  const [isLoadingManuscript, setIsLoadingManuscript] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/manuscripts')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setManuscripts(data.files);
        }
      })
      .catch(err => console.error("Failed to load manuscripts list", err));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is too large. Please upload a file smaller than 10MB.");
      }
      const text = await extractTextFromFile(file);
      onContentReady(text, file.name);
    } catch (err: any) {
      setError(err.message || 'Error processing file');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim().length < 50) {
      setError("Please paste at least 50 characters to generate a meaningful quiz.");
      return;
    }
    setError(null);
    onContentReady(pastedText, "Pasted Text");
  };

  const loadManuscript = async (filename: string) => {
    setError(null);
    setIsLoadingManuscript(true);
    try {
      const res = await fetch(`/api/load-manuscript?filename=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onContentReady(data.text, filename);
    } catch (err: any) {
      setError(err.message || 'Failed to load manuscript');
    } finally {
      setIsLoadingManuscript(false);
    }
  };

  const isAnyLoading = isLoading || isLoadingManuscript;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {!pasteMode ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-colors ${
                dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800 hover:border-dark-600 hover:bg-dark-800/80'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleChange}
                className="hidden"
                disabled={isAnyLoading}
              />
              
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="w-20 h-20 mb-6 rounded-full bg-dark-900 flex items-center justify-center shadow-inner">
                  <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-primary-400' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2">Drag & drop your study material</h3>
                <p className="text-slate-400 mb-6">Supports .pdf, .docx, .txt, .md (Max 10MB)</p>
                
                <div className="flex gap-4 pointer-events-auto">
                  <Button 
                    onClick={() => inputRef.current?.click()} 
                    isLoading={isAnyLoading}
                  >
                    Browse Files
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPasteMode(true)}
                    disabled={isAnyLoading}
                  >
                    Paste Text
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-dark-800 rounded-3xl p-6 border border-dark-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" /> Paste your text
              </h3>
              <button 
                onClick={() => setPasteMode(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-dark-700 transition-colors"
                disabled={isAnyLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              className="w-full h-64 bg-dark-900 border border-dark-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4"
              placeholder="Paste your study material here (minimum 50 characters)..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={isAnyLoading}
            />
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setPasteMode(false)} disabled={isAnyLoading}>
                Cancel
              </Button>
              <Button onClick={handlePasteSubmit} isLoading={isAnyLoading}>
                Generate Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {manuscripts.length > 0 && !pasteMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800 border border-dark-700 rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-dark-700 pb-4">
            <BookOpen className="text-primary-400 w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-200">Pre-loaded Manuscripts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manuscripts.map((file, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="text-left justify-start h-auto p-4 overflow-hidden"
                onClick={() => loadManuscript(file)}
                disabled={isAnyLoading}
              >
                <FileText className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <span className="truncate flex-1" title={file}>{file.replace('.docx', '')}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
