/**
 * Seed dsa_problems + dsa_test_cases from frontend/src/data/dsa.json, using the
 * real per-problem specs in backend/utils/dsaProblems/*.js (statement, hints,
 * solution, and — critically — a correct solve() algorithm used to compute
 * every hidden test case's expected output via the shared I/O shape library).
 *
 * Catalog rows with no matching spec yet are reported and skipped — never
 * silently filled with placeholder content.
 *
 * Usage: node backend/scripts/seed-dsa-catalog.js [--fresh]
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import DsaTestCase from '../models/dsaTestCase.model.js';
import { slugifyProblemName, validateTestSuite, DSA_LANGUAGES } from '../utils/dsaConstants.js';
import { makeRng } from '../utils/dsaIOShapes.js';
import { buildProblemFromSpec } from '../utils/dsaProblemBuilder.js';
import { PROBLEM_SPECS, getSpecByName } from '../utils/dsaProblems/index.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fresh = process.argv.includes('--fresh');

function starterFromShapeOutput(starterByLang) {
  // starterByLang already keyed by our internal language ids, which match DSA_LANGUAGES.
  const out = {};
  for (const lang of DSA_LANGUAGES) out[lang] = starterByLang[lang] || '';
  return out;
}

async function main() {
  if (!process.env.MONGO) throw new Error('MONGO is not set');
  await mongoose.connect(process.env.MONGO);
  console.log('Mongo connected');

  const jsonPath = path.join(__dirname, '../../frontend/src/data/dsa.json');
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const seen = new Set();
  const uniqueRows = [];
  for (const row of rows) {
    const name = row['Problem Name'];
    if (seen.has(name)) continue;
    seen.add(name);
    uniqueRows.push(row);
  }
  console.log(`Loaded ${rows.length} catalog rows (${uniqueRows.length} unique)`);
  console.log(`Spec registry has ${PROBLEM_SPECS.length} authored problems`);

  if (fresh) {
    await DsaTestCase.deleteMany({});
    await DsaCatalogProblem.deleteMany({});
    console.log('Cleared dsa_problems + dsa_test_cases');
  }

  let seeded = 0;
  let testCount = 0;
  const missingSpec = [];
  const failures = [];
  let order = 0;

  for (const row of uniqueRows) {
    const name = row['Problem Name'];
    const spec = getSpecByName(name);
    if (!spec) {
      missingSpec.push(name);
      continue;
    }

    try {
      const rng = makeRng(`${name}::v1`);
      const { cases, examples, starterCode } = buildProblemFromSpec(spec, rng);
      const validation = validateTestSuite(cases.map((c) => ({ caseKind: c.kind, isSample: c.isSample })));
      if (!validation.ok) {
        failures.push({ title: name, errors: validation.errors });
        continue;
      }

      const slugBase = slugifyProblemName(name);
      let slug = slugBase;
      const existingSlug = await DsaCatalogProblem.findOne({ slug, legacyProblemName: { $ne: name } });
      if (existingSlug) slug = `${slugBase}-${order}`;

      const problem = await DsaCatalogProblem.findOneAndUpdate(
        { legacyProblemName: name },
        {
          $set: {
            slug,
            title: name,
            legacyProblemName: name,
            category: row.Category,
            difficulty: row.Difficulty,
            legacyExternalLink: row['Problem Link'] || '',
            statement: spec.statement,
            examples,
            constraints: spec.constraints || '',
            inputFormat: spec.inputFormat || '',
            outputFormat: spec.outputFormat || '',
            hints: (spec.hints || []).map((text, i) => ({ order: i + 1, text })),
            solutions: [
              {
                language: 'python',
                code: spec.pythonSolutionCode || '',
                approach: spec.solutionApproach || '',
                timeComplexity: spec.timeComplexity || '',
                spaceComplexity: spec.spaceComplexity || '',
              },
            ],
            starterCode: starterFromShapeOutput(starterCode),
            ioShape: spec.shape,
            shapeConfig: spec.shapeConfig || {},
            comparisonMode: spec.comparisonMode || 'exact',
            comparisonConfig: spec.comparisonConfig || {},
            status: 'published',
            order,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      order += 1;

      await DsaTestCase.deleteMany({ problemId: problem._id });
      const docs = cases.map((c, index) => ({
        problemId: problem._id,
        index,
        stdin: c.stdin,
        expectedStdout: c.expectedStdout,
        isSample: !!c.isSample,
        isHidden: !c.isSample,
        caseKind: c.kind,
        edgeTags: [],
        timeLimitMs: c.kind === 'stress' ? 3000 : 2000,
        weight: 1,
      }));
      await DsaTestCase.insertMany(docs);
      testCount += docs.length;
      seeded += 1;
    } catch (error) {
      failures.push({ title: name, errors: [error.message] });
    }
  }

  console.log(
    JSON.stringify(
      {
        seeded,
        testCount,
        missingSpecCount: missingSpec.length,
        missingSpec: missingSpec.slice(0, 30),
        failureCount: failures.length,
        failures: failures.slice(0, 10),
      },
      null,
      2
    )
  );
  await mongoose.connection.close();
  if (failures.length) process.exit(1);
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
