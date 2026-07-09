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

    const allFiles = fs.readdirSync(manuscriptDir).filter(file => file.endsWith('.txt'));

    // Build a set of raw manuscript base names that have a matching Defense Bible
    const defenseBibleBases = new Set(
      allFiles
        .filter(f => f.startsWith('Defense_Bible_'))
        .map(f => f.replace('Defense_Bible_', ''))
    );

    const files = allFiles.filter(file => {
      // Always exclude generated Defense_Bible_ files — clicking the raw manuscript
      // will auto-load its Defense Bible automatically (see load-manuscript.ts).
      if (file.startsWith('Defense_Bible_')) return false;

      // Keep PasaHERO_Defense_Bible_V2 standalone files (no raw counterpart)
      if (file.startsWith('PasaHERO_Defense_Bible')) return true;

      // Keep raw manuscripts
      return true;
    });

    return res.status(200).json({ files });
  } catch (err: any) {
    console.error('manuscripts error:', err);
    return res.status(500).json({ error: 'Failed to read manuscripts directory.' });
  }
}
