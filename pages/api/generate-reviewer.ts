import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

function generateFallbackReviewer(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const validSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 200 && s.includes(' '));
    
  for (let i = validSentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validSentences[i], validSentences[j]] = [validSentences[j], validSentences[i]];
  }

  const pairs = [];
  const max = Math.min(validSentences.length, 50);

  for (let i = 0; i < max; i++) {
    const sentence = validSentences[i];
    const words = sentence.split(' ');
    const longWords = words.map((w, i) => ({w, i})).filter(obj => obj.w.length > 5);
    if (longWords.length === 0) continue;
    
    const target = longWords[Math.floor(Math.random() * longWords.length)];
    const questionText = "What does the following statement refer to? " + words.map((w, idx) => idx === target.i ? '_____' : w).join(' ');
    
    pairs.push({
      question: questionText,
      answer: target.w.replace(/[.,;!?]/g, '')
    });
  }

  if (pairs.length === 0) {
    pairs.push({
      question: "What is the main topic?",
      answer: "Could not automatically generate fallback questions."
    });
  }

  return pairs;
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

const MAX_CHARS = 35000;

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
        // Wait before retrying (exponential backoff)
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All retry attempts failed');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  }

  const { filename } = req.body || {};
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'filename is required.' });
  }

  try {
    const manuscriptPath = path.join(process.cwd(), 'manuscript', filename);
    if (!fs.existsSync(manuscriptPath)) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    const buffer = fs.readFileSync(manuscriptPath);
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length < 30) {
      throw new Error('Could not extract text from this document.');
    }

    const text = result.value.length > MAX_CHARS
      ? result.value.slice(0, MAX_CHARS) + '\n[...truncated...]'
      : result.value;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are a capstone defense reviewer expert. Extract or generate question-and-answer pairs from the provided document. 
Each answer should be a concise, direct "Best Answer" that a student could memorize for their oral defense.
Respond ONLY with valid JSON. No markdown, no preamble.`;

    const prompt = `Document content:
"""
${text}
"""

Extract or generate as many meaningful Q&A pairs as possible (up to 50) from this document.
Focus on:
- Key concepts and their definitions
- Why certain technologies/methods were chosen
- System architecture decisions
- Results and findings
- Methodology explanations

Respond ONLY with this JSON shape:
{
  "pairs": [
    {
      "question": "Why was Graph Theory used instead of Network Theory?",
      "answer": "Graph Theory directly models transportation networks using nodes and edges, making it appropriate for jeepney routes."
    }
  ]
}`;

    let output;
    try {
      output = await generateWithRetry(ai, prompt, systemInstruction);
    } catch (apiError: any) {
      console.warn("AI Generation failed, falling back to local text processing", apiError);
      return res.status(200).json({ pairs: generateFallbackReviewer(text), isFallback: true });
    }

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      const match = output.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Could not parse model response as JSON.');
    }

    if (!parsed.pairs || !Array.isArray(parsed.pairs)) {
      throw new Error('Model did not return valid Q&A pairs.');
    }

    return res.status(200).json({ pairs: parsed.pairs });
  } catch (err: any) {
    console.error('generate-reviewer error:', err);
    const isOverload = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
    return res.status(isOverload ? 503 : 500).json({
      error: isOverload
        ? 'Gemini is experiencing high demand right now. Please wait 30 seconds and try again.'
        : (err?.message || 'Failed to generate reviewer content.')
    });
  }
}
