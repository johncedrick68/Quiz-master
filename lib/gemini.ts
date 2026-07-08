import { GoogleGenAI } from '@google/genai';

/**
 * Returns an array of all configured Gemini API keys.
 * Reads GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.
 */
export function getApiKeys(): string[] {
  const keys: string[] = [];
  
  // Primary key
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  
  // Additional keys (for rotation when one hits daily quota)
  let i = 2;
  while (true) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (!key) break;
    keys.push(key);
    i++;
  }
  
  return keys;
}

// Models supported by new-generation Google AI Studio keys
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

/**
 * Tries every (apiKey × model) combination before giving up.
 * On 429 (quota) or 503 (overloaded), it moves on automatically.
 */
export async function generateWithAllKeys(
  prompt: string,
  systemInstruction: string
): Promise<string> {
  const keys = getApiKeys();
  
  if (keys.length === 0) {
    throw new Error('GEMINI_API_KEY is not set on the server.');
  }

  let lastError: any;

  for (const key of keys) {
    const ai = new GoogleGenAI({ apiKey: key });
    
    for (const model of MODELS) {
      try {
        console.log(`Trying key ...${key.slice(-6)}, model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction, responseMimeType: 'application/json' }
        });

        const text = response.text?.trim();
        if (!text) {
          console.warn(`  → Empty response from ${model}, trying next...`);
          continue;
        }

        // Validate it's actually JSON before returning — Gemini sometimes returns
        // plain-text error messages like "An error occurred" even with responseMimeType set
        try {
          JSON.parse(text);
          return text; // ✅ Valid JSON — return it
        } catch {
          console.warn(`  → Response from ${model} is not valid JSON, trying next...`);
          console.warn(`     Preview: ${text.slice(0, 80)}`);
          lastError = new Error(`Model returned non-JSON: ${text.slice(0, 80)}`);
          continue; // try next model
        }

      } catch (err: any) {
        lastError = err;
        const isQuota = err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
        const isOverloaded = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
        
        if (isQuota || isOverloaded) {
          console.warn(`  → Failed (${isQuota ? '429 quota' : '503 busy'}), trying next...`);
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        throw err; // Non-retriable error
      }
    }
  }


  // All keys and models exhausted
  const retryMatch = lastError?.message?.match(/(\d+)s/);
  const waitSeconds = retryMatch ? parseInt(retryMatch[1]) : 60;
  const isQuota = lastError?.message?.includes('429') || lastError?.message?.includes('quota');

  throw new Error(
    isQuota
      ? `All ${keys.length} API key(s) have hit their daily free quota. Wait ~${waitSeconds}s then try again. Add more keys as GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc. in your environment variables.`
      : 'All AI models are currently unavailable. Please try again in a minute.'
  );
}
