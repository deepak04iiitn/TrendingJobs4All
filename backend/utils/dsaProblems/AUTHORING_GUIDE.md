# DSA problem spec authoring guide

You are writing REAL, correct content for classic DSA interview problems for an
in-app LeetCode-style judge. Read `array.problems.js` and `design.problems.js` in
this same directory first — they are the canonical, working examples. Match their
exact structure and code style.

## Output

Write ONE new file: `backend/utils/dsaProblems/<assigned-filename>.problems.js`
(the exact filename is given in your task). It must `export default [...]` — an
array of problem spec objects, one per problem you were assigned, in the *exact*
format below. The file is auto-discovered (no other file needs editing).

## Spec object shape

```js
{
  legacyProblemName: 'Exact Title From Your Task List',   // MUST match verbatim — this is the DB join key
  shape: 'int_array_to_value',                             // see shape catalog below
  shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -100, max: 100 },
  comparisonMode: 'exact',                                 // optional: 'exact' (default) | 'float' | 'canonical-sort-lines'
  comparisonConfig: {},                                    // optional, e.g. { epsilon: 1e-4 } for 'float'
  genArgs: (rng, cfg) => [...],                             // OPTIONAL override of shape.gen — use when you need
                                                             // custom constraints (sorted input, distinct values,
                                                             // guaranteed-valid data, no self-loops, etc.)
  statement: 'Markdown. Real, accurate problem description — LeetCode-equivalent, not boilerplate.',
  constraints: '- bullet list of real constraints, markdown',
  inputFormat: 'One sentence describing the stdin layout.',
  outputFormat: 'One sentence describing the stdout layout.',
  hints: ['progressive hint 1', 'hint 2', 'hint 3'],        // >=2, real and specific to THIS problem, not generic
  solutionApproach: 'Markdown paragraph explaining the real algorithm and complexity.',
  pythonSolutionCode: 'def solve(...):\n    ...\n',          // REAL, CORRECT, runnable Python
  solve: (...decodedArgs) => result,                        // REAL, CORRECT JS reference algorithm — see below
  exampleExplanation: (rawArgs, result, i) => 'sentence using the actual values',  // optional but strongly preferred
  edgeCases: [{ args: [...], kind: 'edge' }, ...],           // 4-6 real, meaningful edge cases (see below)
}
```

## THE MOST IMPORTANT RULE: `solve()` receives DECODED args, not raw generator args

The pipeline is: `genArgs/gen` produces raw values → `shape.encode` turns them into
stdin text → `shape.decode` parses that stdin back into real objects → **`solve()`
is called on the decoded objects**, not the raw generator output.

For scalar/array/string shapes this is invisible (decode(encode(x)) === x), but for
**linked lists and binary trees it matters a lot**: `genArgs`/`edgeCases.args` and
`pretty()` all deal in raw arrays (e.g. `[values, pos]` for a list, `[valuesWithNulls]`
for a tree) — but `solve()` receives the *actual linked-list head node* / *actual
tree root node* (real `{val, next}` / `{val, left, right}` objects), because that's
what a real algorithm operates on. Write `solve(head)` / `solve(root)` accordingly,
walking `.next` / `.left` / `.right`. You do not need to build this conversion
yourself — the shared builder (`dsaProblemBuilder.js`) already does it — just make
sure your `solve()` signature expects the decoded/structural form.

If `solve()`'s result IS a linked-list or tree node (outputType `'list'`/`'tree'`),
that's fine and expected — the builder serializes it back for display automatically.

## Shape catalog (from `backend/utils/dsaIOShapes.js`) — pick the closest fit

| shape id | input args to `solve()` | typical `shapeConfig.outputType` |
|---|---|---|
| `int_to_int` | `(n)` | `int` \| `bool` \| `float` \| `string` |
| `int_array_to_value` | `(nums)` | `int` \| `bool` \| `float` \| `string` |
| `int_array_and_target_to_pair` | `(nums, target)` | `indexPair` (returns `[i,j]`) \| `bool` \| `int` |
| `int_array_to_int_array` | `(nums)` | (always an int array) |
| `two_int_arrays_to_value` | `(a, b)` | `int` \| `bool` \| `intArray` |
| `string_to_value` | `(s)` | `int` \| `bool` \| `string` |
| `string_to_string` | `(s)` | (always a string) |
| `two_strings_to_value` | `(a, b)` | `int` \| `bool` \| `string` |
| `string_array_to_value_or_array` | `(strs)` | `string` \| `stringArray` \| `int` |
| `matrix_to_value_or_matrix` | `(matrix)` — 2D int array | `int` \| `matrix` \| `bool` |
| `linked_list_to_linked_list` | `(head)` — real node, `cfg.hasCycle` builds a cycle internally | `list` \| `int` \| `bool` |
| `binary_tree_to_value_or_array_or_tree` | `(root)` — real node | `int` \| `array` \| `tree` \| `bool` |
| `graph_edge_list_to_value` | `(n, edges, ...extras)` — `edges` is `[[u,v],...]` | `int` \| `bool` |
| `graph_to_graph` | `(n, adjacencyList)` — for clone-graph-style problems | (result is an adjacency list, canonically serialized) |
| `intervals_to_intervals_or_value` | `(intervals)` — `[[s,e],...]` | `intervals` \| `int` |
| `k_and_array_to_value` | `(nums, k)` | `int` \| `array` |
| `unordered_listing` | `(nums)` or `(s)` or `(n)` per `cfg.inputKind: 'intArray'\|'string'\|'int'` | result is an ARRAY of results (subsets/permutations/etc); set `cfg.leafKind: 'array'\|'scalar'\|'board'`. **Always pair with `comparisonMode: 'canonical-sort-lines'`** since the outer list order is not canonical. |
| `stateful_ops` | `(ops)` — array of `{name, args}` | set `cfg.queryOps` isn't required by the shape itself, but your `solve()` must return an array of results **only for the ops that produce output**, in call order. Set `cfg.genOps: (rng) => [...]` to generate a valid random op sequence (see `design.problems.js`'s Min Stack for the pattern). |
| `bespoke` | you own everything | Only use this as a last resort (e.g. Serialize/Deserialize Binary Tree, where there's no fixed expected answer — grade it as a narrower fixed-format round trip instead of LeetCode's true open contract, and say so in the statement). |

## Known gotchas (each cost real bugs during pilot authoring — don't repeat them)

1. **Self-loops / degenerate random graphs**: the default `graph_edge_list_to_value.gen`
   can produce self-loop edges `[u,u]`. If your problem's real constraints forbid that
   (e.g. Course Schedule prerequisites never require a course to depend on itself),
   write a `genArgs` override that filters them out — see `graph.problems.js`.
2. **Never scale `unordered_listing`'s `maxN` aggressively for stress cases** — output
   size is exponential (2^n for subsets, n! for permutations). The shared builder
   already caps this shape's stress-scaling conservatively; just keep your own
   `shapeConfig.maxN` itself small (≤ 8-10) so even the capped stress case stays sane.
3. **Canonical tie-breaks**: if a problem has multiple valid correct answers (e.g.
   Course Schedule II's topological order, Longest Palindromic Substring's ties),
   your `solve()` picks ONE canonical answer deterministically, and you must say so
   in `constraints` (e.g. "if multiple valid orders exist, return the one produced by
   always advancing the lowest-indexed ready node") so users aren't confused when a
   differently-shaped-but-valid answer is marked wrong.
4. **Unordered results need `comparisonMode: 'canonical-sort-lines'`**, not just for
   `unordered_listing` — also plain multi-line array/interval outputs where order
   isn't canonical (e.g. 3Sum's triplets, Pacific Atlantic's coordinate pairs).
5. **Floats need `comparisonMode: 'float'`** (default epsilon 1e-4, override via
   `comparisonConfig: { epsilon: ... }`) — e.g. `Pow(x, n)`, `Median of Two Sorted Arrays`.
6. **`edgeCases[].args` are RAW generator-shaped args** (same shape `genArgs`/`gen`
   would return), not decoded objects — e.g. for linked lists, `{ args: [[1,2,3], -1] }`
   means values=`[1,2,3]`, cycle pos=`-1`. Look at `linkedList.problems.js` for the pattern.
7. **`Two Sum`-style guaranteed-valid inputs**: use the shape's own `gen()` when it
   already guarantees validity (e.g. `int_array_and_target_to_pair` guarantees a real
   pair exists) rather than fully random data that might have zero valid answers,
   unless the problem is fine with "no answer" as a valid case.

## Edge cases

Provide 4-6 REAL, meaningful edge cases per problem (empty input, single element,
all-duplicates, min/max boundary values, already-sorted, reverse-sorted, negative
numbers, the specific classic trap for that problem) — not filler. The builder
auto-fills the remaining slots up to the required 20 edge / 2 sample / ≥1 stress /
50 total with randomly generated cases, so you don't need to hit exact counts.

## Self-verification (DO THIS before finishing — it's fast and catches real bugs)

From the repo root, run:

```bash
cd backend && node -e "
import('./utils/dsaProblemBuilder.js').then(async ({ buildProblemFromSpec }) => {
  const { makeRng } = await import('./utils/dsaIOShapes.js');
  const { validateTestSuite } = await import('./utils/dsaConstants.js');
  const mod = await import('./utils/dsaProblems/<YOUR_FILE>.problems.js');
  let failed = 0;
  for (const spec of mod.default) {
    try {
      const rng = makeRng(spec.legacyProblemName + '::v1');
      const { cases, examples, starterCode } = buildProblemFromSpec(spec, rng);
      const v = validateTestSuite(cases.map(c => ({ caseKind: c.kind, isSample: c.isSample })));
      const ok = v.ok && examples.length >= 2 && Object.keys(starterCode).length === 9
        && examples.every(e => !String(e.output).includes('[object Object]'));
      console.log(ok ? 'OK  ' : 'FAIL', spec.legacyProblemName, JSON.stringify(v));
      if (!ok) failed++;
    } catch (e) { failed++; console.log('FAIL', spec.legacyProblemName, '->', e.message); }
  }
  console.log(failed === 0 ? 'ALL OK' : failed + ' FAILED');
});
"
```

Fix everything until it prints `ALL OK`. A thrown error almost always means either
(a) your `solve()` signature doesn't match what the shape's `decode()` actually
produces (see the "MOST IMPORTANT RULE" above), or (b) an `edgeCases` entry has the
wrong argument shape for your chosen `shape`.

## Tone for `statement`/`hints`/`solutionApproach`

Write like a real interview-prep platform, not a template: accurate problem
description in your own words (don't copy LeetCode's text verbatim — describe the
same problem accurately), hints that are genuinely progressive (nudge toward the
approach without giving it away on hint 1), and a solution explanation an
interview candidate would actually learn from.
