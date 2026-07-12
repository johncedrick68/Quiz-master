import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSpeedBonus, randomizeQuiz, shuffleArray, shuffleQuestionOptions } from '../lib/quizLogic';
import { Question } from '../types/quiz';

const question: Question = {
  question: 'Example?',
  options: ['Correct', 'Wrong one', 'Wrong two'],
  correctIndex: 0,
  explanation: 'Example',
};

test('shuffleArray preserves the input and all values', () => {
  const input = [1, 2, 3, 4, 5];
  const result = shuffleArray(input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...result].sort(), input);
});

test('shuffling options keeps the correct answer index accurate', () => {
  for (let run = 0; run < 25; run += 1) {
    const shuffled = shuffleQuestionOptions(question);
    assert.equal(shuffled.options[shuffled.correctIndex], 'Correct');
  }
});

test('randomizeQuiz preserves every question and correct answer', () => {
  const questions = [question, { ...question, question: 'Second?', options: ['No', 'Yes', 'Maybe'], correctIndex: 1 }];
  const randomized = randomizeQuiz(questions);
  assert.equal(randomized.length, questions.length);
  assert.deepEqual(randomized.map((item) => item.question).sort(), ['Example?', 'Second?']);
  randomized.forEach((item) => assert.ok(['Correct', 'Yes'].includes(item.options[item.correctIndex])));
});

test('speed bonus stays within its documented boundaries', () => {
  assert.equal(calculateSpeedBonus(0), 500);
  assert.equal(calculateSpeedBonus(15_000), 0);
  assert.equal(calculateSpeedBonus(20_000), 0);
});
