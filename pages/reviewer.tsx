import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, ArrowLeft, Loader2, CheckCircle, Eye, PenTool } from 'lucide-react';
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

  // Active Recall & Chunking State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Chunking to prevent cognitive overload
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

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

  const loadReviewer = async (filename: string, isComprehensive: boolean = false) => {
    setError(null);
    setSelectedFile(isComprehensive ? 'Comprehensive_All_Manuscripts' : filename);
    setIsLoading(true);
    setQaPairs([]);
    setCurrentPage(1);
    setRevealedAnswers(new Set());
    setUserAnswers({});

    try {
      let textData = '';
      if (isComprehensive) {
        const txtRes = await fetch('/api/load-all-manuscripts');
        const txtJson = await txtRes.json();
        if (!txtRes.ok) throw new Error(txtJson.error);
        textData = txtJson.text;
      }

      const body = isComprehensive ? { text: textData } : { filename };

      const res = await fetch('/api/generate-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error(textResponse.slice(0, 100) || 'Server returned an invalid response (not JSON).');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to generate reviewer content');
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

  const toggleReveal = (index: number) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(index)) {
      newRevealed.delete(index);
    } else {
      newRevealed.add(index);
    }
    setRevealedAnswers(newRevealed);
  };

  const totalPages = Math.ceil(qaPairs.length / itemsPerPage);
  const currentChunks = qaPairs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            className="flex flex-col gap-6 max-w-4xl mx-auto"
          >
            {/* Comprehensive Mode */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-3xl p-6 sm:p-10 shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="text-primary-400 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100">Comprehensive Study Guide</h2>
                <p className="text-slate-400 mb-8 max-w-lg text-sm sm:text-base">
                  Generate a unified study reviewer covering all {manuscripts.length} of your pre-loaded manuscript chapters and defense bibles. Uses Spaced Repetition chunking.
                </p>
                
                <Button
                  className="w-full sm:w-auto px-8 py-4 text-lg"
                  onClick={() => loadReviewer('', true)}
                >
                  Generate Comprehensive Reviewer
                </Button>
              </div>
            </div>

            {/* Specific Chapter Mode */}
            <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 sm:p-10 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" /> Focus on Specific Chapter
              </h3>
              <p className="text-slate-400 mb-6 text-sm">Perfect for Active Recall and Blurting Study Method on a specific topic.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {manuscripts.map((file, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4 flex-col items-start gap-1"
                    onClick={() => loadReviewer(file, false)}
                  >
                    <span className="truncate w-full font-semibold text-slate-200" title={file}>
                      {file.replace('.txt', '').replace('PasaHero Manuscript ', '').replace('PasaHERO_Defense_Bible_V2_', '')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg sm:text-xl text-slate-300 font-medium">Analyzing manuscripts...</p>
            <p className="text-sm text-slate-500 mt-2">Extracting Q&A pairs for active recall.</p>
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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Study Guide</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedFile?.replace('.txt', '')} • {qaPairs.length} items total</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Change Topic
              </Button>
            </div>
            
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Chunk {currentPage} of {totalPages}
              </span>
              <span className="text-xs text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full font-bold">
                Blurting Method Active
              </span>
            </div>

            <div className="space-y-6 mb-8">
              {currentChunks.map((pair, idx) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                const isRevealed = revealedAnswers.has(globalIndex);
                
                return (
                  <div key={globalIndex} className="bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-700 shadow-md relative overflow-hidden transition-all">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                    <h3 className="text-lg sm:text-xl font-semibold text-primary-300 mb-4 flex items-start gap-3">
                      <span className="text-primary-500/50 text-base sm:text-lg mt-0.5 flex-shrink-0 font-bold">Q{globalIndex + 1}.</span>
                      <span className="leading-snug">{pair.question}</span>
                    </h3>
                    
                    {!isRevealed ? (
                      <div className="sm:ml-8 mb-4">
                        <label className="text-xs uppercase text-slate-400 mb-2 flex items-center gap-2 font-semibold">
                          <PenTool className="w-3 h-3" /> Blurt your answer (Active Recall)
                        </label>
                        <textarea
                          className="w-full bg-dark-900 border border-dark-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          rows={3}
                          placeholder="Type what you remember here..."
                          value={userAnswers[globalIndex] || ''}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [globalIndex]: e.target.value })}
                        />
                      </div>
                    ) : (
                      <AnimatePresence>
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-dark-900/60 rounded-xl p-4 sm:p-5 sm:ml-8 border border-green-500/30 mb-4"
                        >
                          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-green-400 font-bold mb-2 block flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Correct Answer
                          </span>
                          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{pair.answer}</p>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    <div className="sm:ml-8 flex justify-end">
                      <Button 
                        variant={isRevealed ? "ghost" : "primary"} 
                        onClick={() => toggleReveal(globalIndex)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {isRevealed ? "Hide Answer" : "Reveal Answer"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-dark-800 p-4 rounded-2xl border border-dark-700 mb-12">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                >
                  Previous Chunk
                </Button>
                <span className="text-slate-400 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                >
                  Next Chunk
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
