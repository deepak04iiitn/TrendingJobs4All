import { randInt, randIntArray, shuffle, sample } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Three Sum',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', maxN: 10, min: -12, max: 12 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an integer array `nums`, return every unique triplet `[nums[i], nums[j], nums[k]]` (three distinct indices) whose values add up to `0`.\n\nEach triplet is printed with its own values in ascending order; the triplets themselves may be printed in any order, and no triplet may be repeated.',
    constraints: '- `0 <= nums.length <= 3000`\n- `-10^5 <= nums[i] <= 10^5`\n- If no triplet sums to zero, print nothing.',
    inputFormat: 'Line 1: the array `nums`, space-separated (may be empty).',
    outputFormat: 'One triplet per line as `a,b,c` (ascending within the triplet). Order of lines does not matter.',
    hints: [
      'Brute force is O(n^3) — sorting the array first opens up a much faster approach.',
      'Fix the smallest value of a candidate triplet, then look for the other two with a two-pointer sweep over the rest of the sorted array.',
      'Skip over repeated values at every position (the fixed index and both pointers) so the same triplet is never emitted twice.',
    ],
    solutionApproach:
      'Sort `nums`. For each index `i`, treat `nums[i]` as the smallest element of a candidate triplet and run a two-pointer scan (`l = i+1`, `r = n-1`) looking for pairs that sum to `-nums[i]`: move `l` right when the running sum is too small, move `r` left when it is too large, and record a match when it is exact. Skip duplicate values at `i`, `l`, and `r` to avoid duplicate triplets. O(n^2) time, O(1) extra space beyond the output.',
    pythonSolutionCode:
      'def three_sum(nums):\n    nums = sorted(nums)\n    n = len(nums)\n    res = []\n    for i in range(n - 2):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r - 1]:\n                    r -= 1\n                l += 1\n                r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n',
    solve: (nums) => {
      const arr = [...nums].sort((a, b) => a - b);
      const n = arr.length;
      const res = [];
      for (let i = 0; i < n - 2; i += 1) {
        if (i > 0 && arr[i] === arr[i - 1]) continue;
        let l = i + 1;
        let r = n - 1;
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
      result.length ? `${result.length} unique triplet(s) in [${args[0].join(',')}] sum to zero.` : 'No triplet in this array sums to zero.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[0, 0, 0]], kind: 'edge' },
      { args: [[0, 0, 0, 0]], kind: 'edge' },
      { args: [[-1, 0, 1, 2, -1, -4]], kind: 'edge' },
      { args: [[3, -2, 1, 0, -1, -1, -2, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Four Sum',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'intArray', leafKind: 'array', minN: 4, maxN: 10, min: -20, max: 20 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 4, cfg.maxN ?? 10);
      const nums = randIntArray(rng, n, cfg.min ?? -20, cfg.max ?? 20);
      let target;
      if (n >= 4 && rng() < 0.6) {
        const idxs = sample(rng, Array.from({ length: n }, (_, i) => i), 4);
        target = idxs.reduce((s, i) => s + nums[i], 0);
      } else {
        target = randInt(rng, (cfg.min ?? -20) * 2, (cfg.max ?? 20) * 2);
      }
      return [[target, ...nums]];
    },
    statement:
      'Given an integer array `nums` and an integer `target`, return every unique quadruplet `[nums[a], nums[b], nums[c], nums[d]]` (four distinct indices) whose values add up to `target`.\n\nBecause this judge feeds every problem through a single "array in, array-of-arrays out" input line, the target is packed together with the array on that line: **the first number is `target`, and the rest of the numbers (in order) are `nums`.** Each quadruplet is printed with its own values in ascending order; the quadruplets themselves may be printed in any order, and no quadruplet may be repeated.',
    constraints:
      '- `4 <= nums.length <= 200`\n- `-10^9 <= nums[i] <= 10^9`\n- `-10^9 <= target <= 10^9`\n- If no quadruplet sums to `target`, print nothing.',
    inputFormat: 'Line 1: a single space-separated line — the first integer is `target`, followed by the array `nums`.',
    outputFormat: 'One quadruplet per line as `a,b,c,d` (ascending within the quadruplet). Order of lines does not matter.',
    hints: [
      'This is a direct generalization of 3Sum — one more nested loop, with the same sorting trick underneath.',
      'Sort the array, then fix the two smallest elements of a candidate quadruplet with nested loops and use a two-pointer sweep for the remaining two.',
      'Skip duplicate values at all four positions (both fixed indices and both pointers) to avoid emitting the same quadruplet twice — and prune early when the smallest possible sum with the current prefix already exceeds `target`.',
    ],
    solutionApproach:
      'Sort `nums`. Fix indices `i < j` with nested loops (skipping duplicate values at each), then run a two-pointer scan (`l = j+1`, `r = n-1`) over the remainder to find pairs completing the sum to `target`, moving `l` right or `r` left depending on whether the running total is too small or too large, and skipping duplicates on a match. O(n^3) time, O(1) extra space beyond the output.',
    pythonSolutionCode:
      'def four_sum(nums, target):\n    nums = sorted(nums)\n    n = len(nums)\n    res = []\n    for i in range(n - 3):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        for j in range(i + 1, n - 2):\n            if j > i + 1 and nums[j] == nums[j - 1]:\n                continue\n            l, r = j + 1, n - 1\n            while l < r:\n                s = nums[i] + nums[j] + nums[l] + nums[r]\n                if s == target:\n                    res.append([nums[i], nums[j], nums[l], nums[r]])\n                    while l < r and nums[l] == nums[l + 1]:\n                        l += 1\n                    while l < r and nums[r] == nums[r - 1]:\n                        r -= 1\n                    l += 1\n                    r -= 1\n                elif s < target:\n                    l += 1\n                else:\n                    r -= 1\n    return res\n',
    solve: (arr) => {
      const target = arr[0];
      const nums = [...arr.slice(1)].sort((a, b) => a - b);
      const n = nums.length;
      const res = [];
      for (let i = 0; i < n - 3; i += 1) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        for (let j = i + 1; j < n - 2; j += 1) {
          if (j > i + 1 && nums[j] === nums[j - 1]) continue;
          let l = j + 1;
          let r = n - 1;
          while (l < r) {
            const sum = nums[i] + nums[j] + nums[l] + nums[r];
            if (sum === target) {
              res.push([nums[i], nums[j], nums[l], nums[r]]);
              while (l < r && nums[l] === nums[l + 1]) l += 1;
              while (l < r && nums[r] === nums[r - 1]) r -= 1;
              l += 1;
              r -= 1;
            } else if (sum < target) l += 1;
            else r -= 1;
          }
        }
      }
      return res;
    },
    exampleExplanation: (args, result) => {
      const [target, ...nums] = args[0];
      return result.length
        ? `${result.length} unique quadruplet(s) in [${nums.join(',')}] sum to ${target}.`
        : `No quadruplet in [${nums.join(',')}] sums to ${target}.`;
    },
    edgeCases: [
      { args: [[0, 0, 0, 0, 0]], kind: 'edge' },
      { args: [[10, 1, 2, 3, 4]], kind: 'edge' },
      { args: [[0, 1, 0, -1, 0, -2, 2]], kind: 'edge' },
      { args: [[8, 2, 2, 2, 2, 2]], kind: 'edge' },
      { args: [[-2, -3, -1, 0, 2, 4, 5]], kind: 'edge' },
      { args: [[0, 1000000000, 1000000000, 1000000000, 1000000000, -1000000000, -1000000000, -1000000000, -1000000000]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Two Sum II - Input Array is Sorted',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'indexPair', minN: 2, maxN: 12, min: -500, max: 500 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 12);
      const arr = randIntArray(rng, n, cfg.min ?? -500, cfg.max ?? 500).sort((a, b) => a - b);
      const i = randInt(rng, 0, n - 1);
      let j = randInt(rng, 0, n - 1);
      if (j === i) j = (j + 1) % n;
      const target = arr[i] + arr[j];
      return [arr, target];
    },
    statement:
      'Given a 1-indexed array `numbers` already sorted in **non-decreasing** order and an integer `target`, find two numbers that add up to `target`.\n\nReturn their 1-indexed positions `[index1, index2]` with `index1 < index2`. You may assume exactly one valid pair exists, and you may not use the same element twice.',
    constraints:
      '- `2 <= numbers.length <= 3*10^4`\n- `-1000 <= numbers[i] <= 1000`\n- `numbers` is sorted in non-decreasing order.\n- Exactly one valid pair exists.',
    inputFormat: 'Line 1: the sorted array `numbers`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'The two 1-indexed positions whose values sum to target, smaller index first, space-separated.',
    hints: [
      'The array being sorted is the whole point here — a hash map would work, but it throws away information you already have for free.',
      'Start one pointer at each end of the array. Compare the sum of the two pointed-at values to the target.',
      'If the sum is too small, the only way to increase it is to move the left pointer right; if too large, move the right pointer left.',
    ],
    solutionApproach:
      "Two-pointer sweep over the already-sorted array: `lo = 0`, `hi = n-1`. If `numbers[lo] + numbers[hi] == target`, you're done. If the sum is too small, `lo` must move right (the only way to increase the sum); if too large, `hi` must move left. Report 1-indexed positions. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def two_sum_ii(numbers, target):\n    lo, hi = 0, len(numbers) - 1\n    while lo < hi:\n        s = numbers[lo] + numbers[hi]\n        if s == target:\n            return [lo + 1, hi + 1]\n        if s < target:\n            lo += 1\n        else:\n            hi -= 1\n    return [-1, -1]\n',
    solve: (numbers, target) => {
      let lo = 0;
      let hi = numbers.length - 1;
      while (lo < hi) {
        const sum = numbers[lo] + numbers[hi];
        if (sum === target) return [lo + 1, hi + 1];
        if (sum < target) lo += 1;
        else hi -= 1;
      }
      return [-1, -1];
    },
    exampleExplanation: (args, result) =>
      `numbers[${result[0]}] + numbers[${result[1]}] = ${args[0][result[0] - 1]} + ${args[0][result[1] - 1]} = ${args[1]}, so we return [${result[0]}, ${result[1]}] (1-indexed).`,
    edgeCases: [
      { args: [[2, 7, 11, 15], 9], kind: 'edge' },
      { args: [[2, 3, 4], 6], kind: 'edge' },
      { args: [[-1, 0], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 4, 9], 8], kind: 'edge' },
      { args: [[-10, -5, 0, 3, 7], -15], kind: 'edge' },
      { args: [[0, 0, 3, 4], 0], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find Duplicates in Array',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: 1, max: 15 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const base = Array.from({ length: n }, (_, i) => i + 1);
      const dupCount = randInt(rng, 0, Math.floor(n / 2));
      const toDup = sample(rng, base, dupCount);
      const arr = [...base, ...toDup];
      return [shuffle(rng, arr)];
    },
    statement:
      'You are given an integer array `nums` of length `n` where every value lies in `[1, n]` and each value occurs either once or exactly twice.\n\nReturn all the values that occur twice, sorted in ascending order.',
    constraints: '- `1 <= n <= 10^5`\n- `1 <= nums[i] <= n`\n- Each value appears exactly once or exactly twice.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The duplicated values, sorted ascending, space-separated (empty line if there are none).',
    hints: [
      'Since every value is a valid index into the array (`1..n`), you can use the array itself as a hash set instead of allocating extra space.',
      'Walk the array; for each value `v`, look at the element at index `|v| - 1` and negate it. If it is already negative, you have seen `v` before.',
      'After the pass, the negated positions tell you which values repeated — collect and sort them.',
    ],
    solutionApproach:
      'Use the values as indices into the array itself: for each `nums[i]`, let `idx = |nums[i]| - 1`. If `nums[idx]` is already negative, `|nums[i]|` is a duplicate — record it. Otherwise negate `nums[idx]` to mark that value as seen. This finds every duplicate in O(n) time using only O(1) extra space (beyond the output), without a separate hash set.',
    pythonSolutionCode:
      'def find_duplicates(nums):\n    arr = list(nums)\n    res = []\n    for x in arr:\n        idx = abs(x) - 1\n        if arr[idx] < 0:\n            res.append(idx + 1)\n        else:\n            arr[idx] = -arr[idx]\n    return sorted(res)\n',
    solve: (nums) => {
      const arr = [...nums];
      const res = [];
      for (let i = 0; i < arr.length; i += 1) {
        const idx = Math.abs(arr[i]) - 1;
        if (arr[idx] < 0) res.push(idx + 1);
        else arr[idx] = -arr[idx];
      }
      return res.sort((a, b) => a - b);
    },
    exampleExplanation: (args, result) =>
      result.length ? `The values [${result.join(', ')}] each appear twice in the array.` : 'No value in this array appears twice.',
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[4, 3, 2, 7, 8, 2, 3, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[2, 2, 2, 2]], kind: 'edge' },
      { args: [[1, 1, 2, 2, 3, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Contains Duplicate II',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'bool', minN: 2, maxN: 15, min: -20, max: 20 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 15);
      const arr = randIntArray(rng, n, cfg.min ?? -20, cfg.max ?? 20);
      if (n >= 2 && rng() < 0.5) {
        const i = randInt(rng, 0, n - 2);
        const gap = randInt(rng, 1, Math.min(3, n - 1 - i));
        arr[i + gap] = arr[i];
      }
      const k = randInt(rng, 1, n);
      return [arr, k];
    },
    statement:
      'Given an integer array `nums` and an integer `k`, return `true` if there are two distinct indices `i` and `j` such that `nums[i] == nums[j]` **and** `|i - j| <= k`.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-10^9 <= nums[i] <= 10^9`\n- `0 <= k <= 10^5`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'A brute-force check of every pair is O(n^2) — you only actually care about *nearby* duplicates.',
      'Keep a hash map from value to the most recent index it was seen at.',
      'When you see a value again, check whether the distance from its last seen index is within `k` — and always update the last-seen index either way.',
    ],
    solutionApproach:
      "Scan left to right while keeping a hash map of value → most recent index seen. For each `nums[i]`, if the value was seen before at index `j` with `i - j <= k`, return true immediately. Otherwise (or after checking), update the map with the current index. O(n) time, O(min(n, k)) space.",
    pythonSolutionCode:
      'def contains_nearby_duplicate(nums, k):\n    last = {}\n    for i, n in enumerate(nums):\n        if n in last and i - last[n] <= k:\n            return True\n        last[n] = i\n    return False\n',
    solve: (nums, k) => {
      const last = new Map();
      for (let i = 0; i < nums.length; i += 1) {
        const v = nums[i];
        if (last.has(v) && i - last.get(v) <= k) return true;
        last.set(v, i);
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result
        ? `Some value repeats within a distance of ${args[1]} in the array.`
        : `No value repeats within a distance of ${args[1]} in the array.`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 2, 3, 1], 3], kind: 'edge' },
      { args: [[1, 0, 1, 1], 1], kind: 'edge' },
      { args: [[1, 2, 3, 1, 2, 3], 2], kind: 'edge' },
      { args: [[1, 2, 1], 0], kind: 'edge' },
      { args: [[99, -5, 99], 2], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Remove Duplicates from Sorted Array',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: -10, max: 10 },
    genArgs: (rng, cfg) =>
      [randIntArray(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15), cfg.min ?? -10, cfg.max ?? 10).sort((a, b) => a - b)],
    statement:
      'Given an integer array `nums` sorted in **non-decreasing** order, remove the duplicates in place so each unique value appears only once, keeping the remaining elements in their original relative order.\n\nSince this judge communicates purely through stdin/stdout (there is no caller array to mutate), return the resulting deduplicated array directly instead of an in-place length.',
    constraints: '- `1 <= nums.length <= 3*10^4`\n- `-100 <= nums[i] <= 100`\n- `nums` is sorted in non-decreasing order.',
    inputFormat: 'Line 1: the sorted array `nums`, space-separated.',
    outputFormat: 'The array of unique values in ascending order, space-separated.',
    hints: [
      "Because the array is sorted, every duplicate of a value sits right next to it — you never need to look far away.",
      'Keep a "write" pointer for the last unique value placed so far, and a "read" pointer scanning forward.',
      'Only advance the write pointer (and copy the value) when the read pointer finds something different from the last written value.',
    ],
    solutionApproach:
      'Two pointers: `write` tracks the end of the unique prefix built so far. Scan with `read` from index 1; whenever `nums[read] != nums[write]`, increment `write` and copy `nums[read]` there. Because the input is sorted, this correctly keeps exactly one copy of each value in original order. O(n) time, O(1) extra space (in-place); the judge returns the resulting array for stdout purposes.',
    pythonSolutionCode:
      'def remove_duplicates(nums):\n    if not nums:\n        return []\n    write = 0\n    for read in range(1, len(nums)):\n        if nums[read] != nums[write]:\n            write += 1\n            nums[write] = nums[read]\n    return nums[: write + 1]\n',
    solve: (nums) => {
      if (!nums.length) return [];
      const arr = [...nums];
      let write = 0;
      for (let read = 1; read < arr.length; read += 1) {
        if (arr[read] !== arr[write]) {
          write += 1;
          arr[write] = arr[read];
        }
      }
      return arr.slice(0, write + 1);
    },
    exampleExplanation: (args, result) => `The ${args[0].length}-element sorted array collapses to ${result.length} unique value(s): [${result.join(', ')}].`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 1, 2]], kind: 'edge' },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], kind: 'edge' },
      { args: [[-5, -5, -3, 0, 0, 2]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Remove Duplicates from Sorted Array II',
    shape: 'int_array_to_int_array',
    shapeConfig: { min: -10, max: 10, maxDistinct: 6 },
    genArgs: (rng, cfg) => {
      const distinctCount = randInt(rng, 1, cfg.maxDistinct ?? 6);
      const arr = [];
      let val = randInt(rng, cfg.min ?? -10, cfg.max ?? 10);
      for (let i = 0; i < distinctCount; i += 1) {
        const reps = randInt(rng, 1, 4);
        for (let r = 0; r < reps; r += 1) arr.push(val);
        val += randInt(rng, 1, 3);
      }
      return [arr];
    },
    statement:
      'Given an integer array `nums` sorted in **non-decreasing** order, remove elements so that each unique value appears **at most twice**, keeping the remaining elements in their original relative order.\n\nSince this judge has no caller array to mutate in place, return the resulting array directly instead of an in-place length.',
    constraints: '- `1 <= nums.length <= 3*10^4`\n- `-100 <= nums[i] <= 100`\n- `nums` is sorted in non-decreasing order.',
    inputFormat: 'Line 1: the sorted array `nums`, space-separated.',
    outputFormat: 'The array after capping every value at two occurrences, space-separated.',
    hints: [
      'A value is allowed twice, so the simple "compare to the previous element" trick from the one-duplicate version needs a wider lookback.',
      'Keep a write pointer for the result built so far, and only ever compare a candidate value against the element **two positions back** in the result.',
      'If the candidate differs from the result-so-far\'s element at `write - 2`, it is always safe to keep it (it cannot create a third copy).',
    ],
    solutionApproach:
      "Build the result incrementally with a write index. Seed it with the first `min(2, n)` elements (always safe). For every later element, compare it to the result's element two positions back (`result[write-2]`): if different, appending it cannot create a third consecutive duplicate, so keep it; if equal, skip it. Because the input is sorted, all copies of any value are contiguous, so this check is sufficient. O(n) time, O(1) extra space (in-place); the judge returns the resulting array for stdout purposes.",
    pythonSolutionCode:
      'def remove_duplicates_ii(nums):\n    if len(nums) <= 2:\n        return list(nums)\n    res = nums[:2]\n    for x in nums[2:]:\n        if x != res[-2]:\n            res.append(x)\n    return res\n',
    solve: (nums) => {
      if (nums.length <= 2) return [...nums];
      const res = [nums[0], nums[1]];
      for (let i = 2; i < nums.length; i += 1) {
        if (nums[i] !== res[res.length - 2]) res.push(nums[i]);
      }
      return res;
    },
    exampleExplanation: (args, result) => `The array shrinks from ${args[0].length} to ${result.length} element(s) once every value is capped at two copies.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 1, 1]], kind: 'edge' },
      { args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], kind: 'edge' },
      { args: [[-2, -2, -2, -1, 0, 0, 0, 0, 3, 3]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Missing Number',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 15 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const full = Array.from({ length: n + 1 }, (_, i) => i);
      full.splice(randInt(rng, 0, n), 1);
      return [shuffle(rng, full)];
    },
    statement:
      'You are given an array `nums` containing `n` distinct numbers taken from the range `[0, n]` (so exactly one number in that range is missing). Return the missing number.',
    constraints: '- `1 <= n <= 10^4`\n- `0 <= nums[i] <= n`\n- All values in `nums` are distinct.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the missing number in `[0, n]`.',
    hints: [
      'You know exactly what the numbers 0..n should sum to if none were missing.',
      'The array has `n` elements but represents the range `[0, n]`, which has `n + 1` possible values — one is absent.',
      'Compare the expected sum of `0..n` against the actual sum of `nums`; the difference is the missing number.',
    ],
    solutionApproach:
      'Let `n = nums.length`. The full range `[0, n]` would sum to `n*(n+1)/2`. Subtract the actual sum of `nums` from that expected total — the remainder is exactly the missing number. O(n) time, O(1) space (no sorting or hashing needed).',
    pythonSolutionCode:
      'def missing_number(nums):\n    n = len(nums)\n    expected = n * (n + 1) // 2\n    return expected - sum(nums)\n',
    solve: (nums) => {
      const n = nums.length;
      const expected = (n * (n + 1)) / 2;
      const actual = nums.reduce((s, x) => s + x, 0);
      return expected - actual;
    },
    exampleExplanation: (args, result) => `The array is missing ${result} from the range [0, ${args[0].length}].`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[3, 0, 1]], kind: 'edge' },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], kind: 'edge' },
      { args: [[0, 1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find Missing Number in Array',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 1, max: 16 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, Math.max(2, cfg.minN ?? 2), cfg.maxN ?? 15);
      const full = Array.from({ length: n }, (_, i) => i + 1);
      full.splice(randInt(rng, 0, n - 1), 1);
      return [shuffle(rng, full)];
    },
    statement:
      'A sequence of the first `n` natural numbers `1, 2, ..., n` had exactly one number removed. You are given the remaining `n - 1` numbers, `nums`, in no particular order. Find the missing number.',
    constraints: '- `2 <= n <= 10^4`\n- `nums` has exactly `n - 1` distinct values from `1` to `n`.',
    inputFormat: 'Line 1: the array `nums` (the surviving `n - 1` numbers), space-separated.',
    outputFormat: 'A single integer: the missing number from `1..n`.',
    hints: [
      'The array has `n - 1` entries, so the full range size `n` is one more than the array length.',
      'The sum of `1..n` has a simple closed-form formula.',
      'Subtracting the actual array sum from the expected full-range sum gives you the gap directly.',
    ],
    solutionApproach:
      'Since `nums` has `n - 1` entries, the full range is `1..n` where `n = nums.length + 1`. Compute the expected sum `n*(n+1)/2` and subtract the actual sum of `nums` — the difference is the missing number. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def find_missing_number(nums):\n    n = len(nums) + 1\n    expected = n * (n + 1) // 2\n    return expected - sum(nums)\n',
    solve: (nums) => {
      const n = nums.length + 1;
      const expected = (n * (n + 1)) / 2;
      const actual = nums.reduce((s, x) => s + x, 0);
      return expected - actual;
    },
    exampleExplanation: (args, result) => `With ${args[0].length} numbers given, the full range is 1..${args[0].length + 1}, and ${result} is the one missing.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[2]], kind: 'edge' },
      { args: [[1, 3, 4, 5]], kind: 'edge' },
      { args: [[2, 3, 4, 5]], kind: 'edge' },
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[9, 1, 2, 3, 4, 5, 6, 7, 8]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'First Missing Positive',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -10, max: 20 },
    statement:
      'Given an unsorted integer array `nums` (which may contain negatives, zero, duplicates, and gaps), return the smallest positive integer that does **not** appear in it.\n\nYour algorithm should run in O(n) time and use O(1) extra space (beyond the input array itself).',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-2^31 <= nums[i] <= 2^31 - 1`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the smallest missing positive integer.',
    hints: [
      'The answer is always somewhere between `1` and `n + 1`, where `n` is the array length — anything outside that range is irrelevant.',
      'You can use the array itself as a hash table: try to place each value `v` (with `1 <= v <= n`) at index `v - 1` by swapping.',
      'After placing everything you can, scan left to right — the first index `i` where `nums[i] != i + 1` reveals the answer.',
    ],
    solutionApproach:
      "The answer must lie in `[1, n+1]`. Do an in-place \"cyclic placement\": for each index `i`, while `nums[i]` is a valid candidate (`1 <= nums[i] <= n`) and it is not already in its correct home (`nums[nums[i]-1] != nums[i]`), swap it into place. After this pass, scan for the first index `i` where `nums[i] != i + 1` — that gap is the answer. If every position is correct, the answer is `n + 1`. O(n) time (each element is swapped at most once), O(1) extra space.",
    pythonSolutionCode:
      'def first_missing_positive(nums):\n    arr = list(nums)\n    n = len(arr)\n    for i in range(n):\n        while 1 <= arr[i] <= n and arr[arr[i] - 1] != arr[i]:\n            target = arr[i] - 1\n            arr[i], arr[target] = arr[target], arr[i]\n    for i in range(n):\n        if arr[i] != i + 1:\n            return i + 1\n    return n + 1\n',
    solve: (nums) => {
      const arr = [...nums];
      const n = arr.length;
      for (let i = 0; i < n; i += 1) {
        while (arr[i] >= 1 && arr[i] <= n && arr[arr[i] - 1] !== arr[i]) {
          const target = arr[i] - 1;
          [arr[i], arr[target]] = [arr[target], arr[i]];
        }
      }
      for (let i = 0; i < n; i += 1) {
        if (arr[i] !== i + 1) return i + 1;
      }
      return n + 1;
    },
    exampleExplanation: (args, result) => `${result} is the smallest positive integer not present in [${args[0].join(',')}].`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[2]], kind: 'edge' },
      { args: [[1, 2, 0]], kind: 'edge' },
      { args: [[3, 4, -1, 1]], kind: 'edge' },
      { args: [[7, 8, 9, 11, 12]], kind: 'edge' },
      { args: [[-1, -2, -3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Maximum Product Subarray',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -10, max: 10 },
    statement:
      'Given an integer array `nums`, find a contiguous, non-empty subarray whose elements have the largest product, and return that product.',
    constraints: '- `1 <= nums.length <= 2*10^4`\n- `-10 <= nums[i] <= 10`\n- The product of any subarray fits in a 32-bit integer.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the maximum subarray product.',
    hints: [
      "Kadane's running-sum trick doesn't directly transfer, because multiplying by a negative number flips the sign of your running value.",
      'Track both a running maximum product AND a running minimum product ending at the current position — a very negative running minimum can become the best maximum after multiplying by another negative.',
      'At each step, when the current number is negative, swap your running max and min before extending them, since multiplying by a negative reverses their order.',
    ],
    solutionApproach:
      'Track two running values ending at the current index: `maxProd` (best product) and `minProd` (worst/most negative product). At each element `x`: if `x` is negative, swap `maxProd` and `minProd` first (since multiplying by a negative reverses which one is bigger). Then update `maxProd = max(x, maxProd * x)` and `minProd = min(x, minProd * x)`. Keep a running answer as the maximum `maxProd` seen. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def max_product_subarray(nums):\n    max_prod = min_prod = best = nums[0]\n    for x in nums[1:]:\n        if x < 0:\n            max_prod, min_prod = min_prod, max_prod\n        max_prod = max(x, max_prod * x)\n        min_prod = min(x, min_prod * x)\n        best = max(best, max_prod)\n    return best\n',
    solve: (nums) => {
      let maxProd = nums[0];
      let minProd = nums[0];
      let best = nums[0];
      for (let i = 1; i < nums.length; i += 1) {
        const x = nums[i];
        if (x < 0) {
          const tmp = maxProd;
          maxProd = minProd;
          minProd = tmp;
        }
        maxProd = Math.max(x, maxProd * x);
        minProd = Math.min(x, minProd * x);
        best = Math.max(best, maxProd);
      }
      return best;
    },
    exampleExplanation: () => 'The highlighted contiguous run of elements produces the largest possible product.',
    edgeCases: [
      { args: [[-2]], kind: 'edge' },
      { args: [[2, 3, -2, 4]], kind: 'edge' },
      { args: [[-2, 0, -1]], kind: 'edge' },
      { args: [[-2, 3, -4]], kind: 'edge' },
      { args: [[0, 2]], kind: 'edge' },
      { args: [[-1, -2, -3, 0, 1, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Maximum Sum Circular Subarray',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -10, max: 10 },
    statement:
      'Given a **circular** integer array `nums` (the end connects back to the beginning), find the maximum possible sum of a non-empty contiguous subarray, where the subarray is allowed to wrap around past the end of the array back to the start.',
    constraints: '- `1 <= nums.length <= 3*10^4`\n- `-3*10^4 <= nums[i] <= 3*10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the maximum circular subarray sum.',
    hints: [
      "The answer is either a normal (non-wrapping) subarray, solvable with Kadane's algorithm, or a wrapping one.",
      'A wrapping subarray is exactly the total array sum minus some *non-empty, non-wrapping, contiguous middle chunk* — so it equals `total - (minimum subarray sum)`.',
      "Careful: if every element is negative, the 'wrapping' formula would incorrectly yield an empty subarray (sum 0) — in that case the best answer is just the largest single element, which plain Kadane's already finds.",
    ],
    solutionApproach:
      "Run Kadane's algorithm twice: once for the maximum subarray sum (`maxSum`, the non-wrapping case), and once for the minimum subarray sum (`minSum`). The best wrapping subarray sum equals `total - minSum` (the array sum minus the excluded lowest-sum middle chunk). The answer is `max(maxSum, total - minSum)` — unless every element is negative (`maxSum < 0`), in which case `total - minSum` would wrongly represent an empty subarray, so just return `maxSum` directly. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def max_subarray_sum_circular(nums):\n    total = 0\n    cur_max = 0\n    max_sum = float("-inf")\n    cur_min = 0\n    min_sum = float("inf")\n    for x in nums:\n        cur_max = max(cur_max + x, x)\n        max_sum = max(max_sum, cur_max)\n        cur_min = min(cur_min + x, x)\n        min_sum = min(min_sum, cur_min)\n        total += x\n    if max_sum < 0:\n        return max_sum\n    return max(max_sum, total - min_sum)\n',
    solve: (nums) => {
      let total = 0;
      let curMax = 0;
      let maxSum = -Infinity;
      let curMin = 0;
      let minSum = Infinity;
      for (const x of nums) {
        curMax = Math.max(curMax + x, x);
        maxSum = Math.max(maxSum, curMax);
        curMin = Math.min(curMin + x, x);
        minSum = Math.min(minSum, curMin);
        total += x;
      }
      if (maxSum < 0) return maxSum;
      return Math.max(maxSum, total - minSum);
    },
    exampleExplanation: (args, result) => `Allowing the subarray to wrap around the end of [${args[0].join(',')}] gives a best sum of ${result}.`,
    edgeCases: [
      { args: [[5]], kind: 'edge' },
      { args: [[-3, -2, -3]], kind: 'edge' },
      { args: [[1, -2, 3, -2]], kind: 'edge' },
      { args: [[5, -3, 5]], kind: 'edge' },
      { args: [[3, -1, 2, -1]], kind: 'edge' },
      { args: [[-2, -3, -1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Insert Interval',
    shape: 'intervals_to_intervals_or_value',
    shapeConfig: { outputType: 'intervals', minN: 0, maxN: 8, min: 0, max: 40 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 8);
      const existing = [];
      let cursor = randInt(rng, cfg.min ?? 0, 5);
      for (let i = 0; i < n; i += 1) {
        const start = cursor;
        const end = start + randInt(rng, 0, 5);
        existing.push([start, end]);
        cursor = end + randInt(rng, 1, 6);
      }
      const newStart = randInt(rng, cfg.min ?? 0, cfg.max ?? 40);
      const newInterval = [newStart, newStart + randInt(rng, 0, 8)];
      return [[...existing, newInterval]];
    },
    statement:
      'You are given a set of non-overlapping intervals sorted by start time, plus one new interval to insert.\n\nInsert the new interval into the set, merging any overlaps, and return the resulting set of intervals still sorted by start time.\n\nBecause this judge represents everything as a single flat list of intervals, the **last interval in the input list is the new interval to insert**; every interval before it is the existing sorted, mutually non-overlapping set.',
    constraints:
      '- `0 <= existing intervals.length <= 10^4`\n- The existing intervals are sorted by start time and do not overlap.\n- `0 <= start <= end <= 10^5` for every interval, including the new one.',
    inputFormat: 'Line 1: count `n` (existing intervals + 1). Next `n` lines: `start end` for each interval, with the final line being the new interval to insert.',
    outputFormat: 'One resulting interval per line, as `start end`, sorted by start time.',
    hints: [
      'Split the work into three phases based on how each existing interval relates to the new one.',
      "Every existing interval that ends before the new interval starts can be copied straight to the output untouched — likewise, every interval that starts after the new one ends goes to the output untouched.",
      'Any existing interval that overlaps the new one should instead grow the new interval\'s own start/end (take the min of starts, max of ends) before it is finally pushed to the output.',
    ],
    solutionApproach:
      "Split the existing (already-sorted) intervals into three groups relative to the new interval `[ns, ne]`: (1) intervals ending strictly before `ns` — copy directly to the result; (2) intervals overlapping `[ns, ne]` (start `<= ne`) — merge into the new interval by taking `ns = min(ns, start)` and `ne = max(ne, end)`; (3) remaining intervals — copy directly. Push the (possibly-grown) new interval once phase 2 ends, then append the rest of phase 3. O(n) time.",
    pythonSolutionCode:
      'def insert_interval(intervals):\n    existing = intervals[:-1]\n    ns, ne = intervals[-1]\n    res = []\n    i, n = 0, len(existing)\n    while i < n and existing[i][1] < ns:\n        res.append(existing[i])\n        i += 1\n    while i < n and existing[i][0] <= ne:\n        ns = min(ns, existing[i][0])\n        ne = max(ne, existing[i][1])\n        i += 1\n    res.append([ns, ne])\n    while i < n:\n        res.append(existing[i])\n        i += 1\n    return res\n',
    solve: (intervals) => {
      const existing = intervals.slice(0, -1);
      let [ns, ne] = intervals[intervals.length - 1];
      const res = [];
      let i = 0;
      const n = existing.length;
      while (i < n && existing[i][1] < ns) {
        res.push(existing[i]);
        i += 1;
      }
      while (i < n && existing[i][0] <= ne) {
        ns = Math.min(ns, existing[i][0]);
        ne = Math.max(ne, existing[i][1]);
        i += 1;
      }
      res.push([ns, ne]);
      while (i < n) {
        res.push(existing[i]);
        i += 1;
      }
      return res;
    },
    exampleExplanation: (args, result) => {
      const newInterval = args[0][args[0].length - 1];
      return `Inserting [${newInterval.join(',')}] into the existing sorted intervals produces ${result.length} interval(s) after merging.`;
    },
    edgeCases: [
      { args: [[[5, 7]]], kind: 'edge' },
      { args: [[[1, 3], [6, 9], [2, 5]]], kind: 'edge' },
      { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16], [4, 8]]], kind: 'edge' },
      { args: [[[1, 5], [0, 0]]], kind: 'edge' },
      { args: [[[1, 5], [6, 8]]], kind: 'edge' },
      { args: [[[3, 5], [12, 15], [1, 2]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Rotate Array',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'array', minN: 1, maxN: 15, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const arr = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
      const k = randInt(rng, 0, n * 2);
      return [arr, k];
    },
    statement:
      'Given an integer array `nums`, rotate the array to the **right** by `k` steps, where `k` may be larger than the array length (wrapping around more than once).',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- `0 <= k <= 10^5`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: 'The array after rotating right by `k` steps, space-separated.',
    hints: [
      'A rotation by `k` is the same as a rotation by `k mod n` — anything beyond one full lap is wasted motion.',
      'After rotating right by `k`, the last `k` elements move to the front, and everything else shifts right by `k`.',
      "You can produce the rotated array directly by slicing: take the last `k` elements followed by the first `n - k` elements.",
    ],
    solutionApproach:
      'Reduce `k` modulo `n` (the array length) since rotating by a full array length is a no-op. The rotated array is then simply the last `k` elements followed by the first `n - k` elements. The classic in-place trick (reverse the whole array, then reverse each of the two segments) achieves this with O(1) extra space; here the judge returns a new array for stdout purposes. O(n) time.',
    pythonSolutionCode:
      'def rotate_array(nums, k):\n    n = len(nums)\n    if n == 0:\n        return []\n    k %= n\n    return nums[n - k:] + nums[: n - k]\n',
    solve: (nums, k) => {
      const n = nums.length;
      if (n === 0) return [];
      const kk = ((k % n) + n) % n;
      return [...nums.slice(n - kk), ...nums.slice(0, n - kk)];
    },
    exampleExplanation: (args, result) => `Rotating [${args[0].join(',')}] right by ${args[1]} step(s) gives [${result.join(',')}].`,
    edgeCases: [
      { args: [[1], 0], kind: 'edge' },
      { args: [[1], 5], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7], 3], kind: 'edge' },
      { args: [[-1, -100, 3, 99], 2], kind: 'edge' },
      { args: [[1, 2, 3], 0], kind: 'edge' },
      { args: [[1, 2, 3], 9], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Rotate Image',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'matrix', minSize: 1, maxSize: 6, min: -20, max: 20 },
    genArgs: (rng, cfg) => {
      const size = randInt(rng, cfg.minSize ?? 1, cfg.maxSize ?? 6);
      const matrix = Array.from({ length: size }, () => randIntArray(rng, size, cfg.min ?? -20, cfg.max ?? 20));
      return [matrix];
    },
    statement:
      'You are given an `n x n` 2D `matrix`. Rotate it 90 degrees clockwise, in place, and return the rotated matrix.',
    constraints: '- `1 <= n <= 20`\n- `-1000 <= matrix[i][j] <= 1000`\n- The matrix is always square (`n x n`).',
    inputFormat: 'Line 1: `rows cols` (equal, since the matrix is square). Next `rows` lines: `cols` space-separated integers each.',
    outputFormat: '`rows` lines of `cols` space-separated integers: the matrix after rotating 90 degrees clockwise.',
    hints: [
      'Think about where the element at row `r`, column `c` needs to end up after a 90-degree clockwise turn.',
      'For an `n x n` matrix, the clockwise rotation sends `matrix[r][c]` to `result[c][n-1-r]`.',
      'A common in-place trick is to transpose the matrix (swap across the main diagonal) and then reverse each row — verify that produces the same mapping.',
    ],
    solutionApproach:
      'For an `n x n` matrix, rotating 90 degrees clockwise maps the element at `(r, c)` to `(c, n-1-r)` in the result. Building this directly into a new matrix takes O(n^2) time. The equivalent in-place technique (used when extra space is disallowed) is to transpose the matrix and then reverse each row.',
    pythonSolutionCode:
      'def rotate_image(matrix):\n    n = len(matrix)\n    res = [[0] * n for _ in range(n)]\n    for r in range(n):\n        for c in range(n):\n            res[c][n - 1 - r] = matrix[r][c]\n    return res\n',
    solve: (matrix) => {
      const n = matrix.length;
      const res = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let r = 0; r < n; r += 1) {
        for (let c = 0; c < n; c += 1) {
          res[c][n - 1 - r] = matrix[r][c];
        }
      }
      return res;
    },
    exampleExplanation: (args) => `The ${args[0].length}x${args[0].length} matrix is rotated 90 degrees clockwise.`,
    edgeCases: [
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 2], [3, 4]]], kind: 'edge' },
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], kind: 'edge' },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], kind: 'edge' },
      { args: [[[-1, -2], [-3, -4]]], kind: 'edge' },
      { args: [[[0, 0], [0, 0]]], kind: 'edge' },
    ],
  },
];
