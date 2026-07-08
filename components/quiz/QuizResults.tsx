import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { QuizSession } from '../../types/quiz';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Trophy, Clock, Target, Flame, RefreshCcw, FileUp } from 'lucide-react';

interface QuizResultsProps {
  session: QuizSession;
  onRestart: () => void;
  onNewQuiz: () => void;
}

export function QuizResults({ session, onRestart, onNewQuiz }: QuizResultsProps) {
  const totalQuestions = session.questions.length;
  const correctAnswers = session.answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100) || 0;
  
  const timeTakenSeconds = session.endTime && session.startTime 
    ? Math.round((session.endTime - session.startTime) / 1000) 
    : session.answers.reduce((acc, curr) => acc + curr.timeTakenSeconds, 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  useEffect(() => {
    if (accuracy >= 80) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [accuracy]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500 mb-4">
            Quiz Complete!
          </h1>
          <p className="text-slate-400 text-lg">Great job. Here's how you performed.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Trophy className="w-6 h-6 text-yellow-500" />} label="Final Score" value={session.score.toString()} />
          <StatCard icon={<Target className="w-6 h-6 text-blue-500" />} label="Accuracy" value={`${accuracy}%`} />
          <StatCard icon={<Clock className="w-6 h-6 text-purple-500" />} label="Time Taken" value={formatTime(timeTakenSeconds)} />
          <StatCard icon={<Flame className="w-6 h-6 text-orange-500" />} label="Best Streak" value={session.bestStreak.toString()} />
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-slate-100 border-b border-dark-700 pb-4">Performance Details</h2>
          <div className="flex justify-around text-center mb-6">
            <div>
              <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Correct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500">{totalQuestions - correctAnswers}</p>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Incorrect</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-200">{totalQuestions}</p>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onRestart} className="flex-1 flex items-center justify-center gap-2">
            <RefreshCcw className="w-5 h-5" /> Retake Quiz
          </Button>
          <Button variant="secondary" size="lg" onClick={onNewQuiz} className="flex-1 flex items-center justify-center gap-2">
            <FileUp className="w-5 h-5" /> New Document
          </Button>
        </div>
        
        {/* Later: Add a detailed review section mapping through session.answers and session.questions */}
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-dark-600 transition-colors">
      <div className="mb-3 p-3 bg-dark-900 rounded-full shadow-inner">
        {icon}
      </div>
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}
