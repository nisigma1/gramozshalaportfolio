import { cp, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const clientDir = join(distDir, "client");
const serverEntry = join(distDir, "server", "index.js");
const workerEntry = join(distDir, "_worker.js");

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

await cp(clientDir, distDir, {
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

console.log("Prepared Cloudflare Pages output in dist/ with _worker.js and root static assets.");
