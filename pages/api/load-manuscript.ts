import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET.' });
  }

  const { filename } = req.query;

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required.' });
  }

  try {
    const manuscriptPath = path.join(process.cwd(), 'manuscript', filename);
    if (!fs.existsSync(manuscriptPath)) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    const buffer = fs.readFileSync(manuscriptPath);
    
    // We dynamically import mammoth as it's a commonJS module often used on server
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length < 30) {
      throw new Error('Could not find readable text in this Word document.');
    }

    return res.status(200).json({ text: result.value });
  } catch (err: any) {
    console.error('load-manuscript error:', err);
    return res.status(500).json({ error: err.message || 'Failed to read the manuscript.' });
  }
}
