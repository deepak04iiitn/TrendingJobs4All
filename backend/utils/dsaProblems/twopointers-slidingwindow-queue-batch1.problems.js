import { randInt, randIntArray, shuffle, linesOf, tokInts, SHAPES } from '../dsaIOShapes.js';
import { defaultStarterCode } from '../dsaConstants.js';

/*
 * "4Sum" needs (array, target) -> list-of-quadruplets, which nothing in the shared
 * shape catalog provides (the closest built-ins pair an array+target with a single
 * scalar/pair result, or pair a bare array with a combinatorial listing that has no
 * `target`). Per the guide's "bespoke: you own everything" allowance — and following
 * the precedent set in recursion-batch1.problems.js — we register one small,
 * self-contained shape onto the shared registry (`SHAPES` is a plain exported object,
 * not frozen), namespaced to this batch so it can't collide with the shared catalog or
 * any other authoring batch.
 */
SHAPES.tpswqb1_array_and_target_to_quad_list = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    return [tokInts(L[0]), Number(L[1] || 0)];
  },
  encode: (arr, target) => `${arr.join(' ')}\n${target}`,
  gen: (rng, cfg = {}) => {
    const n = randInt(rng, cfg.minN ?? 4, cfg.maxN ?? 8);
    // Seed the array with one guaranteed quadruplet (target = its own sum) so most
    // generated cases have a real, non-empty answer to exercise, then fill the rest
    // of the array randomly and shuffle everything together.
    const quad = randIntArray(rng, 4, cfg.min ?? -15, cfg.max ?? 15);
    const target = quad.reduce((a, b) => a + b, 0);
    const rest = randIntArray(rng, Math.max(0, n - 4), cfg.min ?? -15, cfg.max ?? 15);
    const arr = shuffle(rng, [...quad, ...rest]);
    return [arr, target];
  },
  format: (result) => result.map((q) => q.join(',')).join('\n'),
  pretty: (args) => `nums = [${args[0].join(',')}], target = ${args[1]}`,
  starter: (title) => defaultStarterCode(title),
};

export default [
  {
    legacyProblemName: '3Sum Closest',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 3, maxN: 12, min: -1000, max: 1000 },
    statement:
      "Given an integer array `nums` and an integer `target`, find three numbers in `nums` whose sum is as close as possible to `target`, and return that sum (the sum itself, not the triplet).\n\nYou may use each index at most once per triplet.",
    constraints:
      '- `3 <= nums.length <= 500`\n- `-1000 <= nums[i] <= 1000`\n- `-10^4 <= target <= 10^4`\n- If several distinct triplet sums are tied for closest to `target`, the graded answer is the one produced by the standard sort + two-pointer sweep: increasing the fixed index `i` first, then closing the two pointers inward, keeping whichever qualifying sum is found first.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the triplet sum closest to target.',
    hints: [
      'Checking every triplet directly is O(n^3) — sorting the array first opens up a much faster technique, just like 3Sum.',
      'Fix one number as the smallest of the triplet, then use two pointers on the remaining sorted subarray to search for the other two.',
      "Track the best (closest) sum found across every pointer position you try, updating it whenever a new sum is strictly closer to the target than your current best.",
    ],
    solutionApproach:
      "Sort `nums`. Fix each index `i` and run a two-pointer scan (`l = i+1`, `r = n-1`) over the remaining sorted subarray: at each step compute the current triplet sum, update a running `closest` value whenever this sum is nearer to `target` than the previous best, and move `l` right if the sum is below target or `r` left if it's above (an exact match can return immediately). This mirrors 3Sum's two-pointer technique and runs in O(n^2) time after an O(n log n) sort.",
    pythonSolutionCode:
      'def three_sum_closest(nums, target):\n    arr = sorted(nums)\n    n = len(arr)\n    closest = arr[0] + arr[1] + arr[2]\n    for i in range(n - 2):\n        l, r = i + 1, n - 1\n        while l < r:\n            s = arr[i] + arr[l] + arr[r]\n            if abs(s - target) < abs(closest - target):\n                closest = s\n            if s == target:\n                return s\n            elif s < target:\n                l += 1\n            else:\n                r -= 1\n    return closest\n',
    solve: (nums, target) => {
      const arr = [...nums].sort((a, b) => a - b);
      const n = arr.length;
      let closest = arr[0] + arr[1] + arr[2];
      for (let i = 0; i < n - 2; i += 1) {
        let l = i + 1;
        let r = n - 1;
        while (l < r) {
          const sum = arr[i] + arr[l] + arr[r];
          if (Math.abs(sum - target) < Math.abs(closest - target)) closest = sum;
          if (sum === target) return sum;
          else if (sum < target) l += 1;
          else r -= 1;
        }
      }
      return closest;
    },
    exampleExplanation: (args, result) =>
      `The triplet summing to ${result} is the closest achievable sum to target ${args[1]}.`,
    edgeCases: [
      { args: [[0, 0, 0], 1], kind: 'edge' },
      { args: [[1, 1, 1, 1], 0], kind: 'edge' },
      { args: [[-1, 2, 1, -4], 1], kind: 'edge' },
      { args: [[1, 1, -1, -1, 3], -1], kind: 'edge' },
      { args: [[0, 1, 2], 3], kind: 'edge' },
      { args: [[-100, -98, -2, -1, 0, 1, 2, 100, 100], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: '4Sum',
    shape: 'tpswqb1_array_and_target_to_quad_list',
    shapeConfig: { minN: 4, maxN: 8, min: -15, max: 15 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an integer array `nums` and an integer `target`, return every unique quadruplet `[nums[a], nums[b], nums[c], nums[d]]` built from four distinct indices whose values sum to `target`.\n\nEach quadruplet is printed with its four values in ascending order, and the same combination of values must never be reported twice (even if multiple different index choices could build it). The quadruplets may be printed in any order.',
    constraints:
      '- `4 <= nums.length <= 200`\n- `-10^5 <= nums[i] <= 10^5`, `-10^9 <= target <= 10^9` (kept smaller for generated tests)\n- A quadruplet uses four distinct indices, but the values at those indices may repeat.\n- If no quadruplet sums to `target`, print nothing.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'One quadruplet per line as `a,b,c,d` (ascending within the quadruplet, no duplicates). Empty output if none exist. Line order does not matter.',
    hints: [
      'This is the same core idea as 3Sum, one level deeper — sorting the array first makes both duplicate-skipping and two-pointer search possible.',
      'Fix the first two numbers with nested loops, then use two pointers over the remaining sorted suffix to find pairs that complete the target sum — that turns the last two positions into an O(n) scan instead of O(n^2).',
      "Skip over duplicate values at all four positions (both fixed indices and both pointers) as you sweep through the sorted array, or you'll emit the same quadruplet more than once.",
    ],
    solutionApproach:
      "Sort `nums`. Use two nested loops over indices `i < j` to fix the first two elements of a candidate quadruplet, then a two-pointer scan (`l = j+1`, `r = n-1`) over the remaining sorted suffix to find pairs summing to `target - nums[i] - nums[j]`. At every one of the four positions, skip past repeated values to avoid emitting the same quadruplet twice. This runs in O(n^3) time, which is fine for the array sizes here.",
    pythonSolutionCode:
      'def four_sum(nums, target):\n    arr = sorted(nums)\n    n = len(arr)\n    res = []\n    for i in range(n - 3):\n        if i > 0 and arr[i] == arr[i - 1]:\n            continue\n        for j in range(i + 1, n - 2):\n            if j > i + 1 and arr[j] == arr[j - 1]:\n                continue\n            l, r = j + 1, n - 1\n            while l < r:\n                s = arr[i] + arr[j] + arr[l] + arr[r]\n                if s == target:\n                    res.append([arr[i], arr[j], arr[l], arr[r]])\n                    while l < r and arr[l] == arr[l + 1]:\n                        l += 1\n                    while l < r and arr[r] == arr[r - 1]:\n                        r -= 1\n                    l += 1\n                    r -= 1\n                elif s < target:\n                    l += 1\n                else:\n                    r -= 1\n    return res\n',
    solve: (nums, target) => {
      const arr = [...nums].sort((a, b) => a - b);
      const n = arr.length;
      const res = [];
      for (let i = 0; i < n - 3; i += 1) {
        if (i > 0 && arr[i] === arr[i - 1]) continue;
        for (let j = i + 1; j < n - 2; j += 1) {
          if (j > i + 1 && arr[j] === arr[j - 1]) continue;
          let l = j + 1;
          let r = n - 1;
          while (l < r) {
            const sum = arr[i] + arr[j] + arr[l] + arr[r];
            if (sum === target) {
              res.push([arr[i], arr[j], arr[l], arr[r]]);
              while (l < r && arr[l] === arr[l + 1]) l += 1;
              while (l < r && arr[r] === arr[r - 1]) r -= 1;
              l += 1;
              r -= 1;
            } else if (sum < target) l += 1;
            else r -= 1;
          }
        }
      }
      return res;
    },
    exampleExplanation: (args, result) =>
      result.length ? `${result.length} unique quadruplet(s) sum to ${args[1]}.` : `No quadruplet in this array sums to ${args[1]}.`,
    edgeCases: [
      { args: [[1, 0, -1, 0, -2, 2], 0], kind: 'edge' },
      { args: [[2, 2, 2, 2, 2], 8], kind: 'edge' },
      { args: [[0, 0, 0, 0], 0], kind: 'edge' },
      { args: [[1, 2, 3, 4], 100], kind: 'edge' },
      { args: [[-3, -2, -1, 0, 0, 1, 2, 3], 0], kind: 'edge' },
      { args: [[1, 1, 1, 1, 1, 1], 4], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Maximum Average Subarray I',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'float', minN: 1, maxN: 15, min: -10000, max: 10000 },
    comparisonMode: 'float',
    statement:
      'Given an integer array `nums` and an integer `k`, find the contiguous subarray of exactly `k` elements that has the maximum average value, and return that average.',
    constraints: '- `1 <= k <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`\n- Answers within `10^-5` of the true value are accepted.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: 'A single floating-point number: the maximum average, printed to 5 decimal places.',
    hints: [
      'Recomputing the sum of every length-k window from scratch is O(n*k) — think about what actually changes when the window shifts one step to the right.',
      'A sliding window only needs to add the element entering on the right and remove the element leaving on the left at each step.',
      'Keep a running window sum and track its maximum across all positions; only divide by k once, at the very end.',
    ],
    solutionApproach:
      'Compute the sum of the first `k` elements as the initial window. Then slide the window one element at a time: add `nums[i]`, subtract `nums[i-k]`, and track the maximum window sum seen so far. Divide the best sum by `k` once at the end. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def find_max_average(nums, k):\n    window = sum(nums[:k])\n    best = window\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]\n        if window > best:\n            best = window\n    return best / k\n',
    solve: (nums, k) => {
      let window = 0;
      for (let i = 0; i < k; i += 1) window += nums[i];
      let best = window;
      for (let i = k; i < nums.length; i += 1) {
        window += nums[i] - nums[i - k];
        if (window > best) best = window;
      }
      return best / k;
    },
    exampleExplanation: (args, result) => `The best length-${args[1]} window has average ${Number(result).toFixed(5)}.`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[5, 5, 5], 3], kind: 'edge' },
      { args: [[-1, -2, -3], 1], kind: 'edge' },
      { args: [[1, 12, -5, -6, 50, 3], 4], kind: 'edge' },
      { args: [[0, 0, 0, 0], 2], kind: 'edge' },
      { args: [[-10000, 10000], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Minimum Size Subarray Sum',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 1, max: 100 },
    genArgs: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const arr = randIntArray(rng, n, cfg.min ?? 1, cfg.max ?? 100);
      const total = arr.reduce((a, b) => a + b, 0);
      const targetMax = Math.max(2, Math.round(total * 1.3));
      const target = randInt(rng, 1, targetMax);
      return [arr, target];
    },
    statement:
      'Given an array of positive integers `nums` and a positive integer `target`, find the length of the shortest contiguous subarray whose sum is greater than or equal to `target`. Return `0` if no such subarray exists.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `1 <= nums[i] <= 10^4`\n- `1 <= target <= 10^9`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the minimal subarray length, or `0` if no subarray sums to at least target.',
    hints: [
      'Since every element is positive, growing a window only ever increases its sum — that monotonic property is exactly what makes a sliding window work here.',
      "Expand the window's right edge to accumulate sum; once the sum meets or exceeds the target, try shrinking from the left as far as it still qualifies.",
      'Track the minimum window length at every point the window sum is valid, and always shrink as much as possible before moving the right edge forward again.',
    ],
    solutionApproach:
      'Use two pointers to form a sliding window. Expand the right edge, adding to a running sum. Whenever the running sum is `>= target`, shrink from the left — recording the window length at each valid point and subtracting the removed element — until the sum drops back below target. Because every value is positive, the window never needs to be reconsidered once shrunk, giving O(n) time overall.',
    pythonSolutionCode:
      "def min_subarray_len(nums, target):\n    left = 0\n    total = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            best = min(best, right - left + 1)\n            total -= nums[left]\n            left += 1\n    return 0 if best == float('inf') else best\n",
    solve: (nums, target) => {
      let left = 0;
      let total = 0;
      let best = Infinity;
      for (let right = 0; right < nums.length; right += 1) {
        total += nums[right];
        while (total >= target) {
          best = Math.min(best, right - left + 1);
          total -= nums[left];
          left += 1;
        }
      }
      return best === Infinity ? 0 : best;
    },
    exampleExplanation: (args, result) =>
      result > 0
        ? `The shortest subarray summing to at least ${args[1]} has length ${result}.`
        : `No contiguous subarray sums to at least ${args[1]}.`,
    edgeCases: [
      { args: [[1, 1], 3], kind: 'edge' },
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 4, 4], 4], kind: 'edge' },
      { args: [[1, 1, 1, 1, 1, 1, 1, 1], 11], kind: 'edge' },
      { args: [[100], 1], kind: 'edge' },
      { args: [[2, 3, 1, 2, 4, 3], 7], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Implement Queue using Stacks',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'auto',
      queryOps: ['pop', 'peek', 'empty'],
      genOps: (rng) => {
        const ops = [];
        let size = 0;
        const count = randInt(rng, 4, 12);
        for (let i = 0; i < count; i += 1) {
          const choices = size > 0 ? ['push', 'push', 'pop', 'peek', 'empty'] : ['push'];
          const name = choices[randInt(rng, 0, choices.length - 1)];
          if (name === 'push') {
            ops.push({ name: 'push', args: [randInt(rng, -50, 50)] });
            size += 1;
          } else if (name === 'pop') {
            ops.push({ name: 'pop', args: [] });
            size -= 1;
          } else {
            ops.push({ name, args: [] });
          }
        }
        if (size === 0) ops.unshift({ name: 'push', args: [randInt(rng, -50, 50)] });
        return ops;
      },
    },
    statement:
      'Implement a first-in-first-out (FIFO) queue using only two stacks as your underlying storage (no array/queue/deque built directly).\n\nImplement the `MyQueue` operations:\n- `push(x)` — pushes element `x` to the back of the queue.\n- `pop()` — removes and returns the element at the front of the queue.\n- `peek()` — returns the element at the front of the queue without removing it.\n- `empty()` — returns `true` if the queue has no elements, `false` otherwise.',
    constraints:
      '- `-2^31 <= x <= 2^31 - 1`\n- `pop` and `peek` are only called when the queue is non-empty.\n- At most `100` calls total across all operations.',
    inputFormat:
      "Line 1: operation count `M`. Next `M` lines: `opName arg` (e.g. `push 5`, `pop`, `peek`, `empty` — no arg for `pop`/`peek`/`empty`).",
    outputFormat:
      "One line per `pop`/`peek`/`empty` call, in order, with that call's result (`pop`/`peek` print an integer, `empty` prints `true`/`false`). `push` produces no output.",
    hints: [
      'A single stack naturally reverses order (LIFO) — you need two stacks cooperating to restore FIFO order.',
      "Keep an 'in' stack that absorbs every push, and a separate 'out' stack that you read pops/peeks from; moving everything from 'in' to 'out' reverses the order back to FIFO.",
      "Only refill the 'out' stack when it's completely empty — refilling it while it still has elements would scramble the order of items already waiting to be dequeued.",
    ],
    solutionApproach:
      "Maintain two stacks: `inStack` absorbs every `push`. For `pop()`/`peek()`, if `outStack` is empty, pour every element from `inStack` onto `outStack` (this reverses their order, turning LIFO into FIFO) before reading from the top of `outStack`. `empty()` is true exactly when both stacks are empty. Each element only ever moves from `inStack` to `outStack` once, so all operations are O(1) amortized.",
    pythonSolutionCode:
      'class MyQueue:\n    def __init__(self):\n        self.in_stack = []\n        self.out_stack = []\n\n    def push(self, x):\n        self.in_stack.append(x)\n\n    def _shift(self):\n        if not self.out_stack:\n            while self.in_stack:\n                self.out_stack.append(self.in_stack.pop())\n\n    def pop(self):\n        self._shift()\n        return self.out_stack.pop()\n\n    def peek(self):\n        self._shift()\n        return self.out_stack[-1]\n\n    def empty(self):\n        return not self.in_stack and not self.out_stack\n',
    solve: (ops) => {
      const inStack = [];
      const outStack = [];
      const results = [];
      const shift = () => {
        if (!outStack.length) {
          while (inStack.length) outStack.push(inStack.pop());
        }
      };
      for (const op of ops) {
        if (op.name === 'push') {
          inStack.push(op.args[0]);
        } else if (op.name === 'pop') {
          shift();
          results.push(outStack.pop());
        } else if (op.name === 'peek') {
          shift();
          results.push(outStack[outStack.length - 1]);
        } else if (op.name === 'empty') {
          results.push(inStack.length === 0 && outStack.length === 0);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each query (pop/peek/empty) reflects FIFO order even though the implementation is built from two LIFO stacks.',
    edgeCases: [
      {
        args: [
          [
            { name: 'push', args: [1] },
            { name: 'push', args: [2] },
            { name: 'peek', args: [] },
            { name: 'pop', args: [] },
            { name: 'empty', args: [] },
          ],
        ],
        kind: 'edge',
      },
      { args: [[{ name: 'push', args: [5] }, { name: 'empty', args: [] }]], kind: 'edge' },
      {
        args: [[{ name: 'push', args: [1] }, { name: 'pop', args: [] }, { name: 'empty', args: [] }]],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'push', args: [1] },
            { name: 'push', args: [2] },
            { name: 'push', args: [3] },
            { name: 'pop', args: [] },
            { name: 'pop', args: [] },
            { name: 'pop', args: [] },
            { name: 'empty', args: [] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'push', args: [-5] },
            { name: 'push', args: [0] },
            { name: 'peek', args: [] },
            { name: 'pop', args: [] },
            { name: 'peek', args: [] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },
];
