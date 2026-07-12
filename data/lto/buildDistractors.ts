type BasicRow = [question: string, correctAnswer: string, wrongAnswer1?: string, wrongAnswer2?: string, image?: string];

const stopWords = new Set([
  "about", "after", "again", "against", "alin", "among", "ang", "answer", "ano", "anong", "before", "dapat",
  "driver", "driving", "following", "from", "gawin", "ginagawa", "iyong", "kapag", "kailangan", "kalsada", "kung",
  "magmaneho", "motorista", "nasa", "ngayon", "pagmamaneho", "road", "should", "sign", "signal", "these", "this",
  "traffic", "vehicle", "what", "when", "where", "which", "while", "with", "your", "you", "mga", "ito", "isang",
  "para", "mula", "naman", "lamang", "tungkol", "sumusunod", "does", "mean", "means", "following",
]);

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9₱]+/g, " ").trim();
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
  return normalize(left) === normalize(right) || (shared > 0 && shared / Math.min(a.size || 1, b.size || 1) >= 0.75);
}

function topicOf(question: string, answer: string): string {
  const text = normalize(`${question} ${answer}`);
  const topics: [string, RegExp][] = [
    ["sign", /\b(sign|senyas|nakalarawan|shape|hugis)\b/],
    ["signal", /\b(light|ilaw|amber|yellow|dilaw|red|pula|green|berde|flashing|kumikislap)\b/],
    ["parking", /\b(park|parking|pumarada|parada|curb|hydrant)\b/],
    ["overtaking", /\b(overtak|passing|lumusot|paglusot|lumampas)\b/],
    ["right-of-way", /right of way|give way|yield|magbigay daan|karapatan sa daan/],
    ["speed", /\b(speed|bilis|kph|kilometer|kilometro|expressway)\b/],
    ["law", /\b(ra|republic act|penalty|fine|offense|violation|parusa|multa|paglabag|lisensya|license)\b/],
    ["alcohol", /\b(alcohol|liquor|drug|nakainom|nakadroga|alak)\b/],
    ["emergency", /\b(emergency|sirena|siren|ambulance|fire truck|kagipitan)\b/],
    ["pedestrian", /\b(pedestrian|crosswalk|tawiran|naglalakad|school|paaralan)\b/],
    ["maintenance", /\b(brake|preno|engine|makina|oil|langis|tire|gulong|headlight|fluid|shock|fuel)\b/],
    ["lane", /\b(lane|linya|intersection|interseksyon|junction|sangandaan|turn|liko)\b/],
    ["documents", /\b(document|registration|rehistro|insurance|permit|vin)\b/],
  ];
  return topics.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
}

function sameAnswerShape(left: string, right: string): boolean {
  const numeric = /\d|₱|peso|meter|metro|second|segundo|hour|oras|day|araw|year|taon/i;
  const yesNo = /^(yes|no|oo|hindi|tama|mali|true|false)\b/i;
  if (numeric.test(left)) return numeric.test(right);
  if (yesNo.test(left)) return yesNo.test(right);
  return !numeric.test(right) && !yesNo.test(right);
}

export function buildDistractors(rows: BasicRow[], index: number): [string, string] {
  const [question, correctAnswer, explicit1, explicit2] = rows[index];
  if (explicit1 && explicit2) return [explicit1, explicit2];

  const topic = topicOf(question, correctAnswer);
  const words = tokens(`${question} ${correctAnswer}`);
  const ranked = rows
    .map(([candidateQuestion, candidateAnswer], candidateIndex) => ({
      answer: candidateAnswer,
      candidateIndex,
      topic: topicOf(candidateQuestion, candidateAnswer),
      score: overlap(words, tokens(`${candidateQuestion} ${candidateAnswer}`)),
    }))
    .filter(({ answer, candidateIndex, topic: candidateTopic }) =>
      candidateIndex !== index && candidateTopic === topic && sameAnswerShape(correctAnswer, answer) && !tooSimilar(answer, correctAnswer),
    )
    .sort((a, b) => b.score - a.score || Math.abs(index - a.candidateIndex) - Math.abs(index - b.candidateIndex));

  const selected: string[] = [];
  for (const candidate of ranked) {
    if (selected.some((answer) => tooSimilar(answer, candidate.answer))) continue;
    selected.push(candidate.answer);
    if (selected.length === 2) break;
  }

  const tagalog = /\b(ano|alin|kailan|saan|dapat|kapag|hindi|mga|ang)\b/i.test(question);
  const fallbacks = tagalog
    ? ["Magpatuloy nang hindi nagbabago ng bilis", "Huminto kaagad kahit walang panganib"]
    : ["Continue without changing speed", "Stop immediately even when there is no danger"];
  return [explicit1 ?? selected[0] ?? fallbacks[0], explicit2 ?? selected[1] ?? fallbacks[1]];
}
