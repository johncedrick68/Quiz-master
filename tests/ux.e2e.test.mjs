import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseURL = process.env.UX_BASE_URL ?? "http://127.0.0.1:3001";
const executablePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await chromium.launch({ executablePath, headless: true });

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.content <= dimensions.viewport + 1,
    `${label} overflows horizontally: ${dimensions.content}px > ${dimensions.viewport}px`,
  );
}

async function runViewport(name, viewport, completeExam = false) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await assertNoHorizontalOverflow(page, `${name} home`);
  await page.getByText("Made by John Cedrick A. Libradilla").waitFor();
  for (const item of ["Home", "Review", "Exams"]) {
    await page.getByRole("button", { name: item, exact: true }).waitFor();
  }

  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("heading", { name: "Review before the exam" }).waitFor();
  await assertNoHorizontalOverflow(page, `${name} reviewer`);
  await page.getByLabel("Search reviewer").fill("stop");
  await page.getByLabel("Search reviewer").fill("");
  const nextPage = page.getByRole("button", { name: "Next →" });
  if (await nextPage.isEnabled()) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await nextPage.click();
    await page.waitForFunction(() => window.scrollY < 10);
  }

  await page.getByRole("button", { name: "Exams", exact: true }).click();
  await page.getByRole("heading", { name: "Build your exam" }).waitFor();
  await page.getByRole("button", { name: /English/i }).click();
  await page.getByRole("button", { name: /Full exam/i }).click();
  await page.getByRole("button", { name: /40 questions/i }).click();
  await page.getByRole("button", { name: "Start exam" }).click();
  await page.getByText("out of 40").waitFor();
  await assertNoHorizontalOverflow(page, `${name} quiz`);

  const answerButtons = page.locator(".lto-answer");
  await answerButtons.first().click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("button", { name: /Next/ }).click();
  await page.waitForFunction(() => window.scrollY < 10);

  if (completeExam) {
    for (let index = 2; index <= 40; index += 1) {
      await page.locator(".lto-answer").first().click();
      await page.getByRole("button", { name: index === 40 ? /Finish/ : /Next/ }).click();
    }
    await page.getByText("Reviewer complete").waitFor();
    await page.getByRole("button", { name: "Try another set" }).waitFor();
    await page.getByRole("button", { name: "Back to home" }).click();
    await page.getByRole("heading", { name: "LTO Driving License Reviewer" }).waitFor();
  }

  await context.close();
}

await runViewport("mobile", { width: 390, height: 844 });
await runViewport("desktop", { width: 1440, height: 900 }, true);

const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(baseURL, { waitUntil: "networkidle" });
const animationName = await reducedPage
  .locator(".lto-view")
  .evaluate((element) => getComputedStyle(element).animationName);
assert.equal(animationName, "none");
await reducedContext.close();

await browser.close();
console.log("UX checks passed: mobile, desktop, full exam flow, and reduced motion.");
