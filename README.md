# QuizForge

Turn a document into an interactive quiz. Upload a text-based PDF, TXT, or Markdown file—or paste text—and QuizForge generates a 15-question multiple-choice quiz with explanations, scoring, and a review screen.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Add a Google AI Studio key as `GEMINI_API_KEY`
4. Run `npm run dev`

Open `http://localhost:3000`.

## Privacy and limits

- Document parsing happens in the browser; only the extracted text is sent to the configured AI provider to generate questions.
- PDF files must contain selectable text. Scanned PDFs need OCR before use.
- Files are limited to 10 MB and the first 40,000 characters are used for a single quiz.
- Word (`.doc` / `.docx`) import is not available yet; export to PDF or TXT first.
