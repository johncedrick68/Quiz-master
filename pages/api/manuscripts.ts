import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET.' });
  }

  try {
    const manuscriptDir = path.join(process.cwd(), 'manuscript');
    if (!fs.existsSync(manuscriptDir)) {
      return res.status(200).json({ files: [] });
    }

    const files = fs.readdirSync(manuscriptDir).filter(file => file.endsWith('.docx'));
    return res.status(200).json({ files });
  } catch (err: any) {
    console.error('manuscripts error:', err);
    return res.status(500).json({ error: 'Failed to read manuscripts directory.' });
  }
}
