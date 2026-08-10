import { randInt, sample } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Subsets',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', maxN: 5 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, 0, cfg.maxN ?? 5);
      const pool = Array.from({ length: 20 }, (_, i) => i - 10);
      return [sample(rng, pool, n)];
    },
    statement:
      'Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets — each subset is printed with its elements in the order they appear in `nums`; the subsets themselves may be printed in any order.',
    constraints: '- `0 <= nums.length <= 10`\n- All elements of `nums` are unique.',
    inputFormat: 'Line 1: the array `nums`, space-separated (may be empty).',
    outputFormat: "One subset per line as comma-separated values (an empty line for the empty subset). Order of lines doesn't matter.",
    hints: [
      'There are exactly `2^n` subsets of an n-element set — including the empty set.',
      'Think of building the answer incrementally: for each new number, every existing subset can either include it or not.',
      "Start with just the empty subset, then for each element of `nums`, double the list of subsets built so far by appending that element to a copy of each.",
    ],
    solutionApproach:
      'Start with `[[]]` (just the empty subset). For each number in `nums`, take every subset built so far and add a copy of it with the new number appended — this doubles the subset count at each step, producing all `2^n` subsets in O(n * 2^n) time.',
    pythonSolutionCode:
      'def subsets(nums):\n    res = [[]]\n    for n in nums:\n        res += [s + [n] for s in res]\n    return res\n',
    solve: (nums) => {
      let res = [[]];
      for (const n of nums) {
        res = res.concat(res.map((subset) => [...subset, n]));
      }
      return res;
    },
    exampleExplanation: (args, result) => `The ${args[0].length}-element input has ${result.length} subsets in total, including the empty set.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[-1, 0, 1]], kind: 'edge' },
    ],
  },
];
