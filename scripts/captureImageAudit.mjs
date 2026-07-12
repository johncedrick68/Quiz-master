import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const records = JSON.parse(fs.readFileSync(path.join(process.cwd(), ".audit-temp", "question-audit.json"), "utf8"));
const imageRecords = records.filter((record) => record.image);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.route("http://audit.local/images/**", async (route) => {
  const relative = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, "");
  const file = path.join(process.cwd(), "public", relative);
  await route.fulfill({ path: file });
});
const cards = imageRecords.map((record) => {
  return `<article><img src="http://audit.local${encodeURI(record.image)}"><div><b>${record.id}</b><p>${record.question}</p><strong>${record.correctAnswer}</strong><small>${record.image}</small></div></article>`;
}).join("");
await page.setContent(`<style>body{font:14px Arial;margin:20px;color:#172033}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}article{break-inside:avoid;display:grid;grid-template-columns:150px 1fr;gap:12px;border:1px solid #bbb;padding:10px;border-radius:8px}img{width:150px;height:130px;object-fit:contain;background:#f5f7fa}p{margin:6px 0}strong,small{display:block}strong{color:#08783e}small{margin-top:6px;color:#666;overflow-wrap:anywhere}</style><main>${cards}</main>`);
await page.screenshot({ path: path.join(process.cwd(), ".audit-temp", "image-pairings.png"), fullPage: true });
await browser.close();
console.log(`Captured ${imageRecords.length} image-question pairings.`);
