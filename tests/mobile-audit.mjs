import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const engine = process.env.QA_BROWSER || "chromium";
const motion = process.env.QA_MOTION || "reduce";
const browser = await playwright[engine].launch({ headless: true });
const baseURL = process.env.TEST_BASE_URL || "http://localhost:3021";
const errors = [];
const sizes = motion === "no-preference" ? [[390, 844]] : engine === "webkit" ? [[390, 844], [430, 932]] : [[320, 568], [375, 667], [390, 844], [393, 852], [430, 932], [844, 390]];
await mkdir("outputs/mobile-audit", { recursive: true });

try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: motion });
    await context.addInitScript(() => {
      window.copyValues = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.copyValues.push(value); } } });
    });
    // Verify outgoing destinations without sending email, launching a dialer,
    // or navigating a third-party application during automated QA.
    await context.route(/https:\/\/(mail\.google\.com|(?:www\.)?malera\.studio)\//, (route) => route.fulfill({ contentType: "text/html", body: "<title>QA destination</title>" }));
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(baseURL);
    await page.waitForFunction(() => document.querySelector(".hero-disclose").classList.contains("is-revealed"));
    assert.equal(await page.locator(".hero-portrait img").evaluate((image) => image.complete && image.naturalWidth > 0), true);

    for (const theme of ["dark", "light"]) {
      if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).tap();
      assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
      const sections = page.locator("main > section");
      for (let index = 0; index < await sections.count(); index++) {
        const section = sections.nth(index);
        await section.scrollIntoViewIfNeeded();
        if (width === 390) await section.screenshot({ path: `outputs/mobile-audit/${engine}-${theme}-section-${index}.png`, animations: "disabled" });
      }
      const issues = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,li")]
          .filter((element) => !element.classList.contains("sr-only") && element.clientWidth > 2 && element.scrollWidth > element.clientWidth + 2)
          .map((element) => element.textContent.trim().slice(0, 60)),
        smallTargets: [...document.querySelectorAll("a,button")]
          .filter((element) => { const box = element.getBoundingClientRect(); return box.width > 1 && box.height > 1 && box.height < 43; })
          .map((element) => element.textContent.trim()),
        invalidAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .filter((element) => !document.getElementById(element.hash.slice(1))).map((element) => element.hash),
      }));
      assert.deepEqual(issues, { overflow: false, clipped: [], smallTargets: [], invalidAnchors: [] });
      if (width === 390) await page.locator("footer").screenshot({ path: `outputs/mobile-audit/${engine}-${theme}-footer.png`, animations: "disabled" });
      await page.locator(".impact-section").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.impact-grid dd [aria-hidden="true"]').textContent.includes("1,300+"));
    }
    await page.reload();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.getByRole("button", { name: "Switch to dark theme" }).tap();

    for (const text of ["Explore my work", "Contact me", "Scroll to explore"]) {
      const link = page.getByRole("link", { name: text, exact: true });
      const hash = await link.getAttribute("href");
      await link.tap();
      await page.waitForFunction((hash) => location.hash === hash, hash);
      await page.waitForFunction((hash) => Math.abs(document.querySelector(hash).getBoundingClientRect().top - 88) < 8, hash);
    }
    for (const label of ["About", "Focus", "Experience", "Malera Studio", "Skills", "Certifications", "Contact"]) {
      const box = await page.getByRole("button", { name: "Open navigation menu" }).boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      const menu = page.getByRole("dialog");
      const link = menu.getByRole("link", { name: label, exact: true });
      const hash = await link.getAttribute("href");
      await link.tap();
      await menu.waitFor({ state: "detached" });
      try {
        await page.waitForFunction((hash) => location.hash === hash && Math.abs(document.querySelector(hash).getBoundingClientRect().top - 88) < 8, hash, { timeout: 5000 });
      } catch (error) {
        console.log("Navigation failure", { engine, width, label, state: await page.evaluate((hash) => ({ hash: location.hash, top: document.querySelector(hash).getBoundingClientRect().top, body: document.body.style.cssText }), hash) });
        throw error;
      }
    }

    for (const selector of [".experience-trigger", ".certification-trigger"]) {
      const buttons = page.locator(selector);
      for (let index = 0; index < await buttons.count(); index++) {
        const button = buttons.nth(index);
        if (await button.getAttribute("aria-expanded") === "true") await button.tap();
        await button.tap();
        assert.equal(await button.getAttribute("aria-expanded"), "true");
        await button.tap();
        assert.equal(await button.getAttribute("aria-expanded"), "false");
      }
    }
    for (const [type, value] of [["email", "gramozshala03@gmail.com"], ["phone", "+383 48 570 674"]]) {
      const button = page.getByRole("button", { name: `Copy ${type}`, exact: true });
      await button.tap();
      await page.waitForFunction((value) => window.copyValues.at(-1) === value, value);
      assert.equal(await button.innerText(), "Copied");
    }
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Blocked"); } } });
      window.copyValues = [];
      document.execCommand = () => { window.copyValues.push(document.querySelector("textarea").value); return true; };
    });
    const fallbackButton = page.getByRole("button", { name: "Copy email", exact: true });
    await fallbackButton.focus();
    await fallbackButton.press("Enter");
    await page.waitForFunction(() => window.copyValues.at(-1) === "gramozshala03@gmail.com");
    await page.waitForFunction(() => document.activeElement === document.querySelector('[aria-label="Copy email"]'));
    await page.evaluate(() => {
      document.execCommand = () => false;
    });
    await page.getByRole("button", { name: "Copy email", exact: true }).tap();
    await page.getByRole("status").filter({ hasText: "Couldn’t copy" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Copy email", exact: true }).innerText(), "Copy email");

    await page.locator('a[href^="tel:"]').evaluate((element) => element.addEventListener("click", (event) => { event.preventDefault(); window.phoneTapped = element.href; }));
    await page.locator('a[href^="tel:"]').tap();
    assert.equal(await page.evaluate(() => window.phoneTapped), "tel:+38348570674");
    for (const name of ["Open Gmail to email Gramoz", "Visit Malera Studio, opens in a new tab"]) {
      const popupPromise = context.waitForEvent("page");
      await page.getByRole("link", { name, exact: true }).tap();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.match(popup.url(), name.startsWith("Open") ? /^https:\/\/mail.google.com\/mail\// : /^https:\/\/malera.studio\//);
      await popup.close();
    }
    await page.getByRole("link", { name: "Back to top", exact: true }).tap();
    await page.waitForFunction(() => window.scrollY < 80);
    await page.getByRole("link", { name: "Gramoz Shala, home" }).tap();
    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("main") === document.activeElement);
    await page.locator(".footer-credit a").evaluate((element) => element.addEventListener("click", (event) => { event.preventDefault(); window.creditTapped = element.href; }));
    await page.locator(".footer-credit a").tap();
    assert.equal(await page.evaluate(() => window.creditTapped), "https://www.malera.studio/");
    console.log(`PASS ${engine} ${width}x${height}: every section, theme, CTA, menu item, accordion, copy success/failure, external link, phone, footer, skip link`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
