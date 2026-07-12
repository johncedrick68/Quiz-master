import fs from "fs";
import path from "path";
import { motorcycleAA1English } from "../data/lto/motorcycleAA1English";
import { motorcycleAA1EnglishPart2 } from "../data/lto/motorcycleAA1EnglishPart2";
import { motorcycleAA1Tagalog } from "../data/lto/motorcycleAA1Tagalog";
import { motorcycleAA1TagalogPart2 } from "../data/lto/motorcycleAA1TagalogPart2";
import { motorcycleAA1TagalogPart3 } from "../data/lto/motorcycleAA1TagalogPart3";
import { lightVehicleBB1English } from "../data/lto/lightVehicleBB1English";
import { lightVehicleBB1B2Tagalog } from "../data/lto/lightVehicleBB1B2Tagalog";

const banks = { motorcycleAA1English, motorcycleAA1EnglishPart2, motorcycleAA1Tagalog, motorcycleAA1TagalogPart2, motorcycleAA1TagalogPart3, lightVehicleBB1English, lightVehicleBB1B2Tagalog };
const records = Object.entries(banks).flatMap(([bank, questions]) =>
  questions.map((question, index) => ({
    id: `${bank}:${index + 1}`,
    bank,
    index: index + 1,
    status: question.reviewStatus ?? "curated",
    question: question.question,
    correctAnswer: question.options[question.correctIndex],
    distractors: question.options.filter((_, optionIndex) => optionIndex !== question.correctIndex),
    image: question.image ?? null,
    source: question.sources?.[0]?.url ?? null,
    lastVerified: question.lastVerified ?? null,
  })),
);

const output = path.join(process.cwd(), ".audit-temp", "question-audit.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Wrote ${records.length} records to ${output}`);
