const fs = require('fs');

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) throw new Error('Usage: node generateLightVehicleEnglish.js <source> <output>');

const lines = fs.readFileSync(sourcePath, 'utf8').replace(/\r/g, '').split('\n');
const rows = [];
for (let index = 0; index < lines.length; index += 1) {
  if (!lines[index].startsWith('Answer:')) continue;
  let questionIndex = index - 1;
  while (questionIndex >= 0 && !lines[questionIndex].trim()) questionIndex -= 1;
  rows.push([
    lines[questionIndex].trim(),
    lines[index].slice('Answer:'.length).replace(/\s*\[\d{2}:\d{2}\].*$/, '').trim(),
  ]);
}
if (rows.length < 50) throw new Error(`Only found ${rows.length} question-answer pairs`);

const serialized = rows.map(([question, answer]) => `  [${JSON.stringify(question)}, ${JSON.stringify(answer)}],`).join('\n');
fs.writeFileSync(outputPath, `import { AnswerRow, makeEnglishQuestions } from './englishQuestionFactory';

// Generated from the supplied Code B/B1 English transcript.
const rows: AnswerRow[] = [
${serialized}
];

export const lightVehicleBB1English = makeEnglishQuestions(rows);
`);
console.log(`Generated ${rows.length} questions in ${outputPath}`);
