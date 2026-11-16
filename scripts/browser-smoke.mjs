#!/usr/bin/env node
import { chromium } from "playwright";
const BASE = process.env.SITE_URL || "http://127.0.0.1:8768";
const errors = [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
const page = await context.newPage();
page.on("pageerror", e => errors.push(e.message));
await page.route("https://open.er-api.com/v6/latest/**", async route => {
  const base = new URL(route.request().url()).pathname.split("/").pop();
  const rates = base === "USD"
    ? { USD: 1, RUB: 100, EUR: 0.9, GBP: 0.8, CNY: 7 }
    : { RUB: 1, USD: 0.01, EUR: 0.009, GBP: 0.008, CNY: 0.07 };
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      result: "success",
      base_code: base,
      time_last_update_utc: "Mon, 16 Nov 2026 00:00:00 +0000",
      rates
    })
  });
});
const response = await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
if (!response || response.status() >= 400) errors.push("Converter page failed to load.");
await page.waitForSelector("#unit-kind");
await page.locator("#unit-kind").selectOption("length");
await page.locator("#unit-amount").fill("1");
await page.locator("#unit-from").selectOption("m");
await page.locator("#unit-to").selectOption("cm");
let result = await page.locator("#unit-result").innerText();
if (!result.includes("100")) errors.push("Length conversion 1 m → 100 cm failed: " + result);

await page.locator("#unit-kind").selectOption("mass");
await page.locator("#unit-amount").fill("1");
await page.locator("#unit-from").selectOption("kg");
await page.locator("#unit-to").selectOption("g");
result = await page.locator("#unit-result").innerText();
if (!result.includes("1 000") && !result.includes("1000")) errors.push("Mass conversion 1 kg → 1000 g failed: " + result);

await page.locator("#unit-kind").selectOption("temperature");
await page.locator("#unit-amount").fill("0");
await page.locator("#unit-from").selectOption("C");
await page.locator("#unit-to").selectOption("F");
result = await page.locator("#unit-result").innerText();
if (!result.includes("32")) errors.push("Temperature conversion 0 °C → 32 °F failed: " + result);

await page.locator("#unit-kind").selectOption("pressure");
await page.locator("#unit-amount").fill("1");
await page.locator("#unit-from").selectOption("bar");
await page.locator("#unit-to").selectOption("kpa");
result = await page.locator("#unit-result").innerText();
if (!result.includes("100")) errors.push("Pressure conversion 1 bar → 100 kPa failed: " + result);

await page.waitForFunction(() => document.querySelector("#money-result")?.textContent.includes("USD"), null, { timeout: 10000 });
await page.locator("#money-amount").fill("100");
await page.locator("#money-from").selectOption("RUB");
await page.locator("#money-to").selectOption("USD");
await page.waitForFunction(() => document.querySelector("#money-result")?.textContent.includes("1 USD"), null, { timeout: 5000 });
await page.locator("#money-to").selectOption("EUR");
await page.waitForFunction(() => document.querySelector("#money-result")?.textContent.includes("0,9 EUR"), null, { timeout: 5000 });
await page.locator("#money-from").selectOption("USD");
await page.waitForFunction(() => document.querySelector("#money-result")?.textContent.includes("90 EUR"), null, { timeout: 5000 });
await page.locator("#money-refresh").click();
await page.waitForFunction(() => document.querySelector("#money-result")?.textContent.includes("90 EUR"), null, { timeout: 5000 });

await page.setViewportSize({ width: 390, height: 844 });
const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
if (width.scroll > width.viewport + 2) errors.push("Horizontal overflow at 390px: " + width.scroll + "/" + width.viewport);
await browser.close();
console.log("Единицы: проверены длина, масса, температура, давление, валютный курс, смена валюты, обновление и мобильная ширина.");
console.log("Errors: " + errors.length);
for (const error of errors) console.error("ERROR:", error);
if (errors.length) process.exitCode = 1;
