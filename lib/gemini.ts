import { GoogleGenAI } from '@google/genai';

const REQUEST_TIMEOUT_MS = 20_000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export function getApiKeys(): string[] {
  const keys: string[] = [];
  for (let index = 1; ; index++) {
    const name = index === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${index}`;
    const key = process.env[name];
    if (!key) break;
    keys.push(key);
  }
  return keys;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('The AI took too long to respond. Please try again with a shorter document.')), timeoutMs);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

export async function generateWithAllKeys(prompt: string, systemInstruction: string): Promise<string> {
  const keys = getApiKeys();
  if (!keys.length) throw new Error('GEMINI_API_KEY is not set on the server.');

  let lastError: unknown;
  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await withTimeout(
        ai.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: { systemInstruction, responseMimeType: 'application/json', maxOutputTokens: 600 },
        }),
        REQUEST_TIMEOUT_MS,
      );
      const text = response.text?.trim();
      if (!text) throw new Error('The AI returned an empty response.');
      JSON.parse(text);
      return text;
    } catch (error) {
      lastError = error;
      console.warn('Quiz generation attempt failed:', error instanceof Error ? error.message : error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('The AI service is unavailable. Please try again.');
}
