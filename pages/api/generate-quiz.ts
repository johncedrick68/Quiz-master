import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import { Question } from '../../types/quiz';

export const config = {
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const output = response.text;
    if (!output) {
      throw new Error('No text returned from the model.');
    }

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (parseErr) {
      throw new Error('Failed to parse the JSON response from Gemini.');
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
