import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dist = join(root, "dist");
const generated = spawnSync(process.execPath, ["scripts/generate-config.mjs"], { stdio: "inherit" });

if (generated.status !== 0) {
  process.exit(generated.status || 1);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const staticDirs = new Set(["assets", "css", "data", "js", "legacy"]);
const staticExt = new Set([".html", ".css", ".js", ".json", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico", ".webmanifest"]);

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    if (staticDirs.has(entry.name)) {
      copyDir(join(root, entry.name), join(dist, entry.name));
    }
    continue;
  }

  if (entry.name === "package.json" || entry.name === "package-lock.json" || entry.name === "vercel.json") {
    continue;
  }

  if (staticExt.has(extname(entry.name).toLowerCase()) || entry.name === "manifest.json") {
    copyFile(join(root, entry.name), join(dist, entry.name));
  }
}

if (!existsSync(join(dist, "index.html"))) {
  throw new Error("dist/index.html was not created");
}

function copyFile(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

function copyDir(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      copyFile(from, to);
    }
  }
}
