import { chromium } from "playwright";

async function run() {
  console.log("INICIANDO NAVEGADOR PERSISTENTE...");

  const context = await chromium.launchPersistentContext(
    "./playwright-data",
    {
      headless: false,
    }
  );

  const page = await context.newPage();

  await page.goto("https://www.mobile.de/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  console.log("MOBILE.DE ABIERTO");

  await page.waitForTimeout(30000);

  console.log("30 SEGUNDOS TERMINADOS");

  await page.screenshot({
    path: "mobile-home.png",
    fullPage: true,
  });

  console.log("SCREENSHOT GUARDADO");

  await context.close();
}

run();