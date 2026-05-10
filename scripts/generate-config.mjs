import { mkdir, readFile, writeFile } from "node:fs/promises";

await loadDotEnv(".env");

const apiBaseUrl = normalizeApiBaseUrl(process.env.CHEMLAB_API_URL || process.env.VITE_API_BASE_URL || "http://localhost:8080/api");

await mkdir("js", { recursive: true });
await writeFile(
  "js/config.js",
  `window.CHEMLAB_API_URL = window.CHEMLAB_API_URL || ${JSON.stringify(apiBaseUrl)};\nwindow.CHEMLAB_CONFIG = Object.freeze({ API_BASE_URL: window.CHEMLAB_API_URL });\n`,
  "utf8",
);

console.log("Generated js/config.js");

async function loadDotEnv(path) {
  try {
    const content = await readFile(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Vercel and other hosts provide real environment variables directly.
  }
}

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || "http://localhost:8080/api").replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}
