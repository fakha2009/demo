import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function readJson(file) {
  return JSON.parse(await readFile(path.join(root, file), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function uniqueBy(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item[key];
    assert(value !== undefined && value !== null && value !== "", `${label}: empty ${key}`);
    assert(!seen.has(value), `${label}: duplicate ${key} ${value}`);
    seen.add(value);
  }
  return seen;
}

const [elementsData, substancesData, reactionsData] = await Promise.all([
  readJson("backend/seeddata/elements.json"),
  readJson("backend/seeddata/substances.json"),
  readJson("backend/seeddata/reactions.json")
]);

const elements = elementsData.elements || [];
const substances = substancesData.substances || [];
const reactions = reactionsData.reactions || [];

assert(elements.length === 118, `elements: expected 118, got ${elements.length}`);
assert(elementsData.metadata?.total_elements === elements.length, "elements: metadata total_elements mismatch");
uniqueBy(elements, "atomic_number", "elements");
uniqueBy(elements, "symbol", "elements");
for (const element of elements) {
  assert(element.name_ru && element.name_en, `elements: ${element.symbol} misses names`);
  const extendedRow = element.category === "lanthanide" || element.category === "actinide";
  assert(extendedRow ? element.group === null || (Number.isInteger(element.group) && element.group >= 0 && element.group <= 18) : Number.isInteger(element.group) && element.group >= 1 && element.group <= 18, `elements: bad group for ${element.symbol}`);
  assert(Number.isInteger(element.period) && element.period >= 1 && element.period <= 7, `elements: bad period for ${element.symbol}`);
}

const substanceIds = uniqueBy(substances, "id", "substances");
for (const substance of substances) {
  assert(substance.name && substance.formula, `substances: ${substance.id} misses name/formula`);
  assert(substance.safetyLevel || substance.hazard_level, `substances: ${substance.id} misses safety level`);
}

uniqueBy(reactions, "id", "reactions");
assert(reactionsData.metadata?.total_reactions === reactions.length, "reactions: metadata total_reactions mismatch");
for (const reaction of reactions) {
  assert(reaction.title && reaction.equation && reaction.type, `reactions: ${reaction.id} misses title/equation/type`);
  assert(Array.isArray(reaction.reactants) && reaction.reactants.length >= 2, `reactions: ${reaction.id} needs at least two reactants`);
  for (const reactant of reaction.reactants) {
    assert(substanceIds.has(reactant), `reactions: ${reaction.id} references unknown reactant ${reactant}`);
  }
  assert(reaction.observation && reaction.explanation, `reactions: ${reaction.id} misses observation/explanation`);
}

console.log(`Data OK: ${elements.length} elements, ${substances.length} substances, ${reactions.length} reactions.`);
