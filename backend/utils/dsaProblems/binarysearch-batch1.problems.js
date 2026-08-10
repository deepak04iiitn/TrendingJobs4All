import { randInt, tokInts, linesOf, formatByType, SHAPES } from '../dsaIOShapes.js';

/**
 * "Search a 2D Matrix" and "Search a 2D Matrix II" both need a matrix *and* a
 * separate target integer as independent inputs, which no shape in the shared
 * catalog provides (the closest, `matrix_to_value_or_matrix`, only carries a
 * single matrix). Per the guide's "bespoke: you own everything" allowance —
 * following the precedent set in `backtracking-batch3.problems.js` for
 * `bt_board_and_word` — we register one small, self-contained shape onto the
 * shared registry (`SHAPES` is a plain exported object, not frozen). It's
 * namespaced `bs_matrix_and_target` so it can't collide with the shared
 * catalog or any other authoring batch's shapes. This is a runtime side
 * effect of importing this module only; it edits no file on disk, and only
 * matters at authoring/seed time (grading later reads pre-computed
 * stdin/expectedStdout from the DB and never calls getShape() again).
 */
SHAPES.bs_matrix_and_target = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const [rows, cols] = tokInts(L[0]);
    const matrix = [];
    for (let r = 0; r < rows; r += 1) matrix.push(tokInts(L[1 + r]).slice(0, cols));
    const target = Number(L[1 + rows] || 0);
    return [matrix, target];
  },
  encode: (matrix, target) => `${matrix.length} ${matrix[0]?.length || 0}\n${matrix.map((r) => r.join(' ')).join('\n')}\n${target}`,
  gen: (rng, cfg = {}) => {
    const rows = randInt(rng, cfg.minRows ?? 1, Math.min(cfg.maxRows ?? 4, 8));
    const cols = randInt(rng, cfg.minCols ?? 1, Math.min(cfg.maxCols ?? 4, 8));
    const matrix = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => r * cols + c)
    );
    const target = matrix[randInt(rng, 0, rows - 1)][randInt(rng, 0, cols - 1)];
    return [matrix, target];
  },
  format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'bool'),
  pretty: (args) => `matrix = [${args[0].map((r) => `[${r.join(',')}]`).join(', ')}], target = ${args[1]}`,
  starter: (title) =>
    genericStarterFor(
      title,
      'Line 1 is "rows cols"; next `rows` lines are the matrix rows (space-separated ints); the final line is the target integer.'
    ),
};

/** Local copy of dsaIOShapes.js's genericStarter (not exported there) — same shape, own name to avoid import churn. */
function genericStarterFor(title, formatNote) {
  const langs = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'csharp', 'ruby'];
  const out = {};
  for (const lang of langs) {
    const commentStyle = lang === 'python' || lang === 'ruby' ? '#' : lang === 'c' ? '/*' : '//';
    const line =
      commentStyle === '/*' ? `/* TODO: Implement ${title}. ${formatNote} */` : `${commentStyle} TODO: Implement ${title}. ${formatNote}`;
    out[lang] = `${line}\n`;
  }
  return out;
}

/** Shared "lower bound" helper: first index i such that arr[i] >= x (or arr.length if none). */
function lowerBound(arr, x) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export default [
  {
    legacyProblemName: 'Binary Search',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 20, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const min = cfg.min ?? -1000;
      const max = cfg.max ?? 1000;
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 20);
      const set = new Set();
      let guard = 0;
      while (set.size < n && guard < n * 50 + 200) {
        set.add(randInt(rng, min, max));
        guard += 1;
      }
      const arr = [...set].sort((a, b) => a - b);
      let target;
      if (rng() < 0.5 && arr.length) {
        target = arr[randInt(rng, 0, arr.length - 1)];
      } else {
        let tries = 0;
        do {
          target = randInt(rng, min - 5, max + 5);
          tries += 1;
        } while (set.has(target) && tries < 30);
      }
      return [arr, target];
    },
    statement:
      "You are given an array `nums` sorted in ascending order (all values distinct) and an integer `target`. Return the index of `target` in `nums`, or `-1` if it is not present.\n\nA linear scan solves this in `O(n)`, but the sorted order lets you do far better — your solution should run in `O(log n)` time.",
    constraints: '- `1 <= nums.length <= 10^4`\n- `-10^4 <= nums[i] <= 10^4`, all distinct\n- `nums` is sorted in ascending order\n- `-10^4 <= target <= 10^4`',
    inputFormat: 'Line 1: the sorted array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the index of `target`, or `-1` if it does not occur.',
    hints: [
      "A linear scan works but throws away the fact the array is sorted — sorting means you can eliminate half the remaining candidates with a single comparison.",
      "Compare `target` to the middle element: if `target` is smaller, any match must be to the left; if larger, it must be to the right.",
      "Maintain a `lo`/`hi` window and shrink it by half each step until it's empty or you land exactly on `target` — that's O(log n).",
    ],
    solutionApproach:
      'Classic binary search: maintain `lo` and `hi` bounds over the sorted array. At each step, look at the middle element — if it equals `target` you are done; if it is less than `target`, discard the left half (`lo = mid + 1`); otherwise discard the right half (`hi = mid - 1`). Repeat until the window is empty, returning `-1`. O(log n) time, O(1) space.',
    pythonSolutionCode:
      'def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n',
    solve: (nums, target) => {
      let lo = 0;
      let hi = nums.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
      return -1;
    },
    exampleExplanation: (args, result) =>
      result === -1
        ? `${args[1]} does not appear in the sorted array, so we return -1.`
        : `Binary search lands on index ${result}, where nums[${result}] = ${args[1]}.`,
    edgeCases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], kind: 'edge' },
      { args: [[-1, 0, 3, 5, 9, 12], 2], kind: 'edge' },
      { args: [[5], 5], kind: 'edge' },
      { args: [[5], -5], kind: 'edge' },
      { args: [[-1000, -500, 0, 500, 1000], -1000], kind: 'edge' },
      { args: [[-1000, -500, 0, 500, 1000], 1000], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find First and Last Position of Element',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'indexPair', minN: 0, maxN: 20, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const min = cfg.min ?? -50;
      const max = cfg.max ?? 50;
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 20);
      const arr = Array.from({ length: n }, () => randInt(rng, min, max)).sort((a, b) => a - b);
      let target;
      if (rng() < 0.5 && arr.length) {
        target = arr[randInt(rng, 0, arr.length - 1)];
      } else {
        let tries = 0;
        const set = new Set(arr);
        do {
          target = randInt(rng, min - 5, max + 5);
          tries += 1;
        } while (set.has(target) && tries < 30);
      }
      return [arr, target];
    },
    statement:
      "Given an array `nums` sorted in non-decreasing order and an integer `target`, find the starting and ending index of `target` in the array.\n\nIf `target` does not appear in `nums`, return `[-1, -1]`. Your solution should run in `O(log n)` time.",
    constraints:
      '- `0 <= nums.length <= 10^5`\n- `-10^9 <= nums[i], target <= 10^9`\n- `nums` is sorted in non-decreasing order (duplicate values are allowed).',
    inputFormat: 'Line 1: the sorted array `nums`, space-separated (may be empty). Line 2: the integer `target`.',
    outputFormat: 'Two integers, space-separated: the first and last index of `target` (or `-1 -1` if absent).',
    hints: [
      'A single linear scan finds both ends in O(n) — but sorted order means you can do this with two binary searches instead.',
      "One binary search finds the leftmost position where `target` could be inserted (its first occurrence, if any). A very similar search for `target + 1` gives you one-past its last occurrence.",
      "After finding that leftmost insertion point, you still have to check whether the array actually holds `target` there — otherwise the answer is `[-1, -1]`.",
    ],
    solutionApproach:
      "Run a 'lower bound' binary search for `target` to get the first index where it could occur, and another lower-bound search for `target + 1` to get one index past its last occurrence. If the first index is out of range or `nums[first] != target`, there is no occurrence and the answer is `[-1, -1]`; otherwise the answer is `[first, lastBoundIndex - 1]`. O(log n) time, two binary searches.",
    pythonSolutionCode:
      'def search_range(nums, target):\n    def lower_bound(x):\n        lo, hi = 0, len(nums)\n        while lo < hi:\n            mid = (lo + hi) // 2\n            if nums[mid] < x:\n                lo = mid + 1\n            else:\n                hi = mid\n        return lo\n\n    first = lower_bound(target)\n    if first == len(nums) or nums[first] != target:\n        return [-1, -1]\n    last = lower_bound(target + 1) - 1\n    return [first, last]\n',
    solve: (nums, target) => {
      const first = lowerBound(nums, target);
      if (first === nums.length || nums[first] !== target) return [-1, -1];
      const last = lowerBound(nums, target + 1) - 1;
      return [first, last];
    },
    exampleExplanation: (args, result) =>
      result[0] === -1
        ? `${args[1]} never appears in the array.`
        : `${args[1]} first appears at index ${result[0]} and last appears at index ${result[1]}.`,
    edgeCases: [
      { args: [[5, 7, 7, 8, 8, 10], 8], kind: 'edge' },
      { args: [[5, 7, 7, 8, 8, 10], 6], kind: 'edge' },
      { args: [[], 0], kind: 'edge' },
      { args: [[2, 2, 2, 2], 2], kind: 'edge' },
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 3], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Search Insert Position',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 0, maxN: 20, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const min = cfg.min ?? -50;
      const max = cfg.max ?? 50;
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 20);
      const set = new Set();
      let guard = 0;
      while (set.size < n && guard < n * 50 + 200) {
        set.add(randInt(rng, min, max));
        guard += 1;
      }
      const arr = [...set].sort((a, b) => a - b);
      const target = randInt(rng, min - 5, max + 5);
      return [arr, target];
    },
    statement:
      "Given a sorted array of distinct integers `nums` and an integer `target`, return the index at which `target` is found. If `target` is not in the array, return the index where it would be inserted to keep `nums` sorted.\n\nYour algorithm should run in `O(log n)` time.",
    constraints: '- `0 <= nums.length <= 10^4`\n- `-10^4 <= nums[i], target <= 10^4`\n- `nums` is sorted ascending, all values distinct.',
    inputFormat: 'Line 1: the sorted array `nums`, space-separated (may be empty). Line 2: the integer `target`.',
    outputFormat: 'A single integer: the index of `target`, or its correct insertion index.',
    hints: [
      'This is really "binary search, but instead of giving up on a miss, tell me where it *would* go".',
      'Search for the first position whose value is greater than or equal to `target` — that position is always the right answer, whether or not `target` is actually present.',
      "If `target` is larger than every element, the loop naturally lands one past the end of the array — no special-casing needed.",
    ],
    solutionApproach:
      "This is exactly a 'lower bound' binary search: find the leftmost index `i` such that `nums[i] >= target`. If `target` exists, that index holds it; if not, that index is precisely where it should be inserted (including `nums.length` if `target` exceeds every element). O(log n) time, O(1) space.",
    pythonSolutionCode:
      'def search_insert(nums, target):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n',
    solve: (nums, target) => lowerBound(nums, target),
    exampleExplanation: (args, result) =>
      result < args[0].length && args[0][result] === args[1]
        ? `${args[1]} is already present at index ${result}.`
        : `${args[1]} is not present, so it would be inserted at index ${result} to keep the array sorted.`,
    edgeCases: [
      { args: [[], 5], kind: 'edge' },
      { args: [[1, 3, 5, 6], 5], kind: 'edge' },
      { args: [[1, 3, 5, 6], 2], kind: 'edge' },
      { args: [[1, 3, 5, 6], 7], kind: 'edge' },
      { args: [[1, 3, 5, 6], 0], kind: 'edge' },
      { args: [[1], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sqrt(x)',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 2147483647 },
    genArgs: (rng, cfg) => {
      const max = cfg.max ?? 2147483647;
      if (rng() < 0.4) {
        const maxRoot = Math.floor(Math.sqrt(max));
        const k = randInt(rng, 0, maxRoot);
        return [k * k];
      }
      return [randInt(rng, cfg.min ?? 0, max)];
    },
    statement:
      "Given a non-negative integer `x`, return the integer square root of `x` — that is, `floor(sqrt(x))`, computed without relying on a built-in power/sqrt call to skip the algorithm.",
    constraints: '- `0 <= x <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `x`.',
    outputFormat: 'A single integer: `floor(sqrt(x))`.',
    hints: [
      'The answer is some integer between 0 and x — and whether `k*k <= x` holds is true for small `k` and false for large `k`, flipping exactly once. That monotonic flip is a strong signal for binary search.',
      'Binary search over candidate answers: at each midpoint `mid`, check whether `mid*mid <= x`.',
      "If `mid*mid <= x`, `mid` is a valid (possibly not maximal) answer — record it and search the right half for something bigger; otherwise search the left half.",
    ],
    solutionApproach:
      'Binary search the answer space `[0, x]`. For a midpoint `mid`, if `mid*mid <= x` it is a valid candidate for the floor square root, so remember it and push the search window right (`lo = mid + 1`) to look for a larger valid candidate; otherwise `mid` overshoots and we push left (`hi = mid - 1`). The last recorded valid candidate is the answer. O(log x) time, O(1) space.',
    pythonSolutionCode:
      'def my_sqrt(x):\n    if x < 2:\n        return x\n    lo, hi, ans = 1, x, 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if mid * mid <= x:\n            ans = mid\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return ans\n',
    solve: (x) => {
      if (x < 2) return x;
      let lo = 1;
      let hi = x;
      let ans = 1;
      while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (mid * mid <= x) {
          ans = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return ans;
    },
    exampleExplanation: (args, result) => `${result}^2 = ${result * result} <= ${args[0]} < ${(result + 1) * (result + 1)} = ${result + 1}^2, so floor(sqrt(${args[0]})) = ${result}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [8], kind: 'edge' },
      { args: [2147483647], kind: 'edge' },
      { args: [2147395600], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Perfect Square',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: 1, max: 2147483647 },
    genArgs: (rng, cfg) => {
      const max = cfg.max ?? 2147483647;
      const min = cfg.min ?? 1;
      if (rng() < 0.5) {
        const maxRoot = Math.floor(Math.sqrt(max));
        const k = randInt(rng, 1, maxRoot);
        return [k * k];
      }
      return [randInt(rng, min, max)];
    },
    statement:
      'Given a positive integer `num`, return `true` if `num` is a perfect square — that is, there exists an integer `k` such that `k * k == num` — and `false` otherwise. Do not use a built-in square-root function to bypass the check.',
    constraints: '- `1 <= num <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `num`.',
    outputFormat: '`true` or `false`.',
    hints: [
      "This is the same shape as computing an integer square root — you just need to check whether the exact root exists.",
      "Binary search for `k` in `[1, num]` such that `k*k == num`, narrowing the window based on whether `k*k` is too small or too large.",
      "If the binary search window closes without ever hitting `k*k == num` exactly, `num` is not a perfect square.",
    ],
    solutionApproach:
      'Binary search over candidate roots `k` in `[1, num]`. Compare `k*k` to `num`: if equal, `num` is a perfect square; if `k*k` is smaller, search the right half; otherwise search the left half. Return `false` once the window closes without an exact match. O(log num) time, O(1) space.',
    pythonSolutionCode:
      'def is_perfect_square(num):\n    lo, hi = 1, num\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        sq = mid * mid\n        if sq == num:\n            return True\n        if sq < num:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return False\n',
    solve: (num) => {
      let lo = 1;
      let hi = num;
      while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        const sq = mid * mid;
        if (sq === num) return true;
        if (sq < num) lo = mid + 1;
        else hi = mid - 1;
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result ? `${args[0]} is a perfect square (its integer square root squares back to it exactly).` : `${args[0]} is not a perfect square.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [14], kind: 'edge' },
      { args: [2147483647], kind: 'edge' },
      { args: [2147395600], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Search a 2D Matrix',
    shape: 'bs_matrix_and_target',
    shapeConfig: { outputType: 'bool', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const rows = randInt(rng, cfg.minRows ?? 1, Math.min(cfg.maxRows ?? 6, 8));
      const cols = randInt(rng, cfg.minCols ?? 1, Math.min(cfg.maxCols ?? 6, 8));
      const min = cfg.min ?? -1000;
      const max = cfg.max ?? 1000;
      const count = rows * cols;
      const set = new Set();
      let guard = 0;
      while (set.size < count && guard < count * 50 + 500) {
        set.add(randInt(rng, min, max));
        guard += 1;
      }
      const values = [...set].sort((a, b) => a - b);
      const matrix = [];
      for (let r = 0; r < rows; r += 1) matrix.push(values.slice(r * cols, r * cols + cols));
      let target;
      if (rng() < 0.5) {
        target = values[randInt(rng, 0, values.length - 1)];
      } else {
        let tries = 0;
        do {
          target = randInt(rng, min - 10, max + 10);
          tries += 1;
        } while (set.has(target) && tries < 30);
      }
      return [matrix, target];
    },
    statement:
      'You are given an `m x n` integer matrix with two properties: each row is sorted in ascending order, and the first integer of each row is strictly greater than the last integer of the previous row (so reading the matrix row by row produces one long sorted sequence).\n\nGiven an integer `target`, return `true` if `target` is anywhere in the matrix, or `false` otherwise. Your solution should run in `O(log(m*n))` time.',
    constraints:
      '- `1 <= m, n <= 100`\n- `-10^4 <= matrix[i][j], target <= 10^4`\n- Each row is sorted ascending, and each row starts strictly after the previous row ends — the matrix is one sorted list split across rows.',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: each row, space-separated. Final line: the integer `target`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'The two properties together mean the whole matrix, read left-to-right then row-by-row, is really just one big sorted array wearing a disguise.',
      'You can binary search over a single flat index from `0` to `m*n - 1` without ever building that flat array.',
      'Convert a flat index `mid` back into matrix coordinates with `row = mid / n` and `col = mid % n` to read the actual cell value.',
    ],
    solutionApproach:
      'Treat the matrix as a single sorted array of length `m*n`. Binary search over flat indices `0..m*n-1`; for a candidate index `mid`, its row is `Math.floor(mid / n)` and its column is `mid % n`. Compare that cell against `target` and shrink the window exactly like standard binary search. O(log(m*n)) time, O(1) space.',
    pythonSolutionCode:
      'def search_matrix(matrix, target):\n    rows, cols = len(matrix), len(matrix[0]) if matrix else 0\n    if rows == 0 or cols == 0:\n        return False\n    lo, hi = 0, rows * cols - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        val = matrix[mid // cols][mid % cols]\n        if val == target:\n            return True\n        if val < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return False\n',
    solve: (matrix, target) => {
      const rows = matrix.length;
      const cols = matrix[0]?.length || 0;
      if (!rows || !cols) return false;
      let lo = 0;
      let hi = rows * cols - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const val = matrix[Math.floor(mid / cols)][mid % cols];
        if (val === target) return true;
        if (val < target) lo = mid + 1;
        else hi = mid - 1;
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result
        ? `${args[1]} is found in the matrix by treating it as one flat sorted array.`
        : `${args[1]} does not occur anywhere in the matrix.`,
    edgeCases: [
      { args: [[[1]], 1], kind: 'edge' },
      { args: [[[1]], 2], kind: 'edge' },
      {
        args: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          3,
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          13,
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          60,
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [-5, -3, -1],
            [0, 2, 4],
            [6, 8, 10],
          ],
          -3,
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Search a 2D Matrix II',
    shape: 'bs_matrix_and_target',
    shapeConfig: { outputType: 'bool', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: -100, max: 100 },
    genArgs: (rng, cfg) => {
      const rows = randInt(rng, cfg.minRows ?? 1, Math.min(cfg.maxRows ?? 6, 8));
      const cols = randInt(rng, cfg.minCols ?? 1, Math.min(cfg.maxCols ?? 6, 8));
      const base = cfg.min ?? -100;
      const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
      matrix[0][0] = randInt(rng, base, base + 5);
      for (let c = 1; c < cols; c += 1) matrix[0][c] = matrix[0][c - 1] + randInt(rng, 1, 5);
      for (let r = 1; r < rows; r += 1) matrix[r][0] = matrix[r - 1][0] + randInt(rng, 1, 5);
      for (let r = 1; r < rows; r += 1) {
        for (let c = 1; c < cols; c += 1) {
          const floor = Math.max(matrix[r - 1][c], matrix[r][c - 1]);
          matrix[r][c] = floor + randInt(rng, 1, 5);
        }
      }
      let target;
      const roll = rng();
      if (roll < 0.5) {
        target = matrix[randInt(rng, 0, rows - 1)][randInt(rng, 0, cols - 1)];
      } else if (roll < 0.75) {
        target = matrix[rows - 1][cols - 1] + randInt(rng, 1, 10);
      } else {
        target = matrix[0][0] - randInt(rng, 1, 10);
      }
      return [matrix, target];
    },
    statement:
      'You are given an `m x n` integer matrix in which every row is sorted in ascending order left to right, and every column is sorted in ascending order top to bottom. Unlike the fully-sorted variant, the last element of one row is **not** necessarily smaller than the first element of the next row.\n\nGiven an integer `target`, return `true` if it exists anywhere in the matrix, `false` otherwise.',
    constraints:
      '- `1 <= m, n <= 100`\n- `-10^5 <= matrix[i][j], target <= 10^5`\n- Every row is sorted ascending left to right; every column is sorted ascending top to bottom.',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: each row, space-separated. Final line: the integer `target`.',
    outputFormat: '`true` or `false`.',
    hints: [
      "You want to start the search from a corner where a single comparison lets you confidently throw away an entire row or an entire column — the top-left and bottom-right corners don't give you that guarantee, but the other two corners do.",
      "Start at the top-right corner: if that cell is bigger than `target`, every cell below it in the same column is even bigger, so drop the whole column (move left). If it's smaller, every cell to its left in the same row is even smaller, so drop the whole row (move down).",
      "This 'staircase search' throws away one row or one column per comparison, giving O(m + n) time — no need for anything fancier like per-row binary search.",
    ],
    solutionApproach:
      "Start at the top-right corner (row 0, last column). If the current cell equals `target`, return true. If it's larger than `target`, move one column left — everything further down that column is only larger. If it's smaller, move one row down — everything to the left in that row is only smaller. Stop (return false) once the pointer walks off the matrix. O(m + n) time, O(1) space.",
    pythonSolutionCode:
      'def search_matrix_ii(matrix, target):\n    rows, cols = len(matrix), len(matrix[0]) if matrix else 0\n    if rows == 0 or cols == 0:\n        return False\n    r, c = 0, cols - 1\n    while r < rows and c >= 0:\n        val = matrix[r][c]\n        if val == target:\n            return True\n        if val > target:\n            c -= 1\n        else:\n            r += 1\n    return False\n',
    solve: (matrix, target) => {
      const rows = matrix.length;
      const cols = matrix[0]?.length || 0;
      if (!rows || !cols) return false;
      let r = 0;
      let c = cols - 1;
      while (r < rows && c >= 0) {
        const val = matrix[r][c];
        if (val === target) return true;
        if (val > target) c -= 1;
        else r += 1;
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result
        ? `Starting from the top-right corner and stepping left/down finds ${args[1]} in the matrix.`
        : `Stepping left/down from the top-right corner walks off the matrix without ever landing on ${args[1]}.`,
    edgeCases: [
      { args: [[[1]], 1], kind: 'edge' },
      { args: [[[1]], 0], kind: 'edge' },
      {
        args: [
          [
            [1, 4, 7, 11, 15],
            [2, 5, 8, 12, 19],
            [3, 6, 9, 16, 22],
            [10, 13, 14, 17, 24],
            [18, 21, 23, 26, 30],
          ],
          5,
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [1, 4, 7, 11, 15],
            [2, 5, 8, 12, 19],
            [3, 6, 9, 16, 22],
            [10, 13, 14, 17, 24],
            [18, 21, 23, 26, 30],
          ],
          20,
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [-5, -3],
            [-4, -1],
          ],
          -4,
        ],
        kind: 'edge',
      },
      { args: [[[1, 4], [2, 5]], 5], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Median of Two Sorted Arrays',
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'float', minN: 0, maxN: 15, min: -1000, max: 1000 },
    comparisonMode: 'float',
    genArgs: (rng, cfg) => {
      const min = cfg.min ?? -1000;
      const max = cfg.max ?? 1000;
      const minN = cfg.minN ?? 0;
      const maxN = cfg.maxN ?? 15;
      let n1 = randInt(rng, minN, maxN);
      let n2 = randInt(rng, minN, maxN);
      if (n1 === 0 && n2 === 0) n2 = 1;
      const genSorted = (n) => Array.from({ length: n }, () => randInt(rng, min, max)).sort((a, b) => a - b);
      return [genSorted(n1), genSorted(n2)];
    },
    statement:
      'Given two sorted arrays `nums1` and `nums2` of sizes `m` and `n`, return the median of the combined, logically-merged sorted array formed from both.\n\nAt least one of the two arrays is non-empty. The overall run-time complexity should be `O(log(m + n))`.',
    constraints:
      '- `0 <= m, n`, and `m + n >= 1` (not both arrays empty)\n- `-10^6 <= nums1[i], nums2[i] <= 10^6`\n- Both `nums1` and `nums2` are individually sorted in ascending order.\n- Answers are accepted within a small floating-point tolerance (`comparisonMode: float`, epsilon `1e-4`).',
    inputFormat: 'Line 1: array `nums1`, space-separated (may be empty). Line 2: array `nums2`, space-separated (may be empty).',
    outputFormat: 'A single number (printed with 5 decimal places): the median of the merged array.',
    hints: [
      'Merging both arrays and reading off the middle works, but that is O(m + n) — the target complexity says there is a way to avoid ever fully merging them.',
      "The median splits the *combined* array into a left half and a right half of (almost) equal size. You need a partition point in each array such that every element left of both partitions is <= every element right of both partitions.",
      "Binary search the partition index in the smaller array; once you fix how many elements you take from it, the number you must take from the other array is forced by the total left-half size you need.",
    ],
    solutionApproach:
      "Binary search a partition index `i` in the smaller array (size `m`). The matching partition `j` in the other array (size `n`) is forced to `floor((m+n+1)/2) - i`, so the left half always has the right total count. Let `maxLeftA`/`minRightA` and `maxLeftB`/`minRightB` be the boundary elements around each partition (using +/-infinity past the array ends). If `maxLeftA <= minRightB` and `maxLeftB <= minRightA`, the partition is correct: for an odd total length the median is `max(maxLeftA, maxLeftB)`, for an even total it's the average of that max and `min(minRightA, minRightB)`. Otherwise, if `maxLeftA > minRightB` shrink the search window left, else shrink it right. O(log(min(m, n))) time, O(1) space.",
    pythonSolutionCode:
      'def find_median_sorted_arrays(nums1, nums2):\n    if len(nums1) > len(nums2):\n        nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    lo, hi = 0, m\n    half = (m + n + 1) // 2\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        max_left_a = float("-inf") if i == 0 else nums1[i - 1]\n        min_right_a = float("inf") if i == m else nums1[i]\n        max_left_b = float("-inf") if j == 0 else nums2[j - 1]\n        min_right_b = float("inf") if j == n else nums2[j]\n        if max_left_a <= min_right_b and max_left_b <= min_right_a:\n            if (m + n) % 2 == 0:\n                return (max(max_left_a, max_left_b) + min(min_right_a, min_right_b)) / 2.0\n            return float(max(max_left_a, max_left_b))\n        if max_left_a > min_right_b:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0.0\n',
    solve: (numsA, numsB) => {
      let nums1 = numsA;
      let nums2 = numsB;
      if (nums1.length > nums2.length) {
        const tmp = nums1;
        nums1 = nums2;
        nums2 = tmp;
      }
      const m = nums1.length;
      const n = nums2.length;
      let lo = 0;
      let hi = m;
      const half = Math.floor((m + n + 1) / 2);
      while (lo <= hi) {
        const i = (lo + hi) >> 1;
        const j = half - i;
        const maxLeftA = i === 0 ? -Infinity : nums1[i - 1];
        const minRightA = i === m ? Infinity : nums1[i];
        const maxLeftB = j === 0 ? -Infinity : nums2[j - 1];
        const minRightB = j === n ? Infinity : nums2[j];
        if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
          if ((m + n) % 2 === 0) return (Math.max(maxLeftA, maxLeftB) + Math.min(minRightA, minRightB)) / 2;
          return Math.max(maxLeftA, maxLeftB);
        }
        if (maxLeftA > minRightB) hi = i - 1;
        else lo = i + 1;
      }
      return 0;
    },
    exampleExplanation: (args, result) => `Merging [${args[0].join(',')}] and [${args[1].join(',')}] logically gives a combined sorted sequence whose median is ${result}.`,
    edgeCases: [
      { args: [[1, 3], [2]], kind: 'edge' },
      { args: [[1, 2], [3, 4]], kind: 'edge' },
      { args: [[], [1]], kind: 'edge' },
      { args: [[2], []], kind: 'edge' },
      { args: [[0, 0], [0, 0]], kind: 'edge' },
      { args: [[-5, -3, -1], [-4, -2, 0]], kind: 'edge' },
    ],
  },
];
