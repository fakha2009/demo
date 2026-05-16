import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readJSON(file) {
  const fullPath = path.join(root, file);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    return null;
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function unique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item?.[key];
    assert(value !== undefined && value !== null && value !== "", `${label}: missing ${key}`);
    if (value === undefined || value === null || value === "") continue;
    assert(!seen.has(value), `${label}: duplicate ${key} "${value}"`);
    seen.add(value);
  }
}

function validateElements(file) {
  const doc = readJSON(file);
  if (!doc) return;
  const elements = doc.elements;
  assert(Array.isArray(elements), `${file}: elements must be an array`);
  if (!Array.isArray(elements)) return;

  unique(elements, "atomic_number", file);
  unique(elements, "symbol", file);
  assert(elements.length === 118, `${file}: expected 118 elements, got ${elements.length}`);
  assert(doc.metadata?.total_elements === elements.length, `${file}: metadata.total_elements does not match elements length`);

  for (const element of elements) {
    assert(Number.isInteger(element.atomic_number) && element.atomic_number >= 1 && element.atomic_number <= 118, `${file}: invalid atomic_number for ${element.symbol}`);
    assert(typeof element.symbol === "string" && /^[A-Z][a-z]?$/.test(element.symbol), `${file}: invalid symbol "${element.symbol}"`);
    assert(typeof element.name_ru === "string" && element.name_ru.length > 0, `${file}: missing Russian name for ${element.symbol}`);
    assert(typeof element.name_en === "string" && element.name_en.length > 0, `${file}: missing English name for ${element.symbol}`);
    assert(Number.isInteger(element.period) && element.period >= 1 && element.period <= 7, `${file}: invalid period for ${element.symbol}`);
    if (element.group !== null) {
      assert(Number.isInteger(element.group) && element.group >= 1 && element.group <= 18, `${file}: invalid group for ${element.symbol}`);
    }
  }
}

function validateCollection(file, key) {
  const doc = readJSON(file);
  if (!doc) return;
  const items = doc[key];
  assert(Array.isArray(items), `${file}: ${key} must be an array`);
  if (!Array.isArray(items)) return;
  unique(items, "id", file);
}

validateElements("data/elements.json");
validateElements("backend/seeddata/elements.json");
validateCollection("data/reactions.json", "reactions");
validateCollection("backend/seeddata/reactions.json", "reactions");
validateCollection("data/substances.json", "substances");
validateCollection("backend/seeddata/substances.json", "substances");

if (failures.length) {
  console.error("Data validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Data validation passed.");
