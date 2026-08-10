import { randInt, sample } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Two Sum',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'indexPair', minN: 4, maxN: 12, min: -1000, max: 1000 },
    statement:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume each input has **exactly one** valid answer, and you may not use the same element twice. Return the answer as the two indices, smaller index first.",
    constraints: '- `2 <= nums.length <= 10^4`\n- `-10^9 <= nums[i], target <= 10^9`\n- Exactly one valid answer exists.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'The two 0-indexed indices whose values sum to target, smaller index first, space-separated.',
    hints: [
      'A brute-force check of every pair is O(n^2) — can you do it in one pass?',
      "As you scan left to right, ask: \"have I already seen the number I'd need to pair with this one?\"",
      'A hash map from value → index lets you answer that question in O(1) per step.',
    ],
    solutionApproach:
      'Walk the array once. For each number, compute `target - nums[i]` (the "complement") and check a hash map you\'ve been building of value → index. If the complement is already in the map, you found your pair. Otherwise, record the current value and index and keep going. This is O(n) time, O(n) space.',
    pythonSolutionCode:
      'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i]\n        seen[n] = i\n    return [-1, -1]\n',
    solve: (nums, target) => {
      const map = new Map();
      for (let i = 0; i < nums.length; i += 1) {
        const need = target - nums[i];
        if (map.has(need)) return [map.get(need), i];
        map.set(nums[i], i);
      }
      return [-1, -1];
    },
    exampleExplanation: (args, result) =>
      `nums[${result[0]}] + nums[${result[1]}] = ${args[0][result[0]]} + ${args[0][result[1]]} = ${args[1]}, so we return [${result[0]}, ${result[1]}].`,
    edgeCases: [
      { args: [[1, 2], 3], kind: 'edge' },
      { args: [[3, 3], 6], kind: 'edge' },
      { args: [[0, 4, 3, 0], 0], kind: 'edge' },
      { args: [[-3, 4, 3, 90], 0], kind: 'edge' },
      { args: [[1, 5, 1, 5], 10], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Best Time to Buy and Sell Stock',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 1000 },
    statement:
      'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`.\n\nYou want to maximize profit by choosing a single day to buy and a different, later day to sell. Return the maximum profit you can achieve. If no profit is possible, return `0`.',
    constraints: '- `1 <= prices.length <= 10^5`\n- `0 <= prices[i] <= 10^4`',
    inputFormat: 'Line 1: the array `prices`, space-separated.',
    outputFormat: 'A single integer: the maximum achievable profit (0 if none).',
    hints: [
      'You only ever need to track the lowest price seen so far as you scan left to right.',
      'At each day, ask: "if I sold today, having bought at the cheapest price so far, what would my profit be?"',
      'Keep a running best-profit and a running minimum price in a single O(n) pass.',
    ],
    solutionApproach:
      'Scan the prices once, tracking the minimum price seen so far. At each day, the best possible profit if selling today is `price - minSoFar`; keep a running maximum of that value. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def max_profit(prices):\n    min_price = float("inf")\n    best = 0\n    for p in prices:\n        if p < min_price:\n            min_price = p\n        elif p - min_price > best:\n            best = p - min_price\n    return best\n',
    solve: (prices) => {
      let minPrice = Infinity;
      let best = 0;
      for (const p of prices) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > best) best = p - minPrice;
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      result > 0
        ? `Buying low and selling later yields a maximum profit of ${result}.`
        : 'Prices only fall, so the best strategy is not to trade — profit is 0.',
    edgeCases: [
      { args: [[5]], kind: 'edge' },
      { args: [[7, 6, 4, 3, 1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[2, 2, 2, 2]], kind: 'edge' },
      { args: [[3, 2, 6, 5, 0, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Maximum Subarray',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -100, max: 100 },
    statement:
      'Given an integer array `nums`, find the contiguous subarray (containing at least one number) that has the largest sum, and return that sum.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the maximum subarray sum.',
    hints: [
      'A subarray must be contiguous — think about extending or restarting a running sum as you scan.',
      "If your running sum ever drops below zero, it can only hurt any future subarray — reset it.",
      "This is Kadane's algorithm: track `currentSum` and `bestSum` in one linear pass.",
    ],
    solutionApproach:
      "Kadane's algorithm: keep a running `current` sum. At each element, `current = max(nums[i], current + nums[i])` — either extend the previous subarray or start fresh at the current element. Track the maximum `current` seen. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def max_subarray(nums):\n    best = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best\n',
    solve: (nums) => {
      let best = nums[0];
      let cur = nums[0];
      for (let i = 1; i < nums.length; i += 1) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
      }
      return best;
    },
    exampleExplanation: () => 'The highlighted contiguous run of elements produces the largest possible sum.',
    edgeCases: [
      { args: [[-1]], kind: 'edge' },
      { args: [[-2, -1, -3]], kind: 'edge' },
      { args: [[5, 4, -1, 7, 8]], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Contains Duplicate',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15, min: -20, max: 20 },
    statement:
      'Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every element is distinct.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-10^9 <= nums[i] <= 10^9`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Sorting would let you check neighbors, but there\'s a faster way with extra space.',
      'A hash set lets you check "have I seen this before?" in O(1).',
      'Compare the size of a set built from the array against the array length.',
    ],
    solutionApproach: 'Insert every element into a hash set. If the set ends up smaller than the array, a duplicate existed. O(n) time, O(n) space.',
    pythonSolutionCode: 'def contains_duplicate(nums):\n    return len(set(nums)) != len(nums)\n',
    solve: (nums) => new Set(nums).size !== nums.length,
    exampleExplanation: (args, result) => (result ? 'At least one value repeats in the array.' : 'Every value in the array is distinct.'),
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[0, 0, 0, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Move Zeroes',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: -20, max: 20 },
    statement:
      'Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements. Return the resulting array.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `-2^31 <= nums[i] <= 2^31 - 1`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The array after moving all zeroes to the end, space-separated.',
    hints: [
      'You need to preserve the relative order of non-zero elements — sorting by "is it zero" is not enough on its own if you overthink it.',
      'Two-pointer: one pointer writes the next non-zero value, the other scans forward.',
      'After placing all non-zero values in order, fill the remaining positions with zeroes.',
    ],
    solutionApproach:
      'Use a write pointer starting at 0. Scan the array; whenever you see a non-zero value, place it at the write pointer and advance it. After the scan, fill everything from the write pointer to the end with zeroes. O(n) time, O(1) extra space (in-place); here we return a new array for stdout purposes.',
    pythonSolutionCode:
      'def move_zeroes(nums):\n    res = [n for n in nums if n != 0]\n    res += [0] * (len(nums) - len(res))\n    return res\n',
    solve: (nums) => {
      const nonZero = nums.filter((n) => n !== 0);
      while (nonZero.length < nums.length) nonZero.push(0);
      return nonZero;
    },
    exampleExplanation: () => 'Non-zero values keep their original relative order; all zeroes are pushed to the end.',
    edgeCases: [
      { args: [[0]], kind: 'edge' },
      { args: [[0, 0, 0]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[0, 1, 0, 3, 12]], kind: 'edge' },
      { args: [[1, 0, 0, 2, 0, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Merge Sorted Arrays',
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'intArray', minN: 0, maxN: 12, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n1 = randInt(rng, 0, cfg.maxN ?? 12);
      const n2 = randInt(rng, 0, cfg.maxN ?? 12);
      const gen = (n) =>
        Array.from({ length: n }, () => randInt(rng, cfg.min ?? -50, cfg.max ?? 50)).sort((a, b) => a - b);
      return [gen(n1), gen(n2)];
    },
    statement: 'Given two arrays `a` and `b`, each already sorted in ascending order, merge them into a single sorted array and return it.',
    constraints: '- `0 <= a.length, b.length <= 10^4`\n- Both arrays are sorted ascending on input.',
    inputFormat: 'Line 1: array `a`, space-separated. Line 2: array `b`, space-separated.',
    outputFormat: 'The merged, sorted array, space-separated (empty line if the result is empty).',
    hints: [
      'Since both inputs are already sorted, you never need to re-sort — just interleave them.',
      'Keep one pointer into each array and always take the smaller of the two current elements.',
      "Don't forget to drain whichever array still has leftover elements once the other is exhausted.",
    ],
    solutionApproach:
      'Classic merge step from merge sort: walk two pointers, one per array, repeatedly appending the smaller current element to the result. When one array is exhausted, append the remainder of the other. O(n + m) time.',
    pythonSolutionCode:
      'def merge_sorted(a, b):\n    i = j = 0\n    res = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            res.append(a[i]); i += 1\n        else:\n            res.append(b[j]); j += 1\n    res.extend(a[i:])\n    res.extend(b[j:])\n    return res\n',
    solve: (a, b) => {
      const res = [];
      let i = 0;
      let j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) res.push(a[i++]);
        else res.push(b[j++]);
      }
      while (i < a.length) res.push(a[i++]);
      while (j < b.length) res.push(b[j++]);
      return res;
    },
    exampleExplanation: () => 'Elements from both sorted arrays are interleaved to produce one sorted result.',
    edgeCases: [
      { args: [[], []], kind: 'edge' },
      { args: [[], [1, 2, 3]], kind: 'edge' },
      { args: [[1, 2, 3], []], kind: 'edge' },
      { args: [[1, 3, 5], [2, 4, 6]], kind: 'edge' },
      { args: [[1, 1, 1], [1, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Merge Intervals',
    shape: 'intervals_to_intervals_or_value',
    shapeConfig: { outputType: 'intervals', minN: 1, maxN: 10, min: 0, max: 50 },
    statement:
      'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    constraints: '- `1 <= intervals.length <= 10^4`\n- `0 <= start_i <= end_i <= 10^4`',
    inputFormat: 'Line 1: count `n`. Next `n` lines: `start end` for each interval.',
    outputFormat: 'One merged interval per line, as `start end`, in ascending order of start.',
    hints: [
      'Two intervals can only possibly merge if one starts before the other ends — sorting helps a lot here.',
      'Sort all intervals by start time first.',
      'Sweep left to right, extending the current merged interval whenever the next one overlaps it, otherwise starting a new one.',
    ],
    solutionApproach:
      "Sort intervals by start. Keep a 'current' merged interval; for each next interval, if its start is `<=` the current interval's end, extend the current end to the max of the two ends. Otherwise, push the current interval and start a new one. O(n log n) time.",
    pythonSolutionCode:
      'def merge_intervals(intervals):\n    if not intervals:\n        return []\n    ivs = sorted(intervals)\n    res = [list(ivs[0])]\n    for s, e in ivs[1:]:\n        if s <= res[-1][1]:\n            res[-1][1] = max(res[-1][1], e)\n        else:\n            res.append([s, e])\n    return res\n',
    solve: (intervals) => {
      if (!intervals.length) return [];
      const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
      const res = [sorted[0].slice()];
      for (let i = 1; i < sorted.length; i += 1) {
        const last = res[res.length - 1];
        const [s, e] = sorted[i];
        if (s <= last[1]) last[1] = Math.max(last[1], e);
        else res.push([s, e]);
      }
      return res;
    },
    exampleExplanation: () => 'Intervals that overlap or touch are combined into a single wider interval.',
    edgeCases: [
      { args: [[[1, 3]]], kind: 'edge' },
      { args: [[[1, 4], [4, 5]]], kind: 'edge' },
      { args: [[[1, 4], [0, 4]]], kind: 'edge' },
      { args: [[[1, 4], [2, 3]]], kind: 'edge' },
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Kth Largest Element in an Array',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -50, max: 50 },
    statement: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array (the kth largest, not the kth distinct element).',
    constraints: '- `1 <= k <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: 'A single integer: the kth largest value.',
    hints: [
      'Sorting the array descending and indexing directly works, though a heap of size k is the classic O(n log k) approach.',
      "After sorting descending, the element at index `k - 1` is your answer.",
      'For huge arrays, a min-heap of size k avoids sorting the whole array.',
    ],
    solutionApproach:
      "The simplest correct approach: sort the array in descending order and return the element at index `k - 1`. O(n log n) time — a min-heap of size k gets this to O(n log k) if needed.",
    pythonSolutionCode: 'def kth_largest(nums, k):\n    return sorted(nums, reverse=True)[k - 1]\n',
    solve: (nums, k) => [...nums].sort((a, b) => b - a)[k - 1],
    exampleExplanation: (args, result) => `Sorting the array descending and taking the ${args[1]}th value gives ${result}.`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[3, 2, 1, 5, 6, 4], 2], kind: 'edge' },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], kind: 'edge' },
      { args: [[1, 1, 1, 1], 1], kind: 'edge' },
      { args: [[7, 6, 5, 4, 3, 2, 1], 7], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: '3Sum',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', maxN: 10, min: -10, max: 10 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` (distinct indices `i != j != k`) such that the three values sum to `0`.\n\nEach triplet is printed with its three values in ascending order; the set of triplets may be printed in any order.',
    constraints: '- `3 <= nums.length <= 3000`\n- `-10^5 <= nums[i] <= 10^5`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'One triplet per line as `a,b,c` (ascending within the triplet). No triplet repeated. Order of lines does not matter.',
    hints: [
      'Sorting the array first makes both duplicate-skipping and searching much easier.',
      'Fix one number, then use a two-pointer scan over the rest of the (sorted) array to find pairs that sum to its negation.',
      'After sorting, skip over duplicate values at every level (the fixed number and both pointers) to avoid duplicate triplets.',
    ],
    solutionApproach:
      'Sort the array. Fix each index `i` as the smallest element of a candidate triplet, then use two pointers (`l = i+1`, `r = end`) scanning inward to find pairs summing to `-nums[i]`. Skip duplicate values at every position to avoid emitting the same triplet twice. O(n^2) time.',
    pythonSolutionCode:
      'def three_sum(nums):\n    nums = sorted(nums)\n    res = []\n    n = len(nums)\n    for i in range(n - 2):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r - 1]:\n                    r -= 1\n                l += 1; r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n',
    solve: (nums) => {
      const arr = [...nums].sort((a, b) => a - b);
      const res = [];
      for (let i = 0; i < arr.length - 2; i += 1) {
        if (i > 0 && arr[i] === arr[i - 1]) continue;
        let l = i + 1;
        let r = arr.length - 1;
        while (l < r) {
          const sum = arr[i] + arr[l] + arr[r];
          if (sum === 0) {
            res.push([arr[i], arr[l], arr[r]]);
            while (l < r && arr[l] === arr[l + 1]) l += 1;
            while (l < r && arr[r] === arr[r - 1]) r -= 1;
            l += 1;
            r -= 1;
          } else if (sum < 0) l += 1;
          else r -= 1;
        }
      }
      return res;
    },
    exampleExplanation: (args, result) =>
      result.length ? `${result.length} unique triplet(s) sum to zero.` : 'No triplet in this array sums to zero.',
    edgeCases: [
      { args: [[0, 0, 0]], kind: 'edge' },
      { args: [[0, 1, 1]], kind: 'edge' },
      { args: [[-1, 0, 1, 2, -1, -4]], kind: 'edge' },
      { args: [[1, 2, -2, -1]], kind: 'edge' },
      { args: [[-2, 0, 0, 2, 2]], kind: 'edge' },
    ],
  },
];
