const fs = require('fs');

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) throw new Error('Usage: node generateLightVehicleTagalog.js <source> <output>');

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r/g, '');
const lines = text.split('\n');
const rows = [];
for (let index = 0; index < lines.length; index += 1) {
  if (!lines[index].startsWith('Sagot:')) continue;
  let questionIndex = index - 1;
  while (questionIndex >= 0 && !lines[questionIndex].trim()) questionIndex -= 1;
  const question = lines[questionIndex].trim();
  const answer = lines[index].slice('Sagot:'.length).replace(/\s*\[\d{2}:\d{2}\].*$/, '').trim();
  rows.push([question, answer]);
}

if (rows.length < 150) throw new Error(`Only found ${rows.length} question-answer pairs`);

const serialized = rows.map(([question, answer]) => `  [${JSON.stringify(question)}, ${JSON.stringify(answer)}],`).join('\n');
const output = `import { AnswerRow, makeTagalogQuestions } from './tagalogQuestionFactory';

// Generated from the supplied Code B/B1/B2 Tagalog transcript.
// The second value in every row is the answer supplied by the user.
const rows: AnswerRow[] = [
${serialized}
];

export const lightVehicleBB1B2Tagalog = makeTagalogQuestions(rows);
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated ${rows.length} questions in ${outputPath}`);
