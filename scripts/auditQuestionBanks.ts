import fs from 'fs';
import path from 'path';
import { Question } from '../types/quiz';
import { motorcycleAA1English } from '../data/lto/motorcycleAA1English';
import { motorcycleAA1EnglishPart2 } from '../data/lto/motorcycleAA1EnglishPart2';
import { motorcycleAA1Tagalog } from '../data/lto/motorcycleAA1Tagalog';
import { motorcycleAA1TagalogPart2 } from '../data/lto/motorcycleAA1TagalogPart2';
import { motorcycleAA1TagalogPart3 } from '../data/lto/motorcycleAA1TagalogPart3';
import { lightVehicleBB1English } from '../data/lto/lightVehicleBB1English';
import { lightVehicleBB1B2Tagalog } from '../data/lto/lightVehicleBB1B2Tagalog';

const banks: Record<string, Question[]> = {
  motorcycleAA1English,
  motorcycleAA1EnglishPart2,
  motorcycleAA1Tagalog,
  motorcycleAA1TagalogPart2,
  motorcycleAA1TagalogPart3,
  lightVehicleBB1English,
  lightVehicleBB1B2Tagalog,
};

const visualPattern = /(what does this (traffic )?sign|what does this picture|this picture shows|where do you see this traffic sign|ano ang ibig sabihin ng (senyas|ilaw).*ito|alin .*nakalarawan|saan .*senyas.*ito|senyas na ito|signal na ito|sign na ito|this sign mean|this traffic light)/i;
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const problems: string[] = [];
const transcriptArtifacts: string[] = [];
const allQuestions: { bank: string; index: number; question: Question }[] = [];

for (const [bank, questions] of Object.entries(banks)) {
  questions.forEach((question, index) => {
    allQuestions.push({ bank, index, question });
    if (question.options.length !== 3) problems.push(`${bank} #${index + 1}: expected 3 options`);
    if (question.correctIndex < 0 || question.correctIndex >= question.options.length) problems.push(`${bank} #${index + 1}: invalid correctIndex`);
    if (new Set(question.options.map(normalize)).size !== question.options.length) problems.push(`${bank} #${index + 1}: duplicate/synonymous exact options`);
    if (question.image) {
      const imagePath = path.join(process.cwd(), 'public', question.image.replace(/^\//, ''));
      if (!fs.existsSync(imagePath)) problems.push(`${bank} #${index + 1}: missing image ${question.image}`);
    }
    const combinedText = `${question.question} ${question.options.join(' ')}`;
    if (/visual option in video|tungkol sa traffic sign|kaunting putol sa audio|ayon sa video|\b[ABC]\s*\(ang\b/i.test(combinedText)) {
      transcriptArtifacts.push(`${bank} #${index + 1}: ${question.question}`);
    }
  });
}

const duplicateGroups = new Map<string, string[]>();
for (const { bank, index, question } of allQuestions) {
  const key = `${normalize(question.question)}|${question.image ?? ''}`;
  duplicateGroups.set(key, [...(duplicateGroups.get(key) ?? []), `${bank} #${index + 1}`]);
}

const visualWithoutImage = allQuestions.filter(({ question }) => visualPattern.test(question.question) && !question.image);
const duplicates = [...duplicateGroups.values()].filter((locations) => locations.length > 1);

console.log(JSON.stringify({
  bankCounts: Object.fromEntries(Object.entries(banks).map(([name, questions]) => [name, questions.length])),
  total: allQuestions.length,
  problems,
  visualWithoutImage: visualWithoutImage.map(({ bank, index, question }) => `${bank} #${index + 1}: ${question.question}`),
  transcriptArtifacts,
  duplicateGroups: duplicates,
}, null, 2));

if (problems.length || visualWithoutImage.length || transcriptArtifacts.length) process.exitCode = 1;
