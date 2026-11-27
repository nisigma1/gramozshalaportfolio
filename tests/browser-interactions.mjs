import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const baseURL = process.env.TEST_BASE_URL || "http://localhost:3021";
const browser = await chromium.launch({ headless: true });
const errors = [];
await mkdir("outputs/interaction-qa", { recursive: true });

try {
  for (const [width, height] of [[320, 568], [390, 844], [430, 932], [768, 1024], [844, 390], [1024, 768], [1280, 800], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(baseURL);
    const triggers = page.locator(".certification-trigger");
    await triggers.first().click();
    await page.waitForFunction(() => document.querySelector(".certification-trigger")?.getAttribute("aria-expanded") === "true");
    assert.equal(await page.locator(".certification-panel").first().evaluate((element) => element.inert), false);
    await triggers.nth(1).click();
    assert.equal(await triggers.first().getAttribute("aria-expanded"), "false");
    await triggers.nth(1).press("Enter");
    assert.equal(await triggers.nth(1).getAttribute("aria-expanded"), "false");
    await page.waitForFunction(() => document.querySelector(".certification-panel").getBoundingClientRect().height === 0);
    for (let index = 0; index < await triggers.count(); index++) {
      await triggers.nth(index).click();
      assert.equal(await triggers.nth(index).getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator(".certification-item.is-open").count(), 1);
    }
    assert.equal(await page.locator("header").evaluate((element) => getComputedStyle(element).position), "sticky");
    assert.equal(await page.locator("header").evaluate((element) => Math.round(element.getBoundingClientRect().top)), 0);
    await page.screenshot({ path: `outputs/interaction-qa/certifications-${width}.png` });

    if (width < 1280) {
      const scrollY = await page.evaluate(() => window.scrollY);
      // Click the already visible sticky control without Playwright scrolling
      // its normal-flow box into view before dispatching the pointer event.
      const opener = await page.getByRole("button", { name: "Open navigation menu" }).boundingBox();
      assert.ok(opener);
      await page.mouse.click(opener.x + opener.width / 2, opener.y + opener.height / 2);
      const menu = page.getByRole("dialog", { name: "Navigation menu" });
      await menu.waitFor();
      assert.equal(await page.locator("main").evaluate((element) => element.inert), true);
      assert.equal(await menu.evaluate((element) => getComputedStyle(element).opacity), "1");
      await page.keyboard.press("Shift+Tab");
      assert.equal(await menu.evaluate((element) => element.contains(document.activeElement)), true);
      const currentSection = await menu.locator('[aria-current="location"]').getAttribute("href");
      assert.notEqual(currentSection, "#contact");
      await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => Math.round(window.scrollY)), Math.round(scrollY));
      assert.equal(await page.getByRole("button", { name: "Open navigation menu" }).evaluate((element) => element === document.activeElement), true);
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      await menu.getByRole("button", { name: "Switch to light theme" }).click();
      assert.equal(await menu.getByRole("button", { name: "Close navigation menu" }).evaluate((element) => element.getBoundingClientRect().top >= 0), true);
      await page.waitForFunction(() => getComputedStyle(document.querySelector(".mobile-menu")).color === "rgb(17, 19, 22)");
      await page.screenshot({ path: `outputs/interaction-qa/menu-light-${width}.png`, animations: "disabled" });
      await menu.getByRole("button", { name: "Switch to dark theme" }).click();
      await menu.getByRole("link", { name: "Skills", exact: true }).click();
      await menu.waitFor({ state: "detached" });
      await page.waitForFunction(() => Math.abs(document.querySelector("#skills").getBoundingClientRect().top - 88) < 8);
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.setViewportSize({ width: 1440, height: 900 });
      await menu.waitFor({ state: "detached" });
      assert.notEqual(await page.locator("body").evaluate((element) => element.style.position), "fixed");
      await page.setViewportSize({ width, height });
    } else {
      await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Certifications" }).click();
      await page.waitForFunction(() => document.querySelector('.desktop-nav a[href="#certifications"]')?.getAttribute("aria-current") === "location");
    }
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
    console.log(`PASS ${width}x${height}: accordions, navigation, focus, scroll, overflow`);
    await page.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
