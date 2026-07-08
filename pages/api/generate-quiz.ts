import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '../../types/quiz';
import { generateWithAllKeys } from '../../lib/gemini';

// Fallback logic to generate random questions from text if AI fails
function generateFallbackQuestions(text: string): Question[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const validSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 150 && s.includes(' '));
    
  // Shuffle valid sentences
  for (let i = validSentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validSentences[i], validSentences[j]] = [validSentences[j], validSentences[i]];
  }

  const questions: Question[] = [];
  const max = Math.min(validSentences.length, 50);

  for (let i = 0; i < max; i++) {
    const sentence = validSentences[i];
    const words = sentence.split(' ');
    // Pick a random word > 4 chars to blank out
    const longWords = words.map((w, i) => ({w, i})).filter(obj => obj.w.length > 4);
    if (longWords.length === 0) continue;
    
    const target = longWords[Math.floor(Math.random() * longWords.length)];
    const questionText = words.map((w, idx) => idx === target.i ? '_____' : w).join(' ');
    
    // Generate dummy options
    const options = [
      target.w.replace(/[.,;!?]/g, ''),
      'Option B',
      'Option C',
      'Option D'
    ];
    
    // Shuffle options
    const correctIndex = Math.floor(Math.random() * 4);
    [options[0], options[correctIndex]] = [options[correctIndex], options[0]];

    questions.push({
      question: questionText,
      options,
      correctIndex,
      explanation: 'This is a locally generated fallback question because the AI server is currently overloaded.',
      difficulty: 'Medium'
    });
  }

  if (questions.length === 0) {
    questions.push({
      question: "What is the main topic of this document?",
      options: ["Unknown", "The document title", "Not specified", "No text found"],
      correctIndex: 1,
      explanation: 'Fallback generic question.',
      difficulty: 'Easy'
    });
  }

  return questions;
}

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const MAX_CHARS = 40000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  }

  const { text, fileName, mode } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return res.status(400).json({
      error: 'Not enough text to work with.',
    });
  }

  const trimmedText = text.length > MAX_CHARS
    ? text.slice(0, MAX_CHARS) + '\n\n[...content truncated for length...]'
    : text;

  const ai = null; // using shared key-rotation utility

  const systemInstruction = `You are a tough oral defense panel examiner for a computer science capstone thesis.
Your task is to create multiple-choice questions that could be asked during a live oral defense.
Questions must test deep understanding — "Why?", "How?", "What is the advantage?", "Compare X vs Y", "What would happen if...?" 
Wrong answer choices (distractors) must be plausible and specific — NOT generic like "All of the above" or "None of the above".
The explanation for the correct answer must be detailed enough that a student reading it will understand WHY it is correct and WHY the others are wrong.
Vary difficulty: some conceptual, some factual, some analytical.
Respond ONLY with valid JSON. No markdown fences, no preamble.`;

  const userPrompt = `Capstone thesis document${fileName ? ` ("${fileName}")` : ''}:
"""
${trimmedText}
"""

Generate up to 50 defense-quality multiple-choice questions from this document.

Requirements for QUESTIONS:
- Ask about design choices, trade-offs, limitations, and algorithms/methods used
- Ask "Why was X chosen over Y?", "What is the role of X in the system?", "How does X improve Y?"
- Sound like what a real panel professor would ask during an oral defense
- Mix Easy (definitions), Medium (applications), and Hard (analysis/comparison) questions

Requirements for ANSWER OPTIONS:
- All 4 options must be plausible and specific — no "None of the above" or "All of the above"
- Wrong options should be close enough to be tricky (related concepts, common mistakes)
- The correct answer must be unambiguously right based on the document

Requirements for EXPLANATIONS:
- 2–3 sentences explaining WHY the correct answer is right
- Briefly mention why the other choices are wrong or misleading

Respond ONLY with this JSON shape:
{
  "topic": "short descriptive quiz title",
  "questions": [
    {
      "question": "string — sounds like a panel professor asking out loud",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string — 2-3 sentences explaining the correct answer and why the distractors are wrong",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}`;

  try {
    let output: string;
    let parsed: any;
    
    try {
      output = await generateWithAllKeys(userPrompt, systemInstruction);
      if (!output) throw new Error('No text returned from the model.');
      
      try {
        parsed = JSON.parse(output);
      } catch (parseErr) {
        throw new Error('Failed to parse the JSON response from Gemini.');
      }
    } catch (apiError: any) {
      console.warn("AI Generation failed", apiError);
      const isOverloaded = apiError?.message?.includes('503') || apiError?.message?.includes('UNAVAILABLE') || apiError?.message?.includes('high demand');
      // Return a proper error — fallback questions were confusing and unhelpful
      return res.status(503).json({
        error: isOverloaded
          ? 'Gemini AI is currently experiencing very high demand. Please wait 30 seconds and try again.'
          : (apiError?.message || 'AI service failed. Please try again.')
      });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Model response did not include any questions.');
    }

    const questions: Question[] = parsed.questions
      .filter(
        (q: any) =>
          q &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          Number.isInteger(q.correctIndex) &&
          q.correctIndex >= 0 &&
          q.correctIndex < 4
      )
      .slice(0, 50);

    if (questions.length === 0) {
      throw new Error('No valid questions could be parsed.');
    }

    return res.status(200).json({
      topic: parsed.topic || 'Your AI Quiz',
      questions,
    });
  } catch (err: any) {
    console.error('generate-quiz error:', err);
    return res.status(500).json({ error: err?.message || 'Could not generate a quiz from this document.' });
  }
}
