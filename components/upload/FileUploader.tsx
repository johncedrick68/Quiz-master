import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { UploadCloud, FileText, X } from 'lucide-react';
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
  
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Note: in a real app, lib/extractText would be updated to TS. 
      // For now we assume it exports extractTextFromFile.
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

  return (
    <div className="w-full max-w-2xl mx-auto">
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
                disabled={isLoading}
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
                    isLoading={isLoading}
                  >
                    Browse Files
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPasteMode(true)}
                    disabled={isLoading}
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
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              className="w-full h-64 bg-dark-900 border border-dark-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4"
              placeholder="Paste your study material here (minimum 50 characters)..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setPasteMode(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handlePasteSubmit} isLoading={isLoading}>
                Generate Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
