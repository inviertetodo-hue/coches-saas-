import { chromium } from "playwright";

async function run() {
  console.log("INICIANDO PLAYWRIGHT...");

  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://suchen.mobile.de/fahrzeuge/details.html?id=397445030",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    }
  );

  console.log("TITULO:");
  console.log(await page.title());

  await page.screenshot({
    path: "mobile-test.png",
    fullPage: true,
  });

  console.log("SCREENSHOT GUARDADO");
}

run();