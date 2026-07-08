import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
// Uses shared key-rotation utility — no direct GoogleGenAI import needed here
import { generateWithAllKeys } from '../../lib/gemini';

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
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: '20mb' } },
};

const MAX_CHARS = 35000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  }

  const { filename, text: providedText } = req.body || {};
  
  if (!filename && !providedText) {
    return res.status(400).json({ error: 'filename or text is required.' });
  }

  try {
    let text = providedText;
    
    if (!text && filename) {
      const manuscriptPath = path.join(process.cwd(), 'manuscript', filename);
      if (!fs.existsSync(manuscriptPath)) {
        return res.status(404).json({ error: 'Manuscript not found.' });
      }
      text = fs.readFileSync(manuscriptPath, 'utf8');
    }

    if (!text || text.trim().length < 30) {
      throw new Error('Could not extract text from this document.');
    }

    text = text.length > MAX_CHARS
      ? text.slice(0, MAX_CHARS) + '\n[...truncated...]'
      : text;


    const systemInstruction = `You are a strict oral capstone defense examiner for a computer science thesis. 
Your job is to generate Q&A pairs that a student MUST memorize to pass their oral defense panel.
Questions should sound like what a tough professor would ask out loud during the defense — direct, probing, and conceptual.
Answers must be concise (1-3 sentences), technically accurate, and immediately useful as a spoken response.
Do NOT generate trivial or superficial questions. Focus on "Why?", "How?", "What is the advantage of?", "Compare X vs Y", and "What would happen if...?" style questions.
Respond ONLY with valid JSON. No markdown, no preamble.`;

    const prompt = `Capstone thesis document:
"""
${text}
"""

Generate up to 50 high-quality oral defense Q&A pairs from this document.

Requirements for QUESTIONS:
- Ask "Why did you choose X over Y?" type questions
- Ask about design decisions, trade-offs, and limitations
- Ask about algorithms, data structures, or methodologies used
- Ask "What is the significance of...?" or "How does X contribute to Y?"
- Sound like a real panel professor asking out loud
- NEVER ask trivial yes/no questions

Requirements for ANSWERS:
- 1 to 3 sentences maximum — short enough to say out loud under pressure
- Technically precise and confident in tone  
- Start with a direct statement (avoid "Well..." or "Basically...")
- Include the specific reason or evidence from the document

Respond ONLY with this JSON shape:
{
  "pairs": [
    {
      "question": "Why did you use Graph Theory instead of a standard Network model for your jeepney routing system?",
      "answer": "Graph Theory provides a mathematically precise representation of transportation networks using nodes and edges, allowing us to apply Dijkstra's algorithm for shortest-path optimization. This gives our system a solid theoretical foundation that network models lack."
    }
  ]
}`;

    let output;
    try {
      output = await generateWithAllKeys(prompt, systemInstruction);
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
