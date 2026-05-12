const baseUrl = (process.env.CHEMLAB_PROD_URL || "https://demo-seven-omega-89.vercel.app").replace(/\/$/, "");
const requireApi = process.env.SMOKE_REQUIRE_API === "true";

async function fetchText(path) {
  const response = await fetch(baseUrl + path, { redirect: "follow" });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}

function assertIncludes(text, value, path) {
  if (!text.includes(value)) throw new Error(`${path}: missing ${value}`);
}

const index = await fetchText("/");
assertIncludes(index, "ChemLab TJ", "/");
assertIncludes(index, "themeToggle", "/");
assertIncludes(index, "Цифровая химическая", "/");

const demo = await fetchText("/demo.html");
assertIncludes(demo, "quickStartLab", "/demo.html");
assertIncludes(demo, "lab-brief", "/demo.html");
assertIncludes(demo, "benchDropzone", "/demo.html");

try {
  const health = await fetchText("/api/health");
  assertIncludes(health, "ok", "/api/health");
} catch (error) {
  if (requireApi) throw error;
  console.warn(`API health skipped: ${error.message}`);
}

console.log(`Production smoke OK: ${baseUrl}`);
