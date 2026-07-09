import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANUSCRIPT_DIR = path.join(__dirname, '../manuscript');

// Retrieve all API keys from .env.local
const keys = [];
if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
let i = 2;
while (process.env[`GEMINI_API_KEY_${i}`]) {
  keys.push(process.env[`GEMINI_API_KEY_${i}`]);
  i++;
}

if (keys.length === 0) {
  console.error('❌ Error: No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}

const MODELS = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-2.0-flash'];

async function generateWithAllKeys(prompt, systemInstruction) {
  let lastError = null;

  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log(`  -> Trying OpenRouter with free model...`);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      let text = data.choices[0].message.content.trim();
      if (text.startsWith("\`\`\`json")) {
        text = text.replace(/^\`\`\`json\n?/, '').replace(/\`\`\`$/, '').trim();
      }
      return JSON.parse(text);
    } catch (err) {
      console.warn(`  -> OpenRouter failed: ${err.message}, falling back to Gemini keys...`);
      lastError = err;
    }
  }

  for (const key of keys) {
    const ai = new GoogleGenAI({ apiKey: key });
    for (const model of MODELS) {
      try {
        console.log(`  -> Trying model: ${model} with key ...${key.slice(-6)}`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction, responseMimeType: 'application/json' }
        });

        const text = response.text?.trim();
        if (!text) continue;

        try {
          const parsed = JSON.parse(text);
          return parsed; // Valid JSON!
        } catch (e) {
          lastError = new Error("Invalid JSON returned");
          continue;
        }
      } catch (err) {
        lastError = err;
        const msg = err?.message || '';
        if (msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('exhausted')) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        throw err;
      }
    }
  }
  throw new Error(`All keys/models exhausted. Last error: ${lastError?.message}`);
}

async function processFile(fileName) {
  const filePath = path.join(MANUSCRIPT_DIR, fileName);
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Truncate to avoid massive payloads
  if (text.length > 35000) text = text.slice(0, 35000) + '...';

  const systemInstruction = `You are a strict oral capstone defense examiner for a computer science thesis. 
Your job is to generate Q&A pairs that a student MUST memorize to pass their oral defense panel.
Questions should sound like what a tough professor would ask out loud during the defense — direct, probing, and conceptual.
Answers must be concise (1-3 sentences), technically accurate, and immediately useful as a spoken response.
Respond ONLY with valid JSON containing a "pairs" array.`;

  const prompt = `Document content ("${fileName}"):
"""
${text}
"""

Generate up to 50 high-quality oral defense Q&A pairs from this document.
Respond ONLY with this JSON shape:
{
  "pairs": [
    {
      "question": "Why did you use Graph Theory?",
      "answer": "Graph Theory provides a precise representation of transportation networks."
    }
  ]
}`;

  console.log(`\n⏳ Generating Defense Bible for: ${fileName}...`);
  try {
    const data = await generateWithAllKeys(prompt, systemInstruction);
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log(`⚠️ No pairs generated for ${fileName}`);
      return;
    }

    let outputText = `PasaHERO Defense Bible - Generated from ${fileName}\n\n`;
    let count = 1;
    for (const pair of data.pairs) {
      outputText += `Question ${count}\n\nQ: ${pair.question}\n\nBest Answer:\n\n${pair.answer}\n\n`;
      count++;
    }

    const outFileName = `Defense_Bible_${fileName.replace('.txt', '')}.txt`;
    const outPath = path.join(MANUSCRIPT_DIR, outFileName);
    fs.writeFileSync(outPath, outputText, 'utf8');
    
    console.log(`✅ Success! Saved ${data.pairs.length} Q&A pairs to ${outFileName}`);
  } catch (err) {
    console.error(`❌ Failed to process ${fileName}:`, err.message);
  }
}

async function main() {
  console.log(`🔑 Loaded ${keys.length} API keys for rotation.`);
  
  const files = fs.readdirSync(MANUSCRIPT_DIR)
    .filter(f => f.endsWith('.txt'))
    .filter(f => !f.includes('Defense_Bible')); // Don't process already processed files

  if (files.length === 0) {
    console.log('No normal manuscript files found to process.');
    return;
  }

  console.log(`Found ${files.length} manuscript files to convert.`);

  for (const file of files) {
    await processFile(file);
    // Wait 5 seconds between files to avoid rate limiting
    console.log('Waiting 5 seconds before next file...');
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('\n🎉 All manuscripts converted successfully! You can now commit the new files to GitHub.');
}

main();
