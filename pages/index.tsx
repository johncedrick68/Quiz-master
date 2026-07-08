import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { FileUploader } from '../components/upload/FileUploader';
import { QuizFlow } from '../components/quiz/QuizFlow';
import { QuizResults } from '../components/quiz/QuizResults';
import { QuizSession, Question } from '../types/quiz';
import { randomizeQuiz } from '../lib/quizLogic';
import { Button } from '../components/ui/Button';

type AppState = 'upload' | 'setup' | 'quiz' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState('');

  const [session, setSession] = useState<QuizSession | null>(null);

  const handleContentReady = (text: string, name: string) => {
    setDocumentText(text);
    setFileName(name);
    setAppState('setup');
  };

  const generateAndStart = async (mode: 'study' | 'challenge') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText, fileName, mode }),
      });

      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch {
        // If Vercel throws a generic timeout or 500 error, it returns plain text like "An error occurred..."
        throw new Error(textResponse.slice(0, 100) || 'Server returned an invalid response (not JSON).');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setGeneratedQuestions(data.questions);
      setTopic(data.topic);

      // Initialize Session
      startNewSession(data.questions, data.topic, mode);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = (questions: Question[], quizTopic: string, mode: 'study' | 'challenge') => {
    const randomized = randomizeQuiz(questions);
    setSession({
      id: uuidv4(),
      topic: quizTopic,
      questions: randomized,
      mode,
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      answers: [],
      isComplete: false,
      startTime: Date.now(),
    });
    setAppState('quiz');
  };

  const restartWithSameQuestions = () => {
    if (!session || generatedQuestions.length === 0) return;
    startNewSession(generatedQuestions, topic, session.mode);
  };

  const handleQuizComplete = (finalSession: QuizSession) => {
    setSession(finalSession);
    setAppState('results');
  };

  const handleUpdateSession = (updatedSession: QuizSession) => {
    setSession(updatedSession);
  };

  return (
    <>
      <Head>
        <title>AI Quiz by Cedrick</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-blue-500 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">Q</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Quiz Master by Cedrick
            </h1>
          </motion.div>

          <Link href="/reviewer">
            <Button variant="outline" className="flex items-center gap-2 border-primary-500/50 hover:bg-primary-500/10 hover:border-primary-500 text-primary-300">
              <BookOpen className="w-4 h-4" /> Study Guide / Reviewer
            </Button>
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-x-hidden">
          <AnimatePresence mode="wait">

            {appState === 'upload' && (
              <motion.div
                key="upload-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl text-center"
              >
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                  Turn Any Document Into an <span className="text-primary-400">Interactive Quiz</span>
                </h2>
                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                  Upload your study materials, and our AI will instantly generate up to 50 smart, dynamic multiple-choice questions.
                </p>
                <FileUploader onContentReady={handleContentReady} isLoading={false} />
              </motion.div>
            )}

            {appState === 'setup' && (
              <motion.div
                key="setup-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-xl text-center"
              >
                <h2 className="text-3xl font-bold mb-4">Choose Your Mode</h2>
                <p className="text-slate-400 mb-8">File: {fileName}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex flex-col items-center hover:border-primary-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-primary-400 mb-2">Study Mode</h3>
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                      Learn as you go. See the correct answer and explanation immediately after answering. No time pressure.
                    </p>
                    <Button onClick={() => generateAndStart('study')} isLoading={isLoading} className="w-full">
                      Start Study Mode
                    </Button>
                  </div>

                  <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex flex-col items-center hover:border-orange-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-orange-400 mb-2">Challenge Mode</h3>
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                      Test your knowledge. Timer is active, and answers are only revealed at the very end.
                    </p>
                    <Button variant="secondary" onClick={() => generateAndStart('challenge')} isLoading={isLoading} className="w-full border border-orange-500/30 hover:bg-orange-500/20 text-orange-400">
                      Start Challenge Mode
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-4 text-sm border border-red-500/20">
                    {error}
                  </div>
                )}

                <Button variant="ghost" onClick={() => setAppState('upload')} disabled={isLoading}>
                  Cancel and Upload Different File
                </Button>
              </motion.div>
            )}

            {appState === 'quiz' && session && (
              <motion.div
                key="quiz-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <QuizFlow
                  session={session}
                  onComplete={handleQuizComplete}
                  onUpdateSession={handleUpdateSession}
                />
              </motion.div>
            )}

            {appState === 'results' && session && (
              <motion.div
                key="results-view"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <QuizResults
                  session={session}
                  onRestart={restartWithSameQuestions}
                  onNewQuiz={() => {
                    setSession(null);
                    setAppState('upload');
                  }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
