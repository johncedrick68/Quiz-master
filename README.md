# Quiz Master

Upload a document (.txt, .md, .pdf, or .docx) or paste text, and it turns into a mobile-friendly,
Quizizz-style multiple-choice quiz — chalkboard theme, chalk-doodle host, per-question timer,
speed-based scoring, streaks, and a review screen at the end.

## How it works

- File text is extracted **in the browser** (pdf.js for PDFs, mammoth for .docx) — nothing is
  uploaded anywhere except the plain extracted text.
- That text is sent to a serverless API route (`/api/generate-quiz`), which calls the Anthropic
  API using a key stored server-side, and asks Claude to write questions strictly from the text.
- The quiz runs client-side: 20 seconds per question, points scaled by how fast you answer,
  streak tracking, instant feedback with an explanation, and a final review of anything missed.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then paste your key into .env.local
npm run dev
```

Open http://localhost:3000.

You'll need an Anthropic API key from https://console.anthropic.com/settings/keys.

## Deploy to Vercel

1. Push this project to a GitHub repo (or run `vercel` from this folder with the Vercel CLI).
2. Import the repo at https://vercel.com/new.
3. In the project's **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key
4. Deploy. Vercel will detect it as a Next.js app automatically — no other config needed.

## Notes & limits

- PDF extraction only works on PDFs with real selectable text, not scanned images.
- Very long documents are trimmed (~18,000 characters) to keep requests fast and affordable.
- Old `.doc` files aren't supported — save as `.docx` or `.pdf` first.
- Question count is adjustable from 4–12 on the upload screen.
- The API route uses `claude-sonnet-5`. Swap the model string in
  `pages/api/generate-quiz.js` if you want to use a different one.
