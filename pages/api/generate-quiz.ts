import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '../../types/quiz';
import { generateWithAllKeys } from '../../lib/gemini';

export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '10mb' } } };
const MAX_CHARS = 40000;

function parseQuiz(output: string): { topic?: string; questions?: unknown[] } {
  try { return JSON.parse(output); } catch {
    const match = output.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('The AI returned an invalid response. Please try again.');
    return JSON.parse(match[0]);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST.' }); }
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });

  const { text, fileName, mode } = req.body || {};
  if (typeof text !== 'string' || text.trim().length < 50) return res.status(400).json({ error: 'Not enough text to work with.' });

  const documentText = text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}\n\n[Content shortened for this quiz]` : text;
  const systemInstruction = `You create accurate, useful multiple-choice quizzes from the supplied document only.
Do not invent facts or use knowledge outside the document. Test important ideas, relationships, definitions, causes, examples, and practical implications. Include a mix of Easy, Medium, and Hard questions. Each wrong option must be plausible but clearly incorrect based on the document. Never use “all of the above” or “none of the above”. Give a short, helpful explanation grounded in the source. Respond only with valid JSON.`;
  const userPrompt = `Document${fileName ? `: ${fileName}` : ''}
"""
${documentText}
"""

Create 15 high-quality multiple-choice questions for a ${mode === 'challenge' ? 'closed-book challenge' : 'study session'}.
The correct answer must always be the first item in each options array.

Return exactly this JSON structure:
{
  "topic": "short descriptive quiz title",
  "questions": [{
    "question": "clear question based on the document",
    "options": ["correct answer", "plausible distractor", "plausible distractor", "plausible distractor"],
    "explanation": "one or two concise sentences explaining the answer from the document",
    "difficulty": "Easy | Medium | Hard"
  }]
}`;

  try {
    const parsed = parseQuiz(await generateWithAllKeys(userPrompt, systemInstruction));
    if (!Array.isArray(parsed.questions)) throw new Error('The AI did not return any questions.');
    const questions: Question[] = parsed.questions
      .filter((question: any) => question && typeof question.question === 'string' && Array.isArray(question.options) && question.options.length === 4 && question.options.every((option: unknown) => typeof option === 'string') && typeof question.explanation === 'string')
      .map((question: any) => {
        const correct = question.options[0];
        const options = [...question.options].sort(() => Math.random() - 0.5);
        return { question: question.question.trim(), options, correctIndex: options.indexOf(correct), explanation: question.explanation.trim(), difficulty: ['Easy', 'Medium', 'Hard'].includes(question.difficulty) ? question.difficulty : 'Medium' };
      })
      .slice(0, 15);
    if (!questions.length) throw new Error('The AI returned no usable questions. Please try a document with more readable text.');
    return res.status(200).json({ topic: typeof parsed.topic === 'string' ? parsed.topic : 'Document quiz', questions });
  } catch (error: any) {
    console.error('generate-quiz error:', error);
    return res.status(503).json({ error: error?.message || 'Could not generate a quiz from this document.' });
  }
}
