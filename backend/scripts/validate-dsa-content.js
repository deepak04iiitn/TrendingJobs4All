/**
 * Validates the DSA content pipeline end to end:
 *  1. Every authored spec (backend/utils/dsaProblems/*.js) round-trips cleanly —
 *     gen/genArgs -> encode -> decode -> solve -> format never throws, is
 *     deterministic (same seed -> identical cases), and yields a valid 50-case
 *     test suite (>=20 edge, >=1 stress, >=2 sample).
 *  2. Every *published* catalog problem in Mongo has real content (statement,
 *     >=2 examples, complete starterCode) and its stored test cases still match
 *     what the current spec would generate (catches spec edits that were never
 *     re-seeded).
 *  3. Which catalog rows in dsa.json still have no spec at all.
 *
 * Usage: node backend/scripts/validate-dsa-content.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import DsaTestCase from '../models/dsaTestCase.model.js';
import { validateTestSuite, REQUIRED_TEST_COUNT, MIN_EDGE_CASES, DSA_LANGUAGES } from '../utils/dsaConstants.js';
import { makeRng } from '../utils/dsaIOShapes.js';
import { buildProblemFromSpec } from '../utils/dsaProblemBuilder.js';
import { PROBLEM_SPECS } from '../utils/dsaProblems/index.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function specRoundTripReport(spec) {
  const errors = [];
  let built;
  try {
    const rng = makeRng(`${spec.legacyProblemName}::v1`);
    built = buildProblemFromSpec(spec, rng);
  } catch (err) {
    return { ok: false, errors: [`build threw: ${err.message}`] };
  }

  const { cases, examples, starterCode } = built;
  const validation = validateTestSuite(cases.map((c) => ({ caseKind: c.kind, isSample: c.isSample })));
  if (!validation.ok) errors.push(...validation.errors);
  if (examples.length < 2) errors.push(`need >=2 examples, got ${examples.length}`);
  for (const ex of examples) {
    if (!ex.input || ex.output === undefined || ex.output === null) errors.push('example missing input/output');
    if (String(ex.output).includes('[object Object]')) errors.push('example output failed to serialize (raw node object leaked)');
  }
  const langs = Object.keys(starterCode);
  for (const lang of DSA_LANGUAGES) {
    if (!starterCode[lang] || starterCode[lang].length < 10) errors.push(`starterCode missing/short for ${lang}`);
  }
  if (!spec.statement || spec.statement.length < 20) errors.push('statement missing or too short');
  if (!spec.hints || spec.hints.length < 2) errors.push('need >=2 hints');
  if (!spec.pythonSolutionCode) errors.push('missing pythonSolutionCode');

  // Determinism: rebuilding with the same seed must give identical stdin/expectedStdout.
  try {
    const rng2 = makeRng(`${spec.legacyProblemName}::v1`);
    const rebuilt = buildProblemFromSpec(spec, rng2);
    const same =
      rebuilt.cases.length === cases.length &&
      rebuilt.cases.every((c, i) => c.stdin === cases[i].stdin && c.expectedStdout === cases[i].expectedStdout);
    if (!same) errors.push('non-deterministic case generation (same seed produced different cases)');
  } catch (err) {
    errors.push(`determinism re-check threw: ${err.message}`);
  }

  return { ok: errors.length === 0, errors, cases, examples };
}

async function main() {
  if (!process.env.MONGO) throw new Error('MONGO is not set');
  await mongoose.connect(process.env.MONGO);

  const jsonPath = path.join(__dirname, '../../frontend/src/data/dsa.json');
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const catalogNames = new Set(rows.map((r) => r['Problem Name']));
  const specNames = new Set(PROBLEM_SPECS.map((s) => s.legacyProblemName));
  const missingSpec = [...catalogNames].filter((n) => !specNames.has(n));

  const specReport = { total: PROBLEM_SPECS.length, ok: 0, failed: [] };
  const specCasesByName = new Map();
  for (const spec of PROBLEM_SPECS) {
    const result = specRoundTripReport(spec);
    if (result.ok) {
      specReport.ok += 1;
      specCasesByName.set(spec.legacyProblemName, result.cases);
    } else {
      specReport.failed.push({ title: spec.legacyProblemName, errors: result.errors });
    }
  }

  const published = await DsaCatalogProblem.find({ status: 'published' }).lean();
  const dbReport = { total: published.length, ok: 0, failed: [] };
  for (const p of published) {
    const tests = await DsaTestCase.find({ problemId: p._id }).sort({ index: 1 }).lean();
    const validation = validateTestSuite(tests);
    const hasStatement = !!p.statement && p.statement.length > 20;
    const hasExamples = (p.examples || []).length >= 2;
    const hasStarters = DSA_LANGUAGES.every((l) => !!p.starterCode?.[l]);
    const errors = [
      ...validation.errors,
      !hasStatement ? 'missing statement' : null,
      !hasExamples ? 'need >=2 examples' : null,
      !hasStarters ? 'incomplete starterCode' : null,
    ].filter(Boolean);

    const freshCases = specCasesByName.get(p.legacyProblemName);
    if (freshCases) {
      const dbStdins = tests.map((t) => t.stdin);
      const freshStdins = freshCases.map((c) => c.stdin);
      const drifted = dbStdins.length !== freshStdins.length || dbStdins.some((s, i) => s !== freshStdins[i]);
      if (drifted) errors.push('DB test cases drifted from current spec — re-run seed-dsa-catalog.js');
    }

    if (errors.length === 0) dbReport.ok += 1;
    else dbReport.failed.push({ slug: p.slug, title: p.title, testCount: tests.length, required: REQUIRED_TEST_COUNT, errors });
  }

  const report = {
    specs: specReport,
    database: dbReport,
    catalogRowsWithoutSpec: { count: missingSpec.length, sample: missingSpec.slice(0, 30) },
  };
  console.log(JSON.stringify(report, null, 2));

  await mongoose.connection.close();
  if (specReport.failed.length || dbReport.failed.length) process.exit(1);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
