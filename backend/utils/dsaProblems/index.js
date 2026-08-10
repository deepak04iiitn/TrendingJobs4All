import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-discovers every *.problems.js file in this directory so authoring batches
// can each add a new file independently (no shared file to merge/conflict on).
const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith('.problems.js'))
  .sort();

const ALL = [];
for (const file of files) {
  // eslint-disable-next-line no-await-in-loop
  const mod = await import(`./${file}`);
  const arr = mod.default;
  if (!Array.isArray(arr)) {
    throw new Error(`${file} must default-export an array of problem specs`);
  }
  for (const spec of arr) ALL.push({ ...spec, __sourceFile: file });
}

const byName = new Map();
for (const spec of ALL) {
  if (byName.has(spec.legacyProblemName)) {
    const existing = byName.get(spec.legacyProblemName);
    throw new Error(
      `Duplicate DSA problem spec for "${spec.legacyProblemName}" (in ${existing.__sourceFile} and ${spec.__sourceFile})`
    );
  }
  byName.set(spec.legacyProblemName, spec);
}

export const PROBLEM_SPECS = ALL;

export function getSpecByName(legacyProblemName) {
  return byName.get(legacyProblemName) || null;
}

export function allSpecNames() {
  return [...byName.keys()];
}
