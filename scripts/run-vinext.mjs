import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const command = process.argv[2];
const extraArgs = process.argv.slice(3);
const allowed = new Set(["build", "dev", "start"]);

if (!allowed.has(command)) {
  console.error("Usage: node scripts/run-vinext.mjs <build|dev|start>");
  process.exit(1);
}

const cliPath = join(process.cwd(), "node_modules", "vinext", "dist", "cli.js");

if (!existsSync(cliPath)) {
  console.error("Vinext CLI was not found. Run npm install before starting the site.");
  process.exit(1);
}

const child = spawn(process.execPath, [cliPath, command, ...extraArgs], {
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
