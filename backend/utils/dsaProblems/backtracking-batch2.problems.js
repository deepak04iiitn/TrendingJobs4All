import { randInt, randIntArray, sample } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Permutations',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minN: 1, maxN: 5 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 5);
      const pool = Array.from({ length: 21 }, (_, i) => i - 10);
      return [sample(rng, pool, n)];
    },
    statement:
      "Given an array `nums` of distinct integers, return all the possible permutations, in any order. A permutation is an arrangement of every element of `nums`, each used exactly once.",
    constraints: '- `1 <= nums.length <= 7`\n- All integers in `nums` are unique.\n- The set of permutations may be printed in any order.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'One permutation per line, comma-separated values. One line per distinct ordering; order of lines does not matter.',
    hints: [
      'With n distinct numbers there are exactly n! orderings — building each one position by position is far more direct than trying to enumerate swaps of the whole array.',
      "Think of filling an empty result array slot by slot: at each slot, you may place any number that hasn't been placed yet.",
      "Backtrack with a `path` array and a `used` boolean per index: mark an index used, append its value, recurse into the next slot, then undo (pop and unmark) before trying the next unused index.",
    ],
    solutionApproach:
      'Backtrack by building each permutation left to right. Keep a `path` array and a `used[]` boolean array the same length as `nums`. At each recursive call, loop over every index; skip ones already used, otherwise mark it used, push its value onto `path`, recurse, then pop and unmark before trying the next index. Once `path.length === nums.length`, record a copy. This visits exactly `n!` leaves in O(n * n!) time.',
    pythonSolutionCode:
      'def permute(nums):\n    res = []\n    used = [False] * len(nums)\n    path = []\n\n    def backtrack():\n        if len(path) == len(nums):\n            res.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack()\n            path.pop()\n            used[i] = False\n\n    backtrack()\n    return res\n',
    solve: (nums) => {
      const res = [];
      const used = new Array(nums.length).fill(false);
      const path = [];
      const backtrack = () => {
        if (path.length === nums.length) {
          res.push([...path]);
          return;
        }
        for (let i = 0; i < nums.length; i += 1) {
          if (used[i]) continue;
          used[i] = true;
          path.push(nums[i]);
          backtrack();
          path.pop();
          used[i] = false;
        }
      };
      backtrack();
      return res;
    },
    exampleExplanation: (args, result) => `The ${args[0].length}-element input has ${result.length} distinct permutation(s).`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[0, 1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[-1, 0, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Permutations II',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minN: 1, maxN: 5, min: -3, max: 3 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 5);
      return [randIntArray(rng, n, cfg.min ?? -3, cfg.max ?? 3)];
    },
    statement:
      'Given an array `nums` that may contain duplicate values, return all distinct permutations of it, in any order. Because values can repeat, some orderings of the raw array look identical once printed and must only be counted once.',
    constraints:
      '- `1 <= nums.length <= 7`\n- `-10 <= nums[i] <= 10`\n- `nums` may contain duplicate values.\n- The set of permutations may be printed in any order, and no duplicate permutation may appear twice.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'One distinct permutation per line, comma-separated values. Order of lines does not matter.',
    hints: [
      'The same slot-by-slot backtracking that generates all permutations of distinct numbers works here too, but used naively it will output the same ordering more than once whenever a value repeats.',
      'Sort the array first so equal values become adjacent — that makes it possible to recognize "I am about to place a duplicate of a value already tried at this exact branching point" and skip it.',
      'At a given recursion depth, skip index i if `nums[i] == nums[i-1]` and `nums[i-1]` is not currently used — that guarantees equal values are only ever placed in one fixed relative order among themselves.',
    ],
    solutionApproach:
      "Sort `nums` first. Backtrack exactly as for the no-duplicates version (a `used[]` array and a growing `path`), but before trying index i in the for-loop, skip it whenever `i > 0`, `nums[i] === nums[i-1]`, and `!used[i-1]`. This is the standard same-level duplicate skip: sorting guarantees equal values are adjacent, so only the first not-yet-used copy at each branching point is ever explored, which prunes away every duplicate permutation without generating a superset and de-duplicating it afterward.",
    pythonSolutionCode:
      'def permute_unique(nums):\n    nums = sorted(nums)\n    res = []\n    used = [False] * len(nums)\n    path = []\n\n    def backtrack():\n        if len(path) == len(nums):\n            res.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack()\n            path.pop()\n            used[i] = False\n\n    backtrack()\n    return res\n',
    solve: (nums) => {
      const arr = [...nums].sort((a, b) => a - b);
      const res = [];
      const used = new Array(arr.length).fill(false);
      const path = [];
      const backtrack = () => {
        if (path.length === arr.length) {
          res.push([...path]);
          return;
        }
        for (let i = 0; i < arr.length; i += 1) {
          if (used[i]) continue;
          if (i > 0 && arr[i] === arr[i - 1] && !used[i - 1]) continue;
          used[i] = true;
          path.push(arr[i]);
          backtrack();
          path.pop();
          used[i] = false;
        }
      };
      backtrack();
      return res;
    },
    exampleExplanation: (args, result) => {
      const n = args[0].length;
      return `The ${n}-element input has ${result.length} distinct permutation(s) once duplicate orderings are removed.`;
    },
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 1, 2]], kind: 'edge' },
      { args: [[2, 2, 2]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[0, -1, -1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Combinations',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', maxN: 7 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, 1, cfg.maxN ?? 7);
      const k = randInt(rng, 1, n);
      return [[n, k]];
    },
    statement:
      "Given two integers `n` and `k`, return every possible combination of `k` distinct numbers chosen from the range `[1, n]`. A combination is an unordered selection, so `[1,2]` and `[2,1]` are the same combination and must only appear once.\n\nBecause this judge feeds every problem through a single input line, `n` and `k` are packed together on that line: **the first number is `n`, and the second is `k`.**",
    constraints: '- `1 <= n <= 9`\n- `1 <= k <= n`\n- Each combination is printed with its values in ascending order; combinations may be printed in any order and none may repeat.',
    inputFormat: 'Line 1: two space-separated integers, `n` then `k`.',
    outputFormat: 'One combination per line, its `k` values comma-separated in ascending order. Order of lines does not matter.',
    hints: [
      'This is choosing an unordered subset of size k from {1, ..., n} — think of scanning the numbers 1 through n in increasing order and deciding, one at a time, whether the current number joins the combination.',
      'To make sure the same combination is never produced twice in a different order, only ever let the next chosen number be strictly greater than the last one you picked.',
      'Backtrack with a `start` pointer that only moves forward: at each call, try every value from `start` up to `n`, push it, recurse with `start = value + 1`, then pop. Record the path once it reaches length `k`.',
    ],
    solutionApproach:
      'Backtrack over `1..n` in increasing order using a `start` index that only ever advances. At each call, loop `i` from `start` to `n`: push `i` onto `path`, recurse with `start = i + 1`, then pop. Whenever `path.length === k`, record a copy. Because `i` only increases, every recorded path is already ascending and no combination is ever produced twice — the recursion visits exactly `C(n, k)` leaves.',
    pythonSolutionCode:
      'def combine(n, k):\n    res = []\n    path = []\n\n    def backtrack(start):\n        if len(path) == k:\n            res.append(path[:])\n            return\n        for i in range(start, n + 1):\n            path.append(i)\n            backtrack(i + 1)\n            path.pop()\n\n    backtrack(1)\n    return res\n',
    solve: (arr) => {
      const [n, k] = arr;
      const res = [];
      const path = [];
      const backtrack = (start) => {
        if (path.length === k) {
          res.push([...path]);
          return;
        }
        for (let i = start; i <= n; i += 1) {
          path.push(i);
          backtrack(i + 1);
          path.pop();
        }
      };
      backtrack(1);
      return res;
    },
    exampleExplanation: (args, result) => {
      const [n, k] = args[0];
      return `Choosing ${k} number(s) out of 1..${n} yields ${result.length} combination(s).`;
    },
    edgeCases: [
      { args: [[1, 1]], kind: 'edge' },
      { args: [[4, 4]], kind: 'edge' },
      { args: [[4, 1]], kind: 'edge' },
      { args: [[4, 2]], kind: 'edge' },
      { args: [[5, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Combination Sum',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minCandidates: 2, maxCandidates: 4, minTarget: 4, maxTarget: 14 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const count = randInt(rng, cfg.minCandidates ?? 2, cfg.maxCandidates ?? 4);
      const pool = Array.from({ length: 8 }, (_, i) => i + 2);
      const candidates = sample(rng, pool, count);
      const target = randInt(rng, cfg.minTarget ?? 4, cfg.maxTarget ?? 14);
      return [[target, ...candidates]];
    },
    statement:
      "Given an array of distinct positive integers `candidates` and a positive integer `target`, return every unique combination of numbers from `candidates` that sums exactly to `target`. Each number in `candidates` may be reused an unlimited number of times within one combination. Two combinations that use the same numbers the same number of times (just in a different order) count as one, so each is printed once with its values in non-decreasing order.\n\nBecause this judge feeds every problem through a single input line, `target` is packed together with `candidates` on that line: **the first number is `target`, and the rest (in order) are `candidates`.**",
    constraints:
      '- `2 <= candidates.length <= 4`\n- `2 <= candidates[i] <= 9`, all distinct\n- `1 <= target <= 14`\n- If no combination sums to `target`, print nothing.',
    inputFormat: 'Line 1: a single space-separated line — the first integer is `target`, followed by the array `candidates`.',
    outputFormat: 'One combination per line, comma-separated values in non-decreasing order. Order of lines does not matter; print nothing if none exist.',
    hints: [
      "Since a number can be reused, this isn't a plain subset-sum — the same candidate might appear several times inside one combination.",
      'Sort `candidates` first, then backtrack: at each step, either reuse the current candidate again or move on to the next one — never step backward to an earlier candidate, or the same combination gets produced in more than one order.',
      "Track the amount still needed. Record the combination when it hits exactly 0; if the next candidate already exceeds what's left, stop trying larger candidates at that branch (valid because the array is sorted).",
    ],
    solutionApproach:
      'Sort `candidates` ascending. Backtrack with `(start, remaining)`: loop `i` from `start` to the end; if `candidates[i] > remaining`, break (every later candidate is sorted to be at least as big, so none of them help either). Otherwise push `candidates[i]`, recurse with the *same* index `i` as the new start (this is what allows a candidate to be reused) and `remaining - candidates[i]`, then pop. Record the path whenever `remaining` reaches exactly `0`. Never moving `i` backward is what prevents the same multiset of numbers from being recorded in more than one order.',
    pythonSolutionCode:
      'def combination_sum(candidates, target):\n    candidates = sorted(candidates)\n    res = []\n    path = []\n\n    def backtrack(start, remaining):\n        if remaining == 0:\n            res.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:\n                break\n            path.append(candidates[i])\n            backtrack(i, remaining - candidates[i])\n            path.pop()\n\n    backtrack(0, target)\n    return res\n',
    solve: (arr) => {
      const target = arr[0];
      const candidates = [...arr.slice(1)].sort((a, b) => a - b);
      const res = [];
      const path = [];
      const backtrack = (start, remaining) => {
        if (remaining === 0) {
          res.push([...path]);
          return;
        }
        for (let i = start; i < candidates.length; i += 1) {
          if (candidates[i] > remaining) break;
          path.push(candidates[i]);
          backtrack(i, remaining - candidates[i]);
          path.pop();
        }
      };
      backtrack(0, target);
      return res;
    },
    exampleExplanation: (args, result) => {
      const [target, ...candidates] = args[0];
      return result.length
        ? `${result.length} combination(s) of [${candidates.join(',')}] (numbers reusable) sum to ${target}.`
        : `No combination of [${candidates.join(',')}] sums to ${target}.`;
    },
    edgeCases: [
      { args: [[5, 5]], kind: 'edge' },
      { args: [[3, 5]], kind: 'edge' },
      { args: [[7, 2, 3, 6, 7]], kind: 'edge' },
      { args: [[8, 2, 3, 5]], kind: 'edge' },
      { args: [[2, 2]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Combination Sum II',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minN: 3, maxN: 7, min: 1, max: 8, minTarget: 3, maxTarget: 14 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 3, cfg.maxN ?? 7);
      const candidates = randIntArray(rng, n, cfg.min ?? 1, cfg.max ?? 8);
      const target = randInt(rng, cfg.minTarget ?? 3, cfg.maxTarget ?? 14);
      return [[target, ...candidates]];
    },
    statement:
      "Given an array `candidates` that may contain duplicate values and a positive integer `target`, return every unique combination of numbers from `candidates` that sums exactly to `target`. Each element of `candidates` may be used **at most once per combination** (two equal-valued elements sitting at different positions are still two separate usable elements). No combination may be printed more than once.\n\nBecause this judge feeds every problem through a single input line, `target` is packed together with `candidates` on that line: **the first number is `target`, and the rest (in order) are `candidates`.**",
    constraints:
      '- `3 <= candidates.length <= 7`\n- `1 <= candidates[i] <= 8`\n- `1 <= target <= 14`\n- `candidates` may contain duplicate values.\n- If no combination sums to `target`, print nothing.',
    inputFormat: 'Line 1: a single space-separated line — the first integer is `target`, followed by the array `candidates`.',
    outputFormat: 'One combination per line, comma-separated values in non-decreasing order. Order of lines does not matter; print nothing if none exist.',
    hints: [
      'This looks like Combination Sum, but each element can now be used at most once — and duplicate values in the input create a new failure mode: naive backtracking will print the exact same combination twice.',
      'Sort `candidates` first. When choosing the next element, only move to a later index than the one you just used (no reuse) — but at the *same* recursion depth, skip a candidate whose value equals the one you just tried and rejected at that same depth.',
      'The precise skip rule: while looping an index `i > start` at a given depth, skip it if `candidates[i] == candidates[i-1]` — you already explored every combination that starts with that value at this depth via the earlier index.',
    ],
    solutionApproach:
      'Sort `candidates` ascending. Backtrack with `(start, remaining)`: loop `i` from `start` to the end, skipping `i` whenever `i > start` and `candidates[i] === candidates[i-1]` (this avoids two equal-valued elements at the same branching level producing the same combination twice); break once `candidates[i] > remaining` (sorted, so nothing later helps either). Otherwise push `candidates[i]`, recurse with `start = i + 1` (each element usable at most once) and `remaining - candidates[i]`, then pop. Record the path whenever `remaining` reaches `0`.',
    pythonSolutionCode:
      'def combination_sum2(candidates, target):\n    candidates = sorted(candidates)\n    res = []\n    path = []\n\n    def backtrack(start, remaining):\n        if remaining == 0:\n            res.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if i > start and candidates[i] == candidates[i - 1]:\n                continue\n            if candidates[i] > remaining:\n                break\n            path.append(candidates[i])\n            backtrack(i + 1, remaining - candidates[i])\n            path.pop()\n\n    backtrack(0, target)\n    return res\n',
    solve: (arr) => {
      const target = arr[0];
      const candidates = [...arr.slice(1)].sort((a, b) => a - b);
      const res = [];
      const path = [];
      const backtrack = (start, remaining) => {
        if (remaining === 0) {
          res.push([...path]);
          return;
        }
        for (let i = start; i < candidates.length; i += 1) {
          if (i > start && candidates[i] === candidates[i - 1]) continue;
          if (candidates[i] > remaining) break;
          path.push(candidates[i]);
          backtrack(i + 1, remaining - candidates[i]);
          path.pop();
        }
      };
      backtrack(0, target);
      return res;
    },
    exampleExplanation: (args, result) => {
      const [target, ...candidates] = args[0];
      return result.length
        ? `${result.length} unique combination(s) of [${candidates.join(',')}] (each number used at most once) sum to ${target}.`
        : `No combination of [${candidates.join(',')}] sums to ${target}.`;
    },
    edgeCases: [
      { args: [[8, 10, 1, 2, 7, 6, 1, 5]], kind: 'edge' },
      { args: [[5, 2, 5, 2, 1, 2]], kind: 'edge' },
      { args: [[3, 3, 3, 3]], kind: 'edge' },
      { args: [[2, 1, 1, 1, 1]], kind: 'edge' },
      { args: [[3, 5, 6, 5]], kind: 'edge' },
      { args: [[1, 4, 4, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Subsets II',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minN: 0, maxN: 5, min: -5, max: 5 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 5);
      return [randIntArray(rng, n, cfg.min ?? -5, cfg.max ?? 5)];
    },
    statement:
      'Given an integer array `nums` that may contain duplicate values, return all possible subsets (the power set) without printing any duplicate subset. Each subset is printed with its elements in non-decreasing order; the subsets themselves may be printed in any order.',
    constraints:
      '- `0 <= nums.length <= 7`\n- `-5 <= nums[i] <= 5`\n- `nums` may contain duplicate values.\n- No duplicate subset may be printed; the empty subset always counts as one of them.',
    inputFormat: 'Line 1: the array `nums`, space-separated (may be empty).',
    outputFormat: "One subset per line as comma-separated values (an empty line for the empty subset). Order of lines doesn't matter.",
    hints: [
      "The plain Subsets trick of doubling the list at each step breaks down here — with duplicate values it happily produces duplicate subsets too.",
      'Sort `nums` first so equal values sit next to each other, then build subsets with backtracking instead of the doubling trick.',
      "At each recursion depth, when deciding whether to include the next number, skip it if it equals the previous number you just considered *at that same depth* — that earlier branch already produced every subset that includes a copy of it starting here.",
    ],
    solutionApproach:
      'Sort `nums`. Backtrack with a `start` index and record the current `path` as a subset immediately on entering every call (this is what naturally produces every prefix, including the empty one at the very start). Then loop `i` from `start` to the end, skipping `i` whenever `i > start` and `nums[i] === nums[i-1]` — the same-level duplicate skip, valid because sorting puts equal values adjacent so only the first unused copy at each branching point needs to be tried. Otherwise push `nums[i]`, recurse with `start = i + 1`, then pop. O(n * 2^n) time in the worst case.',
    pythonSolutionCode:
      'def subsets_with_dup(nums):\n    nums = sorted(nums)\n    res = []\n    path = []\n\n    def backtrack(start):\n        res.append(path[:])\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i - 1]:\n                continue\n            path.append(nums[i])\n            backtrack(i + 1)\n            path.pop()\n\n    backtrack(0)\n    return res\n',
    solve: (nums) => {
      const arr = [...nums].sort((a, b) => a - b);
      const res = [];
      const path = [];
      const backtrack = (start) => {
        res.push([...path]);
        for (let i = start; i < arr.length; i += 1) {
          if (i > start && arr[i] === arr[i - 1]) continue;
          path.push(arr[i]);
          backtrack(i + 1);
          path.pop();
        }
      };
      backtrack(0);
      return res;
    },
    exampleExplanation: (args, result) =>
      `The ${args[0].length}-element input (with possible duplicates) has ${result.length} unique subset(s), including the empty set.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 2, 2]], kind: 'edge' },
      { args: [[4, 4, 4, 1, 4]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
    ],
  },
];
