import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../../types/quiz';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionCardProps {
  question: Question;
  mode: 'study' | 'challenge';
  onAnswer: (selectedOptionIndex: number, timeTakenMs: number) => void;
  timeLimitSeconds?: number;
}

export function QuestionCard({ question, mode, onAnswer, timeLimitSeconds }: QuestionCardProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitSeconds || null);

  useEffect(() => {
    // Reset state when question changes
    setSelectedIdx(null);
    setHasAnswered(false);
    setStartTime(Date.now());
    setTimeLeft(timeLimitSeconds || null);
  }, [question, timeLimitSeconds]);

  useEffect(() => {
    if (timeLimitSeconds && !hasAnswered && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleOptionClick(-1); // -1 means timeout/no answer
    }
  }, [timeLeft, hasAnswered, timeLimitSeconds]);

  const handleOptionClick = (idx: number) => {
    if (hasAnswered) return;
    
    const timeTakenMs = Date.now() - startTime;
    setSelectedIdx(idx);
    setHasAnswered(true);
    
    // In challenge mode, we still show selection but might not reveal answer immediately depending on design.
    // The requirement says "No answers are revealed until the end." for challenge mode.
    // So we just call onAnswer.
    
    if (mode === 'challenge') {
      setTimeout(() => onAnswer(idx, timeTakenMs), 500); // small delay for UX
    } else {
      // Study mode: wait for user to read explanation, they have to click 'Next'
      onAnswer(idx, timeTakenMs);
    }
  };

  const isCorrect = selectedIdx === question.correctIndex;

  return (
    <Card className="max-w-3xl w-full mx-auto relative overflow-hidden">
      {timeLimitSeconds && !hasAnswered && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-dark-700">
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft! / timeLimitSeconds) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}

      <div className="mb-6 mt-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-2 leading-relaxed">
          {question.question}
        </h2>
        {question.difficulty && (
          <span className={clsx(
            "text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider",
            question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {question.difficulty}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, idx) => {
          let btnClass = "text-left h-auto min-h-[4rem] p-4";
          
          if (hasAnswered && mode === 'study') {
            if (idx === question.correctIndex) {
              btnClass += " bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]";
            } else if (idx === selectedIdx) {
              btnClass += " bg-red-500 border-red-400 text-white";
            } else {
              btnClass += " opacity-50";
            }
          } else if (selectedIdx === idx) {
            btnClass += " ring-2 ring-primary-500 bg-dark-700";
          }

          return (
            <Button
              key={idx}
              variant={hasAnswered && mode === 'study' ? 'primary' : 'outline'}
              className={btnClass}
              onClick={() => handleOptionClick(idx)}
              disabled={hasAnswered}
            >
              <div className="flex items-center w-full gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-900/50 flex items-center justify-center font-bold text-sm">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 whitespace-normal break-words">{option}</span>
                {hasAnswered && mode === 'study' && idx === question.correctIndex && (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                )}
                {hasAnswered && mode === 'study' && idx === selectedIdx && idx !== question.correctIndex && (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && mode === 'study' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={clsx(
              "p-4 rounded-xl border",
              isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
            )}>
              <h3 className={clsx(
                "font-bold text-lg mb-2",
                isCorrect ? "text-green-400" : "text-red-400"
              )}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </h3>
              <p className="text-slate-300">{question.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
