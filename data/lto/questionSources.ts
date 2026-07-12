import { Question } from "../../types/quiz";

export const LAST_VERIFIED = "2026-07-13";

const FDM = {
  title: "LTO Filipino Driver's Manual, Volume 1 (2nd edition)",
  url: "https://lto.gov.ph/wp-content/uploads/2023/10/FDM-Vol.-1-2nd-Edition.pdf",
};

const laws = [
  { pattern: /RA\s*4136|Republic Act\s*(?:No\.\s*)?4136/i, title: "Republic Act No. 4136", url: "https://lawphil.net/statutes/repacts/ra1964/ra_4136_1964.html" },
  { pattern: /RA\s*8750|seat[ -]?belt/i, title: "Republic Act No. 8750", url: "https://lawphil.net/statutes/repacts/ra1999/ra_8750_1999.html" },
  { pattern: /RA\s*10054|helmet act/i, title: "Republic Act No. 10054", url: "https://lawphil.net/statutes/repacts/ra2010/ra_10054_2010.html" },
  { pattern: /RA\s*10586|drunk|drugged|nakainom|nakadroga/i, title: "Republic Act No. 10586", url: "https://lawphil.net/statutes/repacts/ra2013/ra_10586_2013.html" },
  { pattern: /RA\s*10666|child.*motorcycle|batang angkas/i, title: "Republic Act No. 10666", url: "https://lawphil.net/statutes/repacts/ra2015/ra_10666_2015.html" },
  { pattern: /RA\s*10913|distracted|mobile phone|cellphone/i, title: "Republic Act No. 10913", url: "https://lawphil.net/statutes/repacts/ra2016/ra_10913_2016.html" },
  { pattern: /RA\s*11229|child restraint/i, title: "Republic Act No. 11229", url: "https://lawphil.net/statutes/repacts/ra2019/ra_11229_2019.html" },
];

export function attachQuestionSource(question: Question): Question {
  const text = `${question.question} ${question.options.join(" ")}`;
  const law = laws.find(({ pattern }) => pattern.test(text));
  return {
    ...question,
    sources: [law ? { title: law.title, url: law.url } : FDM],
    lastVerified: LAST_VERIFIED,
  };
}
