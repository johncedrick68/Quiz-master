import { Question } from "../../types/quiz";
import { inferSignImage } from "./inferSignImage";
import { buildDistractors } from "./buildDistractors";
import { attachQuestionSource } from "./questionSources";

export type AnswerRow = [
  question: string,
  correctAnswer: string,
  wrongAnswer1?: string,
  wrongAnswer2?: string,
  image?: string,
];

const fallbackWrongAnswers = [
  "Hindi ito kinakailangan ayon sa batas-trapiko",
  "Depende lamang sa kagustuhan ng driver",
];

export function makeTagalogQuestions(rows: AnswerRow[]): Question[] {
  return rows.filter(([, , wrongAnswer1, wrongAnswer2]) => Boolean(wrongAnswer1 && wrongAnswer2)).map(
    ([question, correctAnswer, wrongAnswer1, wrongAnswer2, image], index) => {
      const inferred = buildDistractors(rows, index);
      const wrongAnswers = [
        wrongAnswer1 ?? inferred[0] ?? fallbackWrongAnswers[0],
        wrongAnswer2 ?? inferred[1] ?? fallbackWrongAnswers[1],
      ];
      const correctIndex = index % 3;
      const options = [...wrongAnswers];
      options.splice(correctIndex, 0, correctAnswer);
      const resolvedImage = image ?? inferSignImage(question, correctAnswer);
      return attachQuestionSource({
        question,
        options,
        correctIndex,
        explanation: `Tamang sagot: ${correctAnswer}.`,
        difficulty: "Medium",
        reviewStatus: "curated",
        ...(resolvedImage ? { image: resolvedImage } : {}),
      });
    },
  );
}
