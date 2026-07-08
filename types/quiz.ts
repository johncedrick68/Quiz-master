export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizSession {
  id: string;
  topic: string;
  questions: Question[];
  mode: 'study' | 'challenge';
  currentQuestionIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
    timeTakenSeconds: number;
  }[];
  isComplete: boolean;
  startTime: number;
  endTime?: number;
}
