import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, BookOpen, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
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

      {manuscripts.length > 0 && !selectedFile && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-dark-800 rounded-3xl p-6 sm:p-10 border border-dark-700 shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-primary-400 w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100">Comprehensive Study Guide</h2>
            <p className="text-slate-400 mb-8 max-w-lg text-sm sm:text-base">
              Generate a unified study reviewer covering all {manuscripts.length} of your pre-loaded manuscript chapters and defense bibles. This extracts direct Q&A pairs to help you memorize key facts.
            </p>
            
            <Button
              className="w-full sm:w-auto px-8 py-4 text-lg"
              onClick={async () => {
                setError(null);
                setSelectedFile('Comprehensive_All_Manuscripts');
                setIsLoading(true);
                setQaPairs([]);
            
                try {
                  const txtRes = await fetch('/api/load-all-manuscripts');
                  const txtData = await txtRes.json();
                  if (!txtRes.ok) throw new Error(txtData.error);

                  const res = await fetch('/api/generate-reviewer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: txtData.text })
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
              }}
            >
              Generate Comprehensive Reviewer
            </Button>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-lg sm:text-xl text-slate-300 font-medium">Analyzing all manuscripts...</p>
          <p className="text-sm text-slate-500 mt-2">Extracting the best Q&A pairs for your defense.</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center shadow-lg mx-4">
          <p className="mb-4 font-medium">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => setSelectedFile(null)}>Try Again</Button>
            <Button variant="ghost" onClick={() => setSelectedFile(null)}>Go Back</Button>
          </div>
        </div>
      )}

      {qaPairs.length > 0 && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-md">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Comprehensive Study Guide</h2>
              <p className="text-slate-400 text-sm mt-1">{qaPairs.length} questions extracted from all sources</p>
            </div>
            <Button variant="outline" onClick={() => {
              setQaPairs([]);
              setSelectedFile(null);
            }}>
              Reset Reviewer
            </Button>
          </div>
          
          <div className="space-y-6">
            {qaPairs.map((pair, idx) => (
              <div key={idx} className="bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-700 shadow-md relative overflow-hidden transition-all hover:border-primary-500/50">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-300 mb-4 flex items-start gap-3">
                  <span className="text-primary-500/50 text-base sm:text-lg mt-0.5 flex-shrink-0 font-bold">Q{idx + 1}.</span>
                  <span className="leading-snug">{pair.question}</span>
                </h3>
                <div className="bg-dark-900/60 rounded-xl p-4 sm:p-5 sm:ml-8 border border-dark-700/50">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-green-400 font-bold mb-2 block flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Best Answer
                  </span>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{pair.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center pb-12">
            <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to Top
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  </>
);
}
