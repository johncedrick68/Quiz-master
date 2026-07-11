import { Question } from '../../types/quiz';
import { inferSignImage } from './inferSignImage';
import { buildDistractors } from './buildDistractors';

export type AnswerRow = [question: string, correctAnswer: string, wrongAnswer1?: string, wrongAnswer2?: string, image?: string];

export function makeEnglishQuestions(rows: AnswerRow[]): Question[] {
  return rows.map(([question, correctAnswer, wrongAnswer1, wrongAnswer2, image], index) => {
    const inferred = buildDistractors(rows, index);
    const wrongAnswers = [wrongAnswer1 ?? inferred[0], wrongAnswer2 ?? inferred[1]];
    const correctIndex = index % 3;
    const options = [...wrongAnswers];
    options.splice(correctIndex, 0, correctAnswer);
    const resolvedImage = image ?? inferSignImage(question, correctAnswer);
    return { question, options, correctIndex, explanation: `Correct answer: ${correctAnswer}.`, difficulty: 'Medium', ...(resolvedImage ? { image: resolvedImage } : {}) };
  });
}
