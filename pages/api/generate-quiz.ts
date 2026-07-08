import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '../../types/quiz';
import { generateWithAllKeys } from '../../lib/gemini';

// Fallback logic to generate random questions from text if AI fails
function generateFallbackQuestions(text: string): Question[] {
  const questions: Question[] = [];

  // 1. INSTANT PRE-MADE PARSING
  if (text.includes('Q:') && text.includes('Best Answer:')) {
    const blocks = text.split(/Question \d+/i);
    const allAnswers: string[] = [];
    const parsedPairs = [];
    
    // First pass: extract all questions and answers
    for (const block of blocks) {
      const qMatch = block.match(/Q:\s*(.+?)(?=\n|Best Answer:)/i);
      const aMatch = block.match(/Best Answer:\s*(.+?)(?=\n|Reviewer Tip:|$)/is);
      if (qMatch && aMatch) {
        parsedPairs.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
        allAnswers.push(aMatch[1].trim());
      }
    }

    // Second pass: generate multiple choice by grabbing random other answers
    if (parsedPairs.length > 0) {
      for (const pair of parsedPairs) {
        // Pick 3 random wrong answers
        const wrongAnswers = [...allAnswers].filter(a => a !== pair.a).sort(() => 0.5 - Math.random()).slice(0, 3);
        // Fallback if not enough answers available
        while (wrongAnswers.length < 3) wrongAnswers.push("This is a distractor answer.");
        
        const options = [pair.a, ...wrongAnswers];
        // Shuffle options
        const correctIndex = Math.floor(Math.random() * 4);
        [options[0], options[correctIndex]] = [options[correctIndex], options[0]];

        questions.push({
          question: pair.q,
          options,
          correctIndex,
          explanation: pair.a,
          difficulty: 'Medium'
        });
      }
      return questions;
    }
  }

  // 2. GENERIC FALLBACK
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const validSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 150 && s.includes(' '));
    
  for (let i = validSentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validSentences[i], validSentences[j]] = [validSentences[j], validSentences[i]];
  }

  const max = Math.min(validSentences.length, 50);
  for (let i = 0; i < max; i++) {
    const sentence = validSentences[i];
    const words = sentence.split(' ');
    const longWords = words.map((w, i) => ({w, i})).filter(obj => obj.w.length > 4);
    if (longWords.length === 0) continue;
    
    const target = longWords[Math.floor(Math.random() * longWords.length)];
    const questionText = words.map((w, idx) => idx === target.i ? '_____' : w).join(' ');
    
    const options = [
      target.w.replace(/[.,;!?]/g, ''),
      'Option B',
      'Option C',
      'Option D'
    ];
    
    const correctIndex = Math.floor(Math.random() * 4);
    [options[0], options[correctIndex]] = [options[correctIndex], options[0]];

    questions.push({
      question: "Fill in the blank: " + questionText,
      options,
      correctIndex,
      explanation: "From the text.",
      difficulty: 'Medium'
    });
  }

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

    // --- 1. INSTANT PRE-MADE PARSING (Skips AI, no 10s timeout) ---
    if (trimmedText.includes('Q:') && trimmedText.includes('Best Answer:')) {
      const fallbackQs = generateFallbackQuestions(trimmedText);
      if (fallbackQs.length > 0) {
        console.log("Successfully parsed pre-made Defense Bible for quiz! Bypassing AI.");
        return res.status(200).json({ topic: fileName || "Impromptu Defense Quiz", questions: fallbackQs });
      }
    }

    // --- 2. AI GENERATION (For unstructured text) ---
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
