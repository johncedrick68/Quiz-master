import { Question } from '../types/quiz';

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Shuffles the options of a question and updates the correctIndex
 * to point to the correct option in the new shuffled array.
 */
export function shuffleQuestionOptions(question: Question): Question {
  const optionsWithIndex = question.options.map((opt, index) => ({
    text: opt,
    isCorrect: index === question.correctIndex,
  }));

  const shuffled = shuffleArray(optionsWithIndex);
  
  return {
    ...question,
    options: shuffled.map((o) => o.text),
    correctIndex: shuffled.findIndex((o) => o.isCorrect),
  };
}

/**
 * Randomizes the entire quiz: shuffles question order and their options.
 */
export function randomizeQuiz(questions: Question[]): Question[] {
  const shuffledQuestions = shuffleArray(questions);
  return shuffledQuestions.map(shuffleQuestionOptions);
}

export function calculateSpeedBonus(timeTakenMs: number, maxBonusMs = 15000): number {
  if (timeTakenMs >= maxBonusMs) return 0;
  // Up to 500 bonus points for fast answers
  const factor = 1 - (timeTakenMs / maxBonusMs);
  return Math.round(500 * factor);
}
