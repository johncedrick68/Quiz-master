import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { UploadCloud, FileText, X, BookOpen, ChevronRight, Brain } from 'lucide-react';
import { extractTextFromFile } from '../../lib/extractText';

interface FileUploaderProps {
  onContentReady: (text: string, filename: string) => void;
  isLoading: boolean;
}

type ActiveTab = 'comprehensive' | 'chapter' | 'upload';

export function FileUploader({ onContentReady, isLoading }: FileUploaderProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('comprehensive');
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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = async (file: File) => {
    setError(null);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("File is too large. Max 10MB.");
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
    if (e.dataTransfer.files?.[0]) await processFile(e.dataTransfer.files[0]);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) await processFile(e.target.files[0]);
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

  const loadAllManuscripts = async () => {
    setError(null);
    setIsLoadingManuscript(true);
    try {
      const res = await fetch('/api/load-all-manuscripts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onContentReady(data.text, 'Comprehensive_All_Manuscripts');
    } catch (err: any) {
      setError(err.message || 'Failed to load comprehensive manuscript');
    } finally {
      setIsLoadingManuscript(false);
    }
  };

  const isAnyLoading = isLoading || isLoadingManuscript;

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'comprehensive', label: 'All Chapters', icon: <Brain className="w-4 h-4" /> },
    { key: 'chapter', label: 'By Chapter', icon: <FileText className="w-4 h-4" /> },
    { key: 'upload', label: 'Upload / Paste', icon: <UploadCloud className="w-4 h-4" /> },
  ];

  function friendlyName(file: string) {
    return file
      .replace('.txt', '')
      .replace('PasaHero Manuscript ', '')
      .replace('PasaHERO_Defense_Bible_V2_', '');
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

      {/* Tab Bar */}
      <div className="flex rounded-2xl bg-dark-800 p-1.5 gap-1 border border-dark-700 shadow-lg">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
            }`}
          >
            {tab.icon}
            <span className="hidden xs:inline sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* === TAB: ALL CHAPTERS === */}
        {activeTab === 'comprehensive' && (
          <motion.div
            key="comprehensive"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="text-primary-400 w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">Comprehensive Quiz</h3>
              <p className="text-slate-400 mb-8 max-w-md text-sm sm:text-base">
                Generates a 50-item quiz covering <strong className="text-slate-200">all {manuscripts.length} chapters</strong> and defense bibles — perfect for full oral defense practice.
              </p>
              <Button
                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg"
                onClick={loadAllManuscripts}
                disabled={isAnyLoading}
                isLoading={isLoadingManuscript}
              >
                Start Comprehensive Quiz
              </Button>
            </div>
          </motion.div>
        )}

        {/* === TAB: BY CHAPTER === */}
        {activeTab === 'chapter' && (
          <motion.div
            key="chapter"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-dark-800 border border-dark-700 rounded-3xl p-5 sm:p-8 shadow-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-1">Focus on a Specific Chapter</h3>
            <p className="text-slate-400 text-sm mb-5">Tap a chapter to generate a quiz from that source only.</p>
            <div className="flex flex-col gap-2">
              {manuscripts.length === 0 && (
                <p className="text-center text-slate-500 py-6">No manuscripts found.</p>
              )}
              {manuscripts.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => loadManuscript(file)}
                  disabled={isAnyLoading}
                  className="flex items-center justify-between w-full text-left px-4 py-4 rounded-xl border border-dark-700 bg-dark-900 hover:border-primary-500/60 hover:bg-dark-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-primary-500/10 flex items-center justify-center text-xs font-bold text-primary-400">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-slate-200 text-sm truncate" title={file}>
                      {friendlyName(file)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 flex-shrink-0 ml-2 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === TAB: UPLOAD / PASTE === */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            {!pasteMode ? (
              <div
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 bg-dark-800 hover:border-dark-600'
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
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-dark-900 flex items-center justify-center shadow-inner">
                    <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-primary-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-1">Upload your own file</h3>
                  <p className="text-slate-400 text-sm mb-6">Supports .pdf, .docx, .txt, .md (Max 10MB)</p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={() => inputRef.current?.click()} isLoading={isAnyLoading} className="w-full sm:w-auto">
                      Browse Files
                    </Button>
                    <Button variant="outline" onClick={() => setPasteMode(true)} disabled={isAnyLoading} className="w-full sm:w-auto">
                      Paste Text
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-dark-800 rounded-3xl p-6 border border-dark-700 shadow-xl">
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
                  className="w-full h-52 bg-dark-900 border border-dark-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4 text-sm"
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
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
