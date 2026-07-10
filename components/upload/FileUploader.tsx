import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardPaste, FileText, UploadCloud, X } from 'lucide-react';
import { extractTextFromFile } from '../../lib/extractText';
import { Button } from '../ui/Button';

interface FileUploaderProps { onContentReady: (text: string, filename: string) => void; isLoading: boolean; }

export function FileUploader({ onContentReady, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processFile = async (file: File) => {
    setError(null);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('File is too large. The maximum size is 10 MB.');
      const text = await extractTextFromFile(file);
      if (text.trim().length < 50) throw new Error('This document does not contain enough readable text to make a quiz.');
      onContentReady(text, file.name);
    } catch (err: any) { setError(err.message || 'Unable to read that file.'); }
  };
  const handleDrop = async (event: React.DragEvent) => { event.preventDefault(); setDragActive(false); if (event.dataTransfer.files?.[0]) await processFile(event.dataTransfer.files[0]); };
  const submitPastedText = () => {
    if (pastedText.trim().length < 50) return setError('Paste at least 50 characters so we can create meaningful questions.');
    setError(null); onContentReady(pastedText, 'Pasted text');
  };
  return <div className="w-full max-w-2xl mx-auto">
    <AnimatePresence mode="wait">
      {!pasteMode ? <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800 hover:border-dark-600'}`} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
        <input ref={inputRef} type="file" accept=".pdf,.txt,.md" onChange={(event) => event.target.files?.[0] && processFile(event.target.files[0])} className="hidden" disabled={isLoading} />
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-dark-900 flex items-center justify-center"><UploadCloud className="w-8 h-8 text-primary-400" /></div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Drop in a document</h3><p className="text-slate-400 text-sm mb-7">PDF, TXT, or Markdown · up to 10 MB · your file stays in your browser</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3"><Button onClick={() => inputRef.current?.click()} disabled={isLoading} isLoading={isLoading}><UploadCloud className="w-4 h-4 mr-2" />Choose file</Button><Button variant="outline" onClick={() => setPasteMode(true)} disabled={isLoading}><ClipboardPaste className="w-4 h-4 mr-2" />Paste text</Button></div>
      </motion.div> : <motion.div key="paste" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="bg-dark-800 rounded-3xl p-6 border border-dark-700 shadow-xl text-left">
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary-400" />Paste document text</h3><button onClick={() => setPasteMode(false)} className="p-2 text-slate-400 hover:text-white" disabled={isLoading} aria-label="Close paste text"><X className="w-5 h-5" /></button></div>
        <textarea className="w-full h-56 bg-dark-900 border border-dark-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4 text-sm" placeholder="Paste your notes, article, chapter, or lesson here…" value={pastedText} onChange={(event) => setPastedText(event.target.value)} disabled={isLoading} />
        <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setPasteMode(false)} disabled={isLoading}>Cancel</Button><Button onClick={submitPastedText} disabled={isLoading}>Create quiz</Button></div>
      </motion.div>}
    </AnimatePresence>
    {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">{error}</motion.p>}
  </div>;
}
