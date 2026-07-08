import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Module-level cache to prevent re-parsing large DOCX files on every request if the serverless function stays warm.
let cachedAggregatedText: string | null = null;
const MAX_TOTAL_CHARS = 35000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET.' });
  }

  try {
    if (cachedAggregatedText) {
      return res.status(200).json({ text: cachedAggregatedText });
    }

    const manuscriptDir = path.join(process.cwd(), 'manuscript');
    if (!fs.existsSync(manuscriptDir)) {
      return res.status(404).json({ error: 'No manuscripts found.' });
    }

    const files = fs.readdirSync(manuscriptDir).filter(file => file.endsWith('.docx'));
    if (files.length === 0) {
      return res.status(404).json({ error: 'No manuscripts found.' });
    }

    const mammoth = (await import('mammoth')).default;
    let extractedTexts: string[] = [];

    // Parse files sequentially to manage memory
    for (const file of files) {
      try {
        const buffer = fs.readFileSync(path.join(manuscriptDir, file));
        const result = await mammoth.extractRawText({ buffer });
        if (result.value && result.value.trim().length > 0) {
          extractedTexts.push(result.value);
        }
      } catch (err) {
        console.warn(`Failed to parse ${file}:`, err);
      }
    }

    if (extractedTexts.length === 0) {
      return res.status(500).json({ error: 'Could not extract text from any manuscripts.' });
    }

    // Smart Sampling: Take equal portions from each document to fit within the MAX_TOTAL_CHARS limit
    const charsPerFile = Math.floor(MAX_TOTAL_CHARS / extractedTexts.length);
    let finalAggregatedText = '';

    for (const text of extractedTexts) {
      if (text.length <= charsPerFile) {
        finalAggregatedText += text + '\n\n';
      } else {
        // Pick a random starting point in the document to ensure variety across quizzes
        const maxStartIndex = text.length - charsPerFile;
        const startIndex = Math.floor(Math.random() * maxStartIndex);
        // Ensure we don't cut words in half roughly by seeking next space
        const spaceIndex = text.indexOf(' ', startIndex);
        const actualStart = spaceIndex !== -1 ? spaceIndex : startIndex;
        
        finalAggregatedText += text.substring(actualStart, actualStart + charsPerFile) + '\n\n';
      }
    }

    // Save to cache for subsequent requests (if instance stays alive)
    cachedAggregatedText = finalAggregatedText;

    return res.status(200).json({ text: finalAggregatedText });
  } catch (err: any) {
    console.error('load-all-manuscripts error:', err);
    return res.status(500).json({ error: err.message || 'Failed to aggregate manuscripts.' });
  }
}
