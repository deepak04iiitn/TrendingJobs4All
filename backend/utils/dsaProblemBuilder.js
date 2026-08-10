/**
 * Turns a problem spec (backend/utils/dsaProblems/*.js) + its I/O shape
 * (backend/utils/dsaIOShapes.js) into concrete test cases, examples, and
 * starter code — used by both the seed script and the content validator so
 * they can never drift apart.
 *
 * Pipeline per case: gen/genArgs (raw values) -> shape.encode -> stdin ->
 * shape.decode -> solve(...decoded) -> result -> shape.format -> expectedStdout.
 * Piping through encode+decode (not calling solve on the raw generator args
 * directly) matters for structural shapes: decode turns raw values into real
 * linked-list/tree node objects, which is what solve() actually operates on —
 * exactly mirroring what a real user's parsed-from-stdin program receives.
 */

import { getShape, serializeLinkedList, serializeTree } from './dsaIOShapes.js';
import { REQUIRED_TEST_COUNT, MIN_EDGE_CASES } from './dsaConstants.js';

function prettyValue(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return `[${v.map(prettyValue).join(',')}]`;
  if (v === null || v === undefined) return 'null';
  return String(v);
}

/** solve() returns real linked-list/tree node objects for structural shapes — serialize
 * them back to plain values before the example display formatter ever sees them. */
function toDisplayValue(spec, result) {
  const outputType = spec.shapeConfig?.outputType;
  if (spec.shape === 'linked_list_to_linked_list' && outputType === 'list') return serializeLinkedList(result);
  if (spec.shape === 'binary_tree_to_value_or_array_or_tree' && outputType === 'tree') return serializeTree(result);
  return result;
}

/**
 * Scales size knobs up for "stress" cases. Combinatorial shapes (output size grows
 * exponentially with N, e.g. unordered_listing's subsets/permutations) must NOT get the
 * same multiplier as linear shapes — a 6x bump there turns N=5 into N=30 and a 2^30-line
 * "expected output" that blows past MongoDB's 16MB document cap and never finishes computing.
 */
function stressConfig(cfg, shapeId) {
  const scaled = { ...cfg };
  if (shapeId === 'unordered_listing') {
    if (typeof scaled.maxN === 'number') scaled.maxN = Math.min(scaled.maxN + 2, 12);
    return scaled;
  }
  for (const key of ['maxN', 'maxNodes', 'maxRows', 'maxCols', 'maxEdges', 'maxLen']) {
    if (typeof scaled[key] === 'number') scaled[key] = Math.min(scaled[key] * 6, 1000);
  }
  return scaled;
}

/**
 * Builds one case from raw generator args. Throws with a descriptive message
 * (including the offending stdin) if solve()/encode()/decode()/format() disagree —
 * this is the "does the algorithm actually work" gate.
 */
function makeCase(spec, shape, cfg, rawArgs, kind, isSample) {
  let stdin;
  let decoded;
  let result;
  let expectedStdout;
  try {
    stdin = shape.encode(...rawArgs, cfg);
    decoded = shape.decode(stdin, cfg);
    result = spec.solve(...decoded);
    expectedStdout = shape.format(result, cfg);
  } catch (err) {
    throw new Error(
      `[${spec.legacyProblemName}] case build failed (kind=${kind}): ${err.message}\n  rawArgs=${JSON.stringify(rawArgs)}\n  stdin=${JSON.stringify(stdin)}`
    );
  }
  return { rawArgs, result, stdin, expectedStdout, kind, isSample };
}

export function buildCasesForSpec(spec, rng) {
  const shape = getShape(spec.shape);
  const cfg = spec.shapeConfig || {};
  const gen = (cfgOverride) => (spec.genArgs ? spec.genArgs(rng, cfgOverride) : shape.gen(rng, cfgOverride));

  const cases = [];

  const sampleCount = spec.sampleCount ?? 2;
  for (let i = 0; i < sampleCount; i += 1) {
    cases.push(makeCase(spec, shape, cfg, gen(cfg), 'sample', true));
  }

  const curated = spec.edgeCases || [];
  for (const ec of curated) {
    cases.push(makeCase(spec, shape, cfg, ec.args, ec.kind || 'edge', false));
  }

  const edgeTarget = Math.max(MIN_EDGE_CASES, curated.length);
  let guard = 0;
  while (cases.filter((c) => c.kind === 'edge').length < edgeTarget && guard < 500) {
    cases.push(makeCase(spec, shape, cfg, gen(cfg), 'edge', false));
    guard += 1;
  }

  const stressCount = spec.stressCount ?? 2;
  const scaledCfg = stressConfig(cfg, spec.shape);
  for (let i = 0; i < stressCount; i += 1) {
    cases.push(makeCase(spec, shape, cfg, gen(scaledCfg), 'stress', false));
  }

  guard = 0;
  while (cases.length < REQUIRED_TEST_COUNT && guard < 2000) {
    cases.push(makeCase(spec, shape, cfg, gen(cfg), 'typical', false));
    guard += 1;
  }

  return cases.slice(0, REQUIRED_TEST_COUNT);
}

export function buildExamplesForSpec(spec, cases) {
  return cases
    .filter((c) => c.isSample)
    .map((c, i) => ({
      input: shape_pretty(spec, c.rawArgs),
      output: prettyValue(toDisplayValue(spec, c.result)),
      explanation: spec.exampleExplanation ? spec.exampleExplanation(c.rawArgs, c.result, i) : '',
    }));
}

function shape_pretty(spec, rawArgs) {
  const shape = getShape(spec.shape);
  return shape.pretty(rawArgs, spec.shapeConfig || {});
}

export function buildStarterForSpec(spec) {
  const shape = getShape(spec.shape);
  return shape.starter(spec.legacyProblemName, spec.shapeConfig || {});
}

/** Full assembly used by the seed script. */
export function buildProblemFromSpec(spec, rng) {
  const cases = buildCasesForSpec(spec, rng);
  const examples = buildExamplesForSpec(spec, cases);
  const starterCode = buildStarterForSpec(spec);
  return { cases, examples, starterCode };
}
