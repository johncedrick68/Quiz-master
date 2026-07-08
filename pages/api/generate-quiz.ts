import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import { Question } from '../../types/quiz';

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

async function generateWithRetry(ai: GoogleGenAI, prompt: string, systemInstruction: string, retries = 3): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  for (let attempt = 0; attempt < retries; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction, responseMimeType: 'application/json' }
      });
      if (response.text) return response.text;
    } catch (err: any) {
      const isOverloaded = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
      if (isOverloaded && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All retry attempts failed');
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
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set on the server.',
    });
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

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = `You are an expert quiz master. Create a high-quality multiple-choice quiz based strictly on the provided source material. Do not invent facts outside the document.
Generate as many meaningful questions as possible from the text, UP TO A MAXIMUM OF 50 QUESTIONS. 
If the text is short, generate fewer questions. Never duplicate questions.
Ensure varying difficulty levels (Easy, Medium, Hard).
Respond ONLY with valid JSON. No markdown fences, no preamble.`;

  const userPrompt = `Source document${fileName ? ` ("${fileName}")` : ''}:
"""
${trimmedText}
"""

Write up to 50 multiple-choice questions based strictly on the source above.

Rules:
1. Every question and correct answer MUST be verifiable from the source text.
2. Provide exactly 4 options per question, with only 1 correct answer.
3. Vary difficulty: 'Easy', 'Medium', 'Hard'.
4. Include a short 1-2 sentence explanation for the correct answer.
5. Do not include duplicate questions.
6. Target up to 50 questions if the text supports it, but stop if you run out of meaningful material.

Respond ONLY with this JSON shape:
{
  "topic": "short title describing the quiz",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string",
      "difficulty": "Easy"
    }
  ]
}`;

  try {
    let output: string;
    let parsed: any;
    
    try {
      output = await generateWithRetry(ai, userPrompt, systemInstruction);
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
