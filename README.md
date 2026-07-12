# LTO Driving License Reviewer

A mobile-friendly study and exam reviewer for Philippine motorcycle and light-vehicle driving-license practice.

## Included reviewers

- Motorcycle Code A/A1 — English and Tagalog
- Light Vehicle Code B/B1/B2 — English and Tagalog
- Untimed study mode for road signs and driving rules
- Timed exams with 60 random questions and a passing score of 48/60
- Review of incorrect answers after each exam

## Quality checks

```bash
npm install
npm run audit:questions
npm run build
```

The question audit checks option counts, answer indexes, duplicate options, missing image files, visual prompts without images, and duplicate questions.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy

The project is a standard Next.js application and can be imported directly into Vercel from the GitHub repository. Use the default build command (`npm run build`) and do not set an output directory.

This is an independent study tool, not an official LTO examination. Verify current laws, signs, penalties, and licensing requirements against current official LTO materials.
