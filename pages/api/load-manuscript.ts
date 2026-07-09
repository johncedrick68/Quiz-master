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
    const manuscriptDir = path.join(process.cwd(), 'manuscript');

    // If a raw manuscript is requested, check if a pre-made Defense Bible exists.
    // If so, load that instead — it bypasses AI and is instant!
    let resolvedFilename = filename;
    if (!filename.startsWith('Defense_Bible_') && !filename.startsWith('PasaHERO_Defense_Bible')) {
      const baseName = filename.endsWith('.txt') ? filename : `${filename}.txt`;
      const defenseBibleName = `Defense_Bible_${baseName.replace('.txt', '')}.txt`;
      const defenseBiblePath = path.join(manuscriptDir, defenseBibleName);
      if (fs.existsSync(defenseBiblePath)) {
        console.log(`  -> Found pre-made Defense Bible, loading: ${defenseBibleName}`);
        resolvedFilename = defenseBibleName;
      }
    }

    const manuscriptPath = path.join(manuscriptDir, resolvedFilename);
    if (!fs.existsSync(manuscriptPath)) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    const text = fs.readFileSync(manuscriptPath, 'utf8');
    
    if (!text || text.trim().length < 30) {
      throw new Error('Could not find readable text in this document.');
    }

    return res.status(200).json({ text: text, resolvedFilename });
  } catch (err: any) {
    console.error('load-manuscript error:', err);
    return res.status(500).json({ error: err.message || 'Failed to read the manuscript.' });
  }
}
