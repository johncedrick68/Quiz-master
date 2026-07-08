import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface QAPair {
  question: string;
  answer: string;
}

export default function Reviewer() {
  const [manuscripts, setManuscripts] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/manuscripts')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setManuscripts(data.files);
        }
      })
      .catch(err => console.error("Failed to load manuscripts", err));
  }, []);

  const loadReviewer = async (filename: string) => {
    setError(null);
    setSelectedFile(filename);
    setIsLoading(true);
    setQaPairs([]);

    try {
      const res = await fetch('/api/generate-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reviewer content');
      }

      if (data.pairs) {
        setQaPairs(data.pairs);
      } else {
        throw new Error('No Q&A pairs returned.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Quiz Master - Reviewer Mode</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-10">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary-400" />
            <h1 className="text-2xl font-bold">Reviewer Mode</h1>
          </div>
        </header>

        {!selectedFile && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-dark-800 rounded-3xl p-8 border border-dark-700 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 text-center text-slate-200">Select a Manuscript to Review</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {manuscripts.map((file, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="text-left justify-start h-auto p-4 overflow-hidden"
                  onClick={() => loadReviewer(file)}
                >
                  <FileText className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span className="truncate flex-1" title={file}>{file.replace('.docx', '')}</span>
                </Button>
              ))}
            </div>
            {manuscripts.length === 0 && (
              <p className="text-center text-slate-400">No manuscripts found.</p>
            )}
          </motion.div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg text-slate-300">Generating Study Guide for {selectedFile}...</p>
            <p className="text-sm text-slate-500 mt-2">This may take a minute.</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center shadow-lg">
            <p className="mb-4">{error}</p>
            <Button onClick={() => selectedFile && loadReviewer(selectedFile)}>Retry</Button>
            <Button variant="ghost" onClick={() => setSelectedFile(null)} className="ml-4">Go Back</Button>
          </div>
        )}

        {qaPairs.length > 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-100">Study Guide: {selectedFile?.replace('.docx', '')}</h2>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>Change File</Button>
            </div>
            
            <div className="space-y-6">
              {qaPairs.map((pair, idx) => (
                <div key={idx} className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-3 flex items-start gap-3">
                    <span className="text-primary-500/50 text-sm mt-1 flex-shrink-0">Q{idx + 1}.</span>
                    {pair.question}
                  </h3>
                  <div className="bg-dark-900/50 rounded-xl p-4 ml-6 border border-dark-700/50">
                    <span className="text-xs uppercase tracking-wider text-green-400 font-bold mb-1 block">Best Answer:</span>
                    <p className="text-slate-300 leading-relaxed">{pair.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
