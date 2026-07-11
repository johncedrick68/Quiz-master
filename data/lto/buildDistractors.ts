type BasicRow = [question: string, correctAnswer: string, wrongAnswer1?: string, wrongAnswer2?: string, image?: string];

const stopWords = new Set([
  'about', 'after', 'again', 'against', 'alin', 'among', 'ang', 'answer', 'ano', 'anong', 'before', 'dapat',
  'driver', 'driving', 'following', 'from', 'gawin', 'ginagawa', 'iyong', 'kapag', 'kailangan', 'kalsada', 'kung',
  'magmaneho', 'motorista', 'nasa', 'ngayon', 'pagmamaneho', 'road', 'should', 'sign', 'signal', 'these', 'this',
  'traffic', 'vehicle', 'what', 'when', 'where', 'which', 'while', 'with', 'your', 'you', 'mga', 'ito', 'isang',
  'para', 'mula', 'naman', 'lamang', 'tungkol', 'sumusunod', 'does', 'mean', 'means', 'following',
]);

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9₱]+/g, ' ').trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token)));
}

function overlap(left: Set<string>, right: Set<string>): number {
  let total = 0;
  left.forEach((token) => { if (right.has(token)) total += 1; });
  return total;
}

function tooSimilar(left: string, right: string): boolean {
  const a = tokens(left);
  const b = tokens(right);
  const shared = overlap(a, b);
  return shared > 0 && shared / Math.min(a.size || 1, b.size || 1) >= 0.75;
}

export function buildDistractors(rows: BasicRow[], index: number): [string, string] {
  const [question, correctAnswer, explicit1, explicit2] = rows[index];
  if (explicit1 && explicit2) return [explicit1, explicit2];

  const topic = tokens(`${question} ${correctAnswer}`);
  const ranked = rows
    .map(([candidateQuestion, candidateAnswer], candidateIndex) => ({
      answer: candidateAnswer,
      candidateIndex,
      score: overlap(topic, tokens(`${candidateQuestion} ${candidateAnswer}`)),
    }))
    .filter(({ answer, candidateIndex }) => candidateIndex !== index && normalize(answer) !== normalize(correctAnswer) && !tooSimilar(answer, correctAnswer))
    .sort((a, b) => b.score - a.score || Math.abs(index - a.candidateIndex) - Math.abs(index - b.candidateIndex));

  const selected: string[] = [];
  for (const candidate of ranked) {
    if (selected.some((answer) => normalize(answer) === normalize(candidate.answer) || tooSimilar(answer, candidate.answer))) continue;
    selected.push(candidate.answer);
    if (selected.length === 2) break;
  }

  return [explicit1 ?? selected[0] ?? 'None of the choices shown', explicit2 ?? selected[1] ?? 'The opposite action is required'];
}
