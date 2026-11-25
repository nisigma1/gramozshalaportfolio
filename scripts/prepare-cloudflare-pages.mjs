import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const distDir = join(root, "dist");
const clientDir = join(distDir, "client");
const pagesDir = join(distDir, "pages");
const serverEntry = join(distDir, "server", "index.js");
const workerEntry = join(pagesDir, "_worker.js");
const generatedWranglerDeployConfig = join(root, ".wrangler", "deploy");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(clientDir))) {
  throw new Error("Cloudflare Pages prep failed: dist/client was not found. Run the Vinext build first.");
}

if (!(await exists(serverEntry))) {
  throw new Error("Cloudflare Pages prep failed: dist/server/index.js was not found. Run the Vinext build first.");
}

await mkdir(pagesDir, { recursive: true });

await cp(clientDir, pagesDir, {
  recursive: true,
  force: true,
});

await cp(join(distDir, "server"), join(pagesDir, "server"), {
  recursive: true,
  force: true,
});

await writeFile(
  workerEntry,
  [
    'import worker from "./server/index.js";',
    "",
    "export default worker;",
    "",
  ].join("\n"),
  "utf8",
);

await rm(generatedWranglerDeployConfig, {
  recursive: true,
  force: true,
});

await rm(join(pagesDir, "server", "wrangler.json"), {
  force: true,
});

// This public portfolio has no personalized page data. Render it during the
// build instead of consuming a shared Pages Function request on every visit.
const worker = (await import(pathToFileURL(serverEntry).href)).default;
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
const snapshots = [
  ["/", "index.html", "text/html", 200],
  ["/.rsc", "index.rsc", "text/x-component", 200],
  ["/robots.txt", "robots.txt", "text/plain", 200],
  ["/sitemap.xml", "sitemap.xml", "application/xml", 200],
];
for (const [route, filename, contentType, status] of snapshots) {
  const response = await worker.fetch(new Request(`https://gramozshala.com${route}`, {
    headers: { accept: "text/html" },
  }), env, ctx);
  if (response.status !== status || !response.headers.get("content-type")?.startsWith(contentType)) {
    throw new Error(`Invalid static snapshot for ${route}: ${response.status}`);
  }
  await writeFile(join(pagesDir, filename), await response.text());
}
await writeFile(join(pagesDir, "404.html"), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Gramoz Shala</title><body><main><h1>Page not found</h1><p><a href="/">Return to Gramoz Shala’s portfolio</a></p></main></body></html>');
await writeFile(join(pagesDir, "_routes.json"), JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }));
await writeFile(join(pagesDir, "_redirects"), "/.rsc /index.rsc 200\n");
await writeFile(join(pagesDir, "_headers"), "/index.rsc\n  Content-Type: text/x-component; charset=utf-8\n  Cache-Control: public, max-age=0, must-revalidate\n");

console.log("Prepared Cloudflare Pages output in dist/pages with _worker.js, static assets, and root Pages config.");
