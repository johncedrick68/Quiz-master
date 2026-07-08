import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizSession, Question } from '../../types/quiz';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { calculateSpeedBonus } from '../../lib/quizLogic';
import { Flame } from 'lucide-react';

interface QuizFlowProps {
  session: QuizSession;
  onComplete: (session: QuizSession) => void;
  onUpdateSession: (session: QuizSession) => void;
}

export function QuizFlow({ session, onComplete, onUpdateSession }: QuizFlowProps) {
  const [currentIdx, setCurrentIdx] = useState(session.currentQuestionIndex);
  const [showNextButton, setShowNextButton] = useState(false);
  const [addedScore, setAddedScore] = useState(0);

  const question = session.questions[currentIdx];
  const isLastQuestion = currentIdx === session.questions.length - 1;

  const handleAnswer = (selectedOptionIndex: number, timeTakenMs: number) => {
    const isCorrect = selectedOptionIndex === question.correctIndex;
    let newScore = session.score;
    let newStreak = session.streak;
    let newBestStreak = session.bestStreak;
    let turnScore = 0;

    if (isCorrect) {
      const basePoints = 1000;
      const speedBonus = calculateSpeedBonus(timeTakenMs);
      const streakBonus = Math.min(newStreak * 100, 500); // Max 500 streak bonus
      turnScore = basePoints + speedBonus + streakBonus;
      
      newScore += turnScore;
      newStreak += 1;
      if (newStreak > newBestStreak) {
        newBestStreak = newStreak;
      }
      setAddedScore(turnScore);
    } else {
      newStreak = 0;
      setAddedScore(0);
    }

    const updatedSession: QuizSession = {
      ...session,
      score: newScore,
      streak: newStreak,
      bestStreak: newBestStreak,
      answers: [
        ...session.answers,
        {
          questionIndex: currentIdx,
          selectedOptionIndex,
          isCorrect,
          timeTakenSeconds: Math.round(timeTakenMs / 1000),
        }
      ],
      currentQuestionIndex: isLastQuestion ? currentIdx : currentIdx + 1,
    };

    onUpdateSession(updatedSession);

    if (session.mode === 'study') {
      setShowNextButton(true);
    } else {
      // Challenge mode moves automatically or completes
      setTimeout(() => {
        if (isLastQuestion) {
          finishQuiz(updatedSession);
        } else {
          setCurrentIdx(prev => prev + 1);
        }
      }, 1000);
    }
  };

  const handleNext = () => {
    setShowNextButton(false);
    if (isLastQuestion) {
      finishQuiz(session);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const finishQuiz = (finalSession: QuizSession) => {
    onComplete({ ...finalSession, isComplete: true, endTime: Date.now() });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-4 pb-12 px-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-8 bg-dark-800/50 p-4 rounded-2xl border border-dark-700 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-sm text-slate-400 font-medium">Score</span>
          <motion.span 
            key={session.score}
            initial={{ scale: 1.5, color: '#22c55e' }}
            animate={{ scale: 1, color: '#f1f5f9' }}
            className="text-2xl font-bold font-mono"
          >
            {session.score}
          </motion.span>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <ProgressBar current={currentIdx + 1} total={session.questions.length} label="Progress" />
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-400 font-medium">Streak</span>
          <div className="flex items-center gap-1">
            <Flame className={`w-5 h-5 ${session.streak >= 3 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-2xl font-bold font-mono">{session.streak}</span>
          </div>
        </div>
      </div>

      <div className="md:hidden mb-6">
        <ProgressBar current={currentIdx + 1} total={session.questions.length} />
      </div>

      {/* Main Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard
            question={question}
            mode={session.mode}
            onAnswer={handleAnswer}
            timeLimitSeconds={30} // 30 sec per question optionally
          />
        </motion.div>
      </AnimatePresence>

      {/* Next Button for Study Mode */}
      <AnimatePresence>
        {showNextButton && session.mode === 'study' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <Button size="lg" onClick={handleNext} className="w-full max-w-md shadow-xl shadow-primary-500/20">
              {isLastQuestion ? 'View Results' : 'Next Question'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
