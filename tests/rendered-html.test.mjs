import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Gramoz Shala portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Gramoz Shala — Electronics, Automation &amp; Robotics<\/title>/i,
  );
  assert.match(html, /<h1[^>]*>Gramoz Shala<\/h1>/);
  assert.match(html, /Engineering ideas into systems that work\./);
  assert.match(html, /Student Initiative for Innovation/);
  assert.match(html, /Faculty of Electrical and Computer Engineering/);
  assert.match(html, /Learning beyond the lecture hall\./i);
  assert.match(html, /gramozshala03@gmail\.com/);
  assert.match(html, /tel:\+38348570674/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|lorem ipsum/i);
});

test("keeps portfolio content typed and accessibility safeguards in source", async () => {
  const [page, layout, client, data, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PortfolioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/portfolio.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<PortfolioClient \/>/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /localStorage\.getItem\("gramoz-theme"\)/);
  assert.match(client, /className="skip-link"/);
  assert.match(client, /aria-modal="true"/);
  assert.match(client, /aria-expanded=\{isOpen\}/);
  assert.match(client, /aria-live="polite"/);
  assert.match(client, /event\.key === "Escape"/);
  assert.match(data, /satisfies readonly Experience\[\]/);
  assert.match(data, /Volunteer of the Year 2019/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:root\[data-theme="light"\]/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
