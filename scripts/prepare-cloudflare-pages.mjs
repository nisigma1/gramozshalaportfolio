import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

console.log("Prepared Cloudflare Pages output in dist/pages with _worker.js, static assets, and root Pages config.");
