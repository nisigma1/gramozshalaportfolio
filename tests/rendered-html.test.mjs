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
  assert.match(html, /<h1[^>]*>[\s\S]*Gramoz[\s\S]*Shala[\s\S]*<\/h1>/);
  assert.match(html, /Engineering ideas into systems that work\./);
  assert.match(html, /I contribute ideas for new features across apps, games, websites, and automation projects, helping teams shape and improve their products\./);
  assert.match(html, /Student Initiative for Innovation/);
  assert.match(html, /ELKOS GROUP/);
  assert.doesNotMatch(html, /ELKOS ETC/);
  assert.match(html, /Faculty of Electrical and Computer Engineering/);
  assert.match(html, /Certifications &amp; Recognitions/i);
  assert.match(html, /1,300 participants/i);
  assert.match(html, /gramozshala03@gmail\.com/);
  assert.match(html, /mailto:gramozshala03@gmail\.com/);
  assert.match(html, /https:\/\/mail\.google\.com\/mail\/\?view=cm&amp;fs=1&amp;to=gramozshala03%40gmail\.com/);
  assert.match(html, /tel:\+38348570674/);
  assert.match(html, /gramoz-shala-clean\.jpg/);
  assert.match(html, /Websites, apps, and AI tools built with purpose./);
  assert.match(html, /Visit Malera Studio/);
  assert.match(html, /Web development/);
  assert.match(html, /href="https:\/\/malera\.studio\/"/);
  assert.match(html, /<footer\b[\s\S]*Designed &amp; developed by[\s\S]*<a href="https:\/\/www\.malera\.studio\/">Malera Studio<\/a>[\s\S]*<\/footer>/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|lorem ipsum/i);
});

test("keeps portfolio content typed and accessibility safeguards in source", async () => {
  const [page, layout, client, interactions, data, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PortfolioClient.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../components/PortfolioInteractions.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../data/portfolio.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<PortfolioClient \/>/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /localStorage\.getItem\("gramoz-theme"\)/);
  assert.match(client, /<SkipLink \/>/);
  assert.match(interactions, /className="skip-link"/);
  assert.doesNotMatch(client, /"use client"/);
  assert.match(interactions, /aria-modal="true"/);
  assert.match(interactions, /aria-expanded=\{isOpen\}/);
  assert.match(interactions, /aria-live="polite"/);
  assert.match(interactions, /event\.key === "Escape"/);
  assert.match(data, /satisfies readonly Experience\[\]/);
  assert.match(data, /Volunteer of the Year 2019/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:root\[data-theme="light"\]/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
