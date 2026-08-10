import { randInt, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Best Time to Buy and Sell Stock II',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 1000 },
    statement:
      'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`.\n\nUnlike the single-transaction version of this problem, you may buy and sell the stock as many times as you like. You must sell your current holding before you can buy again (you can never hold more than one share at a time). Return the maximum total profit you can achieve.',
    constraints: '- `1 <= prices.length <= 10^5`\n- `0 <= prices[i] <= 10^4`',
    inputFormat: 'Line 1: the array `prices`, space-separated.',
    outputFormat: 'A single integer: the maximum total profit achievable.',
    hints: [
      'With unlimited transactions, you never need to "hold" through a dip — you can always sell right before a drop and rebuy right after.',
      'Think about what happens if you buy and sell on every single day where the price goes up compared to the day before.',
      'The maximum total profit is just the sum of every positive day-to-day price increase.',
    ],
    solutionApproach:
      'Because there is no limit on the number of transactions, the optimal strategy captures every upward move: walk the array once and, whenever `prices[i] > prices[i-1]`, add that difference to the running total (conceptually buying at `i-1` and selling at `i`). Summing all positive consecutive differences gives the same result as summing over the true optimal set of buy/sell pairs. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def max_profit(prices):\n    profit = 0\n    for i in range(1, len(prices)):\n        if prices[i] > prices[i - 1]:\n            profit += prices[i] - prices[i - 1]\n    return profit\n',
    solve: (prices) => {
      let profit = 0;
      for (let i = 1; i < prices.length; i += 1) {
        if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
      }
      return profit;
    },
    exampleExplanation: (args, result) =>
      result > 0
        ? `Buying and selling on every profitable up-move yields a total profit of ${result}.`
        : 'Prices never increase day over day, so the best strategy is not to trade — profit is 0.',
    edgeCases: [
      { args: [[5]], kind: 'edge' },
      { args: [[7, 1, 5, 3, 6, 4]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[7, 6, 4, 3, 1]], kind: 'edge' },
      { args: [[1, 2, 1, 2, 1, 2]], kind: 'edge' },
      { args: [[2, 2, 2, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Best Time to Buy and Sell Stock III',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 1000 },
    statement:
      'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`.\n\nYou may complete **at most two transactions** in total (a transaction is one buy followed by one later sell). You must sell before you buy again — you can never hold more than one share at once. Return the maximum total profit achievable with at most two transactions.',
    constraints: '- `1 <= prices.length <= 10^5`\n- `0 <= prices[i] <= 10^5`',
    inputFormat: 'Line 1: the array `prices`, space-separated.',
    outputFormat: 'A single integer: the maximum total profit using at most two transactions.',
    hints: [
      'With a limit of two transactions, greedily taking every up-move (like the unlimited-transaction version) can overcount — you need to track state.',
      'Track four running values as you scan once: profit after first buy, after first sell, after second buy, after second sell.',
      'Each state can only improve using the value of the state right before it on the same day: `buy1 = max(buy1, -price)`, `sell1 = max(sell1, buy1 + price)`, and so on for the second pair.',
    ],
    solutionApproach:
      "Track four quantities while scanning once: `buy1` (max profit after buying once, i.e. the negative of the cheapest effective purchase so far), `sell1` (max profit after completing one transaction), `buy2` (max profit after buying a second time, funded by `sell1`), and `sell2` (max profit after completing two transactions). At each price, update in order: `buy1 = max(buy1, -price)`, `sell1 = max(sell1, buy1 + price)`, `buy2 = max(buy2, sell1 - price)`, `sell2 = max(sell2, buy2 + price)`. The answer is `sell2`. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def max_profit(prices):\n    buy1 = buy2 = float("-inf")\n    sell1 = sell2 = 0\n    for p in prices:\n        buy1 = max(buy1, -p)\n        sell1 = max(sell1, buy1 + p)\n        buy2 = max(buy2, sell1 - p)\n        sell2 = max(sell2, buy2 + p)\n    return sell2\n',
    solve: (prices) => {
      let buy1 = -Infinity;
      let buy2 = -Infinity;
      let sell1 = 0;
      let sell2 = 0;
      for (const p of prices) {
        buy1 = Math.max(buy1, -p);
        sell1 = Math.max(sell1, buy1 + p);
        buy2 = Math.max(buy2, sell1 - p);
        sell2 = Math.max(sell2, buy2 + p);
      }
      return sell2;
    },
    exampleExplanation: (args, result) => `Using at most two buy/sell pairs, the best achievable total profit is ${result}.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[3, 3, 5, 0, 0, 3, 1, 4]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[7, 6, 4, 3, 1]], kind: 'edge' },
      { args: [[1, 2, 4, 2, 5, 7, 2, 4, 9, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Product of Array Except Self',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 2, maxN: 15, min: -20, max: 20 },
    statement:
      'Given an integer array `nums`, return an array `answer` such that `answer[i]` equals the product of every element of `nums` except `nums[i]`.\n\nYou must solve it **without using division**, in `O(n)` time.',
    constraints: '- `2 <= nums.length <= 10^5`\n- `-30 <= nums[i] <= 30`\n- The product of any prefix or suffix fits in a 32-bit integer.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The array `answer`, space-separated.',
    hints: [
      "Division would be the obvious shortcut, but it breaks when any element is 0 — and it's disallowed anyway.",
      'For each index, the answer is "product of everything to its left" times "product of everything to its right" — compute those two pieces separately.',
      'Build a prefix-products array left-to-right, then fold in suffix products with a single pass right-to-left, reusing one accumulator variable instead of a second array.',
    ],
    solutionApproach:
      "Make one left-to-right pass building `answer[i] = product of all elements before i` (a running `prefix` accumulator, starting at 1). Then make one right-to-left pass with a running `suffix` accumulator, multiplying it into `answer[i]` as you go. After both passes, `answer[i]` holds prefix(i) * suffix(i), i.e. the product of everything except `nums[i]` — with no division and O(n) time, O(1) extra space beyond the output array.",
    pythonSolutionCode:
      'def product_except_self(nums):\n    n = len(nums)\n    answer = [1] * n\n    prefix = 1\n    for i in range(n):\n        answer[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        answer[i] *= suffix\n        suffix *= nums[i]\n    return answer\n',
    solve: (nums) => {
      const n = nums.length;
      const answer = new Array(n).fill(1);
      let prefix = 1;
      for (let i = 0; i < n; i += 1) {
        answer[i] = prefix;
        prefix *= nums[i];
      }
      let suffix = 1;
      for (let i = n - 1; i >= 0; i -= 1) {
        answer[i] *= suffix;
        suffix *= nums[i];
      }
      return answer;
    },
    exampleExplanation: () => 'Each output position holds the product of the prefix and suffix products around it, computed without division.',
    edgeCases: [
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[-1, 1, 0, -3, 3]], kind: 'edge' },
      { args: [[0, 0]], kind: 'edge' },
      { args: [[2, 3]], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
      { args: [[-1, -2, -3, -4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find Peak Element',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -100, max: 100 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const arr = [];
      for (let i = 0; i < n; i += 1) {
        let v;
        do {
          v = randInt(rng, cfg.min ?? -100, cfg.max ?? 100);
        } while (arr.length > 0 && v === arr[arr.length - 1]);
        arr.push(v);
      }
      return [arr];
    },
    statement:
      'A peak element in an integer array `nums` is an element strictly greater than its neighbors. Given `nums`, return the index of **any one** peak element.\n\nTreat the array as if `nums[-1] = nums[n] = -infinity` (so the first and last elements only need to beat their single real neighbor). It is guaranteed that no two adjacent elements are equal, so a peak always exists.\n\n**Judging note:** since multiple valid peaks can exist, this judge grades against one specific deterministic answer: the index found by binary search that moves right whenever `nums[mid] < nums[mid+1]` and left otherwise (the standard textbook peak-finding binary search).',
    constraints: '- `1 <= nums.length <= 1000`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- `nums[i] != nums[i+1]` for every valid `i`.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the index of a peak element.',
    hints: [
      'Checking every index for "bigger than both neighbors" works in O(n), but the adjacency guarantee hints at something faster.',
      'At the midpoint, if the next element is larger, a peak must exist somewhere to the right (values are climbing); if the next element is smaller, a peak must exist at or before the midpoint.',
      'This lets you binary search: repeatedly shrink the search range toward a peak in O(log n), without ever having to look at the whole array.',
    ],
    solutionApproach:
      'Binary search on the "slope" between adjacent elements. Compare `nums[mid]` to `nums[mid+1]`: if `nums[mid] < nums[mid+1]`, the array is still rising, so a peak must exist to the right and you move `lo = mid + 1`; otherwise a peak exists at `mid` or to its left, so you move `hi = mid`. The loop ends when `lo === hi`, which is guaranteed to be a peak index. O(log n) time, O(1) space.',
    pythonSolutionCode:
      'def find_peak_element(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < nums[mid + 1]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n',
    solve: (nums) => {
      let lo = 0;
      let hi = nums.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    exampleExplanation: (args, result) => `Index ${result} (value ${args[0][result]}) is greater than each of its real neighbors.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[2, 1]], kind: 'edge' },
      { args: [[1, 2, 1, 3, 5, 6, 4]], kind: 'edge' },
      { args: [[1, 2, 3, 1]], kind: 'edge' },
      { args: [[5, 10, 20, 15]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Search in Rotated Sorted Array',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const lo = cfg.min ?? -1000;
      const hi = cfg.max ?? 1000;
      const values = new Set();
      while (values.size < n) values.add(randInt(rng, lo, hi));
      const sorted = [...values].sort((a, b) => a - b);
      const k = randInt(rng, 0, n - 1);
      const rotated = sorted.slice(k).concat(sorted.slice(0, k));
      let target;
      if (rng() < 0.7) {
        target = rotated[randInt(rng, 0, n - 1)];
      } else {
        do {
          target = randInt(rng, lo - 10, hi + 10);
        } while (values.has(target));
      }
      return [rotated, target];
    },
    statement:
      'An array of **distinct** integers, originally sorted in ascending order, was rotated at some unknown pivot (e.g. `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`).\n\nGiven the rotated array `nums` and an integer `target`, return the index of `target` in `nums`, or `-1` if it is not present. Your solution must run in `O(log n)` time.',
    constraints: '- `1 <= nums.length <= 5000`\n- `-10^4 <= nums[i] <= 10^4`\n- All values in `nums` are unique.\n- `nums` is guaranteed to be a rotation of an array sorted in ascending order.',
    inputFormat: 'Line 1: the rotated array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the index of `target`, or `-1` if it is not in the array.',
    hints: [
      'A plain linear scan finds it in O(n), but the fact that the array is "sorted, then rotated once" should suggest a faster approach.',
      'At any midpoint, at least one of the two halves (left of mid, or right of mid) is guaranteed to still be normally sorted — figure out which half that is by comparing the endpoints.',
      'Once you know which half is properly sorted, you can cheaply check whether the target lies within that half\'s range and recurse into the correct side, just like ordinary binary search.',
    ],
    solutionApproach:
      "Binary search with an extra decision step. At each `mid`, one of `nums[lo..mid]` or `nums[mid..hi]` must be a normally-ordered (non-rotated) run — determine which by comparing `nums[lo]` to `nums[mid]`. If the left half is sorted and `target` falls within `[nums[lo], nums[mid])`, search left; otherwise search right (and symmetrically when the right half is the sorted one). This keeps every step O(1) work while still halving the search space, giving O(log n) time overall.",
    pythonSolutionCode:
      'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1\n',
    solve: (nums, target) => {
      let lo = 0;
      let hi = nums.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;
        if (nums[lo] <= nums[mid]) {
          if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
          else lo = mid + 1;
        } else if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
        else hi = mid - 1;
      }
      return -1;
    },
    exampleExplanation: (args, result) =>
      result >= 0 ? `target = ${args[1]} is found at index ${result}.` : `target = ${args[1]} does not appear in the array.`,
    edgeCases: [
      { args: [[1], 0], kind: 'edge' },
      { args: [[1], 1], kind: 'edge' },
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], kind: 'edge' },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], kind: 'edge' },
      { args: [[5, 1, 3], 5], kind: 'edge' },
      { args: [[1, 3], 3], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Search in Rotated Sorted Array II',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const lo = cfg.min ?? -50;
      const hi = cfg.max ?? 50;
      const base = [];
      for (let i = 0; i < n; i += 1) base.push(randInt(rng, lo, hi));
      base.sort((a, b) => a - b);
      const k = randInt(rng, 0, n - 1);
      const rotated = base.slice(k).concat(base.slice(0, k));
      let target;
      if (rng() < 0.6) {
        target = rotated[randInt(rng, 0, n - 1)];
      } else {
        target = randInt(rng, lo - 5, hi + 5);
      }
      return [rotated, target];
    },
    statement:
      'This is the follow-up to "Search in Rotated Sorted Array" where `nums` **may contain duplicate values**.\n\nGiven a possibly-rotated array `nums` (originally sorted ascending, then rotated at an unknown pivot, possibly with duplicates) and an integer `target`, return `true` if `target` exists in `nums`, and `false` otherwise.',
    constraints: '- `1 <= nums.length <= 5000`\n- `-100 <= nums[i], target <= 100`\n- `nums` is guaranteed to be a rotation of a non-decreasing sorted array (duplicates allowed).',
    inputFormat: 'Line 1: the rotated array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: '`true` or `false`.',
    hints: [
      "The duplicate-free trick of comparing `nums[lo]` to `nums[mid]` to find the sorted half can be fooled when `nums[lo] === nums[mid]` but the two halves actually differ (e.g. `[1,0,1,1,1]`).",
      "When you can't tell which half is sorted because of a tie between `nums[lo]`, `nums[mid]`, and `nums[hi]`, it's safe to just shrink the search window by one from both ends and try again.",
      'Everywhere else, the same "find the normally-sorted half, then check if target lies in its range" logic from the distinct-values version still applies.',
    ],
    solutionApproach:
      "Same binary search as the distinct-values version, with one extra escape hatch: whenever `nums[lo] === nums[mid] === nums[hi]`, you cannot tell which side is the rotated one, so shrink the window with `lo += 1; hi -= 1` and continue. Otherwise, use whichever side is properly ordered (`nums[lo] <= nums[mid]` means the left side is sorted) to decide whether `target` could lie there, and move `lo`/`hi` accordingly. Worst case (all duplicates) degrades to O(n), but it is O(log n) on typical inputs.",
    pythonSolutionCode:
      'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return True\n        if nums[lo] == nums[mid] and nums[mid] == nums[hi]:\n            lo += 1\n            hi -= 1\n        elif nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return False\n',
    solve: (nums, target) => {
      let lo = 0;
      let hi = nums.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return true;
        if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) {
          lo += 1;
          hi -= 1;
        } else if (nums[lo] <= nums[mid]) {
          if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
          else lo = mid + 1;
        } else if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
        else hi = mid - 1;
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result ? `target = ${args[1]} is present somewhere in the array.` : `target = ${args[1]} does not appear in the array.`,
    edgeCases: [
      { args: [[1, 0, 1, 1, 1], 0], kind: 'edge' },
      { args: [[2, 5, 6, 0, 0, 1, 2], 0], kind: 'edge' },
      { args: [[2, 5, 6, 0, 0, 1, 2], 3], kind: 'edge' },
      { args: [[1, 1, 1, 1, 1, 1], 2], kind: 'edge' },
      { args: [[1], 1], kind: 'edge' },
      { args: [[3, 1, 2, 3, 3, 3, 3], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find Minimum in Rotated Sorted Array',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const lo = cfg.min ?? -1000;
      const hi = cfg.max ?? 1000;
      const values = new Set();
      while (values.size < n) values.add(randInt(rng, lo, hi));
      const sorted = [...values].sort((a, b) => a - b);
      const k = randInt(rng, 0, n - 1);
      return [sorted.slice(k).concat(sorted.slice(0, k))];
    },
    statement:
      'An array of **distinct** integers, originally sorted ascending, was rotated between `1` and `n` times at an unknown pivot. Given the rotated array `nums`, return the minimum element.\n\nYour solution must run in `O(log n)` time.',
    constraints: '- `1 <= nums.length <= 5000`\n- `-5000 <= nums[i] <= 5000`\n- All values in `nums` are unique.',
    inputFormat: 'Line 1: the rotated array `nums`, space-separated.',
    outputFormat: 'A single integer: the minimum value in the array.',
    hints: [
      "A linear scan for the smallest value works in O(n), but the rotation structure allows something faster.",
      "Compare the middle element to the last element: if `nums[mid] > nums[hi]`, the minimum must be strictly to the right of `mid` (the rotation point is over there); otherwise the minimum is at `mid` or to its left.",
      'Binary search using that comparison, always keeping the minimum inside your `[lo, hi]` window, until the window collapses to a single index.',
    ],
    solutionApproach:
      'Binary search comparing `nums[mid]` against `nums[hi]`. If `nums[mid] > nums[hi]`, the rotation pivot (and thus the minimum) lies strictly after `mid`, so set `lo = mid + 1`. Otherwise, `nums[mid]` could itself be the minimum, so keep it in range with `hi = mid`. When `lo === hi`, that index holds the minimum. O(log n) time, O(1) space.',
    pythonSolutionCode:
      'def find_min(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] > nums[hi]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return nums[lo]\n',
    solve: (nums) => {
      let lo = 0;
      let hi = nums.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
      }
      return nums[lo];
    },
    exampleExplanation: (args, result) => `The rotation point sits right before the minimum value, ${result}.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[3, 1, 2]], kind: 'edge' },
      { args: [[4, 5, 6, 7, 0, 1, 2]], kind: 'edge' },
      { args: [[11, 13, 15, 17]], kind: 'edge' },
      { args: [[2, 1]], kind: 'edge' },
      { args: [[5, 1, 2, 3, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Container With Most Water',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 2, maxN: 15, min: 0, max: 1000 },
    statement:
      'You are given an array `height` of `n` non-negative integers, where `height[i]` represents the height of a vertical line drawn at position `i`.\n\nChoose two lines that, together with the x-axis, form a container holding the most water. Return the maximum amount of water the container can store. (The container\'s width is the distance between the two chosen positions, and its water level is limited by the shorter of the two lines.)',
    constraints: '- `2 <= height.length <= 10^5`\n- `0 <= height[i] <= 10^4`',
    inputFormat: 'Line 1: the array `height`, space-separated.',
    outputFormat: 'A single integer: the maximum water area achievable.',
    hints: [
      'Checking every pair of lines is O(n^2) — the width you give up by moving a pointer inward has to be "worth it" some other way.',
      'Start with the widest possible container (the two end lines) and think about which side to move inward: moving the taller line in can never help, since width shrinks and the limiting height can only stay the same or get worse.',
      "Always move the pointer at the shorter line inward — that's the only move that has a chance of finding a taller limiting height to compensate for the lost width.",
    ],
    solutionApproach:
      'Two pointers starting at the two ends of the array. At each step compute the area as `min(height[l], height[r]) * (r - l)` and track the best seen. Always advance the pointer at the shorter line inward: since area is capped by the shorter side, keeping the taller line in place can never lose you a better answer, while the shorter side is the only one that has any chance of increasing the limiting height. This explores the useful search space in O(n) time, O(1) space.',
    pythonSolutionCode:
      'def max_area(height):\n    l, r = 0, len(height) - 1\n    best = 0\n    while l < r:\n        best = max(best, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return best\n',
    solve: (height) => {
      let l = 0;
      let r = height.length - 1;
      let best = 0;
      while (l < r) {
        best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l += 1;
        else r -= 1;
      }
      return best;
    },
    exampleExplanation: (args, result) => `The best pair of lines traps a maximum water area of ${result}.`,
    edgeCases: [
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], kind: 'edge' },
      { args: [[1, 2, 1]], kind: 'edge' },
      { args: [[4, 3, 2, 1, 4]], kind: 'edge' },
      { args: [[1, 2, 4, 3]], kind: 'edge' },
      { args: [[0, 0, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Trapping Rain Water',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 100 },
    statement:
      "Given `n` non-negative integers `height` representing an elevation map where each bar has width `1`, compute how much rainwater the map can trap after it rains.\n\nWater sits above position `i` up to the height of the shorter of the tallest bar to its left and the tallest bar to its right, minus the bar's own height (never negative).",
    constraints: '- `1 <= height.length <= 2*10^4`\n- `0 <= height[i] <= 10^5`',
    inputFormat: 'Line 1: the array `height`, space-separated.',
    outputFormat: 'A single integer: the total units of water trapped.',
    hints: [
      "The water trapped above any position depends on the tallest wall to its left AND the tallest wall to its right — the smaller of those two, minus this position's own height.",
      'You could precompute a "max height so far from the left" array and a "max height so far from the right" array, then combine them in one pass.',
      'You can avoid the extra arrays entirely with two pointers from both ends, always advancing the side whose running max is currently smaller — that side\'s water level is already fully determined.',
    ],
    solutionApproach:
      'Two pointers `l` and `r` starting at the ends, tracking `leftMax` and `rightMax` seen so far from each side. Whenever `height[l] <= height[r]`, the water level above `l` is capped by `leftMax` (since some wall at least as tall as `leftMax` exists on the right, guaranteed by `height[r] >= height[l]`), so add `leftMax - height[l]` to the total and advance `l` (updating `leftMax` first). Do the symmetric thing on the right otherwise. This computes the exact trapped volume in one O(n) pass with O(1) space.',
    pythonSolutionCode:
      'def trap(height):\n    l, r = 0, len(height) - 1\n    left_max = right_max = 0\n    water = 0\n    while l < r:\n        if height[l] <= height[r]:\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n            l += 1\n        else:\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n            r -= 1\n    return water\n',
    solve: (height) => {
      let l = 0;
      let r = height.length - 1;
      let leftMax = 0;
      let rightMax = 0;
      let water = 0;
      while (l < r) {
        if (height[l] <= height[r]) {
          leftMax = Math.max(leftMax, height[l]);
          water += leftMax - height[l];
          l += 1;
        } else {
          rightMax = Math.max(rightMax, height[r]);
          water += rightMax - height[r];
          r -= 1;
        }
      }
      return water;
    },
    exampleExplanation: (args, result) =>
      result > 0 ? `The elevation map traps a total of ${result} units of water.` : 'The terrain has no basins, so no water is trapped.',
    edgeCases: [
      { args: [[0]], kind: 'edge' },
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], kind: 'edge' },
      { args: [[4, 2, 0, 3, 2, 5]], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[1, 0, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Jump Game',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15, min: 0, max: 10 },
    statement:
      'You are given an integer array `nums`, starting at index `0`. Each `nums[i]` is the maximum number of steps you can jump forward from index `i`.\n\nReturn `true` if you can reach the last index, and `false` otherwise.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `0 <= nums[i] <= 1000`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: '`true` or `false`.',
    hints: [
      "You don't need to try every possible sequence of jumps — track the furthest index reachable so far as you scan left to right.",
      'If you ever reach a position beyond the furthest index reachable so far, you are stuck and can never move forward — that\'s an immediate `false`.',
      'Otherwise, keep updating "furthest reachable" as `max(furthest, i + nums[i])` at every index; if it ever covers the last index, you can make it.',
    ],
    solutionApproach:
      'Greedy one-pass: maintain `reach`, the furthest index reachable so far, starting at `0`. Scan `i` from `0` to `n-1`; if `i > reach`, index `i` is unreachable so return `false` immediately. Otherwise update `reach = max(reach, i + nums[i])`. If the loop finishes without getting stuck, `reach` will have covered the last index, so return `true`. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def can_jump(nums):\n    reach = 0\n    for i, n in enumerate(nums):\n        if i > reach:\n            return False\n        reach = max(reach, i + n)\n    return True\n',
    solve: (nums) => {
      let reach = 0;
      for (let i = 0; i < nums.length; i += 1) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
      }
      return true;
    },
    exampleExplanation: (args, result) => (result ? 'The last index is reachable by some sequence of jumps.' : 'You get stuck before reaching the last index.'),
    edgeCases: [
      { args: [[0]], kind: 'edge' },
      { args: [[2, 3, 1, 1, 4]], kind: 'edge' },
      { args: [[3, 2, 1, 0, 4]], kind: 'edge' },
      { args: [[0, 1]], kind: 'edge' },
      { args: [[1, 0, 1, 0]], kind: 'edge' },
      { args: [[2, 0, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Jump Game II',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 1, max: 10 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const maxJump = cfg.max ?? 10;
      const arr = [];
      for (let i = 0; i < n - 1; i += 1) arr.push(randInt(rng, 1, maxJump));
      arr.push(randInt(rng, 0, maxJump));
      return [arr];
    },
    statement:
      'You are given an integer array `nums`, starting at index `0`. Each `nums[i]` is the maximum number of steps you can jump forward from index `i`. It is guaranteed that you can always reach the last index.\n\nReturn the **minimum number of jumps** required to reach the last index.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `0 <= nums[i] <= 1000`\n- It is always possible to reach `nums.length - 1`.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the minimum number of jumps needed to reach the last index.',
    hints: [
      "Think of it as a level-by-level BFS over reachable indices: everything reachable within one jump is 'level 1', everything reachable from there is 'level 2', and so on.",
      'You can simulate that BFS greedily without a queue: track the furthest index reachable using jumps counted so far, and the furthest reachable using one more jump.',
      "Whenever your scan reaches the boundary of the current jump's range, you're forced to take another jump — increment the counter and extend the boundary to the furthest reachable so far.",
    ],
    solutionApproach:
      "Greedy BFS-by-levels in one pass. Track `curEnd` (the furthest index reachable using the jumps taken so far) and `farthest` (the furthest index reachable using one more jump from anything visited so far). As you scan `i` from `0` to `n-2`, update `farthest = max(farthest, i + nums[i])`. Whenever `i` reaches `curEnd`, you've exhausted the current jump's range, so increment the jump counter and set `curEnd = farthest`. Because reachability is guaranteed, this always finds the minimum jump count in O(n) time, O(1) space.",
    pythonSolutionCode:
      'def jump(nums):\n    jumps = 0\n    cur_end = 0\n    farthest = 0\n    for i in range(len(nums) - 1):\n        farthest = max(farthest, i + nums[i])\n        if i == cur_end:\n            jumps += 1\n            cur_end = farthest\n    return jumps\n',
    solve: (nums) => {
      let jumps = 0;
      let curEnd = 0;
      let farthest = 0;
      for (let i = 0; i < nums.length - 1; i += 1) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i === curEnd) {
          jumps += 1;
          curEnd = farthest;
        }
      }
      return jumps;
    },
    exampleExplanation: (args, result) => `The last index can be reached in as few as ${result} jump(s).`,
    edgeCases: [
      { args: [[0]], kind: 'edge' },
      { args: [[2, 3, 1, 1, 4]], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[2, 1]], kind: 'edge' },
      { args: [[1, 2, 1, 1, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sort Colors',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: 0, max: 2 },
    statement:
      "Given an array `nums` where each element is `0`, `1`, or `2` (representing the colors red, white, and blue), sort the array **in place** so that objects of the same color are grouped together, in the order red, white, then blue (i.e. ascending order). Return the sorted array.\n\nSolve it in one pass without using a library sort.",
    constraints: '- `1 <= nums.length <= 300`\n- `nums[i]` is `0`, `1`, or `2`.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The array after sorting, space-separated.',
    hints: [
      "Since there are only three distinct values, a full comparison sort is overkill — think about partitioning into three regions instead.",
      'Maintain three regions of the array as you scan once: a "definitely 0s" region at the front, a "definitely 2s" region at the back, and an unexamined middle region.',
      'Use three pointers — `low`, `mid`, `high` — where `mid` scans forward: a `0` at `mid` swaps with `low` (both advance), a `1` at `mid` just advances `mid`, and a `2` at `mid` swaps with `high` (only `high` retreats, since the swapped-in value still needs checking).',
    ],
    solutionApproach:
      "This is the Dutch National Flag partitioning algorithm. Maintain three pointers: `low` (boundary of the 0s region), `mid` (current element being examined), and `high` (boundary of the 2s region). While `mid <= high`: if `nums[mid] === 0`, swap it with `nums[low]` and advance both `low` and `mid`; if `nums[mid] === 1`, just advance `mid`; if `nums[mid] === 2`, swap it with `nums[high]` and decrement `high` only (the newly swapped-in value at `mid` still needs to be examined). One pass, O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def sort_colors(nums):\n    nums = list(nums)\n    low, mid, high = 0, 0, len(nums) - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1\n            mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1\n    return nums\n',
    solve: (nums) => {
      const arr = [...nums];
      let low = 0;
      let mid = 0;
      let high = arr.length - 1;
      while (mid <= high) {
        if (arr[mid] === 0) {
          [arr[low], arr[mid]] = [arr[mid], arr[low]];
          low += 1;
          mid += 1;
        } else if (arr[mid] === 1) {
          mid += 1;
        } else {
          [arr[mid], arr[high]] = [arr[high], arr[mid]];
          high -= 1;
        }
      }
      return arr;
    },
    exampleExplanation: () => 'All 0s are grouped first, then all 1s, then all 2s.',
    edgeCases: [
      { args: [[0]], kind: 'edge' },
      { args: [[2, 0, 2, 1, 1, 0]], kind: 'edge' },
      { args: [[2, 0, 1]], kind: 'edge' },
      { args: [[0, 0, 0]], kind: 'edge' },
      { args: [[2, 2, 2]], kind: 'edge' },
      { args: [[1, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Next Permutation',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: 0, max: 9 },
    statement:
      'Given an array of integers `nums`, rearrange it into the **next lexicographically greater permutation** of its elements, in place.\n\nIf no such permutation exists (the array is already the highest possible permutation, i.e. sorted in fully descending order), rearrange it into the lowest possible order (fully ascending) instead. Return the resulting array.',
    constraints: '- `1 <= nums.length <= 100`\n- `0 <= nums[i] <= 100`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The next permutation of `nums`, space-separated.',
    hints: [
      "The next permutation only needs to change the shortest possible suffix of the array — find the longest suffix that is already non-increasing (fully sorted descending).",
      "The element right before that non-increasing suffix is your 'pivot' — it needs to be swapped with the smallest suffix value that's still larger than it.",
      "After swapping in the right value at the pivot, the suffix is still sorted descending — reverse it to make it ascending, which yields the smallest possible arrangement for that suffix.",
    ],
    solutionApproach:
      "Scan from the right to find the largest index `i` such that `nums[i] < nums[i+1]` (the first place, from the end, where the sequence isn't descending). If no such `i` exists, the whole array is descending and is already the last permutation, so just reverse it entirely. Otherwise, scan from the right again to find the largest index `j > i` with `nums[j] > nums[i]`, swap `nums[i]` and `nums[j]`, then reverse the suffix starting at `i+1` (which is guaranteed to still be in descending order) to put it in ascending order — the smallest arrangement for that tail. O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def next_permutation(nums):\n    nums = list(nums)\n    n = len(nums)\n    i = n - 2\n    while i >= 0 and nums[i] >= nums[i + 1]:\n        i -= 1\n    if i >= 0:\n        j = n - 1\n        while nums[j] <= nums[i]:\n            j -= 1\n        nums[i], nums[j] = nums[j], nums[i]\n    nums[i + 1:] = reversed(nums[i + 1:])\n    return nums\n',
    solve: (nums) => {
      const arr = [...nums];
      let i = arr.length - 2;
      while (i >= 0 && arr[i] >= arr[i + 1]) i -= 1;
      if (i >= 0) {
        let j = arr.length - 1;
        while (arr[j] <= arr[i]) j -= 1;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      let l = i + 1;
      let r = arr.length - 1;
      while (l < r) {
        [arr[l], arr[r]] = [arr[r], arr[l]];
        l += 1;
        r -= 1;
      }
      return arr;
    },
    exampleExplanation: () => 'The array is rearranged into the smallest permutation that is strictly greater than the input.',
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[3, 2, 1]], kind: 'edge' },
      { args: [[1, 1, 5]], kind: 'edge' },
      { args: [[1, 3, 2]], kind: 'edge' },
      { args: [[2, 3, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Majority Element',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -100, max: 100 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const lo = cfg.min ?? -100;
      const hi = cfg.max ?? 100;
      const majorityVal = randInt(rng, lo, hi);
      const majCount = Math.floor(n / 2) + 1;
      const arr = Array.from({ length: majCount }, () => majorityVal);
      for (let i = majCount; i < n; i += 1) arr.push(randInt(rng, lo, hi));
      return [shuffle(rng, arr)];
    },
    statement:
      "Given an integer array `nums` of size `n`, return the **majority element** — the value that appears more than `floor(n / 2)` times. It is guaranteed that a majority element always exists in the array.",
    constraints: '- `1 <= nums.length <= 5*10^4`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- A majority element is guaranteed to exist.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the majority element.',
    hints: [
      'Counting every value with a hash map works in O(n) time and O(n) space — can you do it with O(1) space instead?',
      "Since a value appearing more than half the time is guaranteed, think about what happens if you keep a 'current candidate' and a counter, incrementing on a match and decrementing on a mismatch.",
      "This is the Boyer-Moore voting algorithm: whenever the counter hits zero, discard the old candidate and pick the current element as the new candidate — the true majority element can never be fully cancelled out.",
    ],
    solutionApproach:
      'Boyer-Moore voting algorithm: keep a `candidate` and a `count` (starting at 0). For each number, if `count === 0`, set `candidate` to that number. Then increment `count` if the number equals `candidate`, otherwise decrement it. Because the majority element occurs more than `n/2` times, it can never be fully cancelled out by all other elements combined, so `candidate` at the end is guaranteed to be the majority element. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def majority_element(nums):\n    candidate = None\n    count = 0\n    for n in nums:\n        if count == 0:\n            candidate = n\n        count += 1 if n == candidate else -1\n    return candidate\n',
    solve: (nums) => {
      let candidate = null;
      let count = 0;
      for (const n of nums) {
        if (count === 0) candidate = n;
        count += n === candidate ? 1 : -1;
      }
      return candidate;
    },
    exampleExplanation: (args, result) => `The value ${result} appears more than floor(n / 2) times in the array.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[3, 2, 3]], kind: 'edge' },
      { args: [[2, 2, 1, 1, 1, 2, 2]], kind: 'edge' },
      { args: [[1, 1, 1, 2, 2]], kind: 'edge' },
      { args: [[5, 5, 5, 5, 1, 2, 3]], kind: 'edge' },
      { args: [[7, 7]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Majority Element II',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: -50, max: 50 },
    statement:
      "Given an integer array `nums` of size `n`, return all values that appear **more than `floor(n / 3)` times**. There can be at most two such values.\n\n**Judging note:** the result is printed as the qualifying values in ascending order (there is no meaningful \"natural\" order for this output, so ascending order is the canonical, deterministic answer this judge expects).",
    constraints: '- `1 <= nums.length <= 5*10^4`\n- `-10^9 <= nums[i] <= 10^9`\n- At most two values can appear more than `floor(n/3)` times, and the array may have zero, one, or two such values.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The qualifying values, ascending, space-separated (an empty line if none qualify).',
    hints: [
      'At most two values can ever appear more than n/3 times — that bound is the key hint toward the technique.',
      'Extend the majority-vote idea (candidate + counter) to track **two** candidates and two counters at once, decrementing both when an element matches neither.',
      "The two candidates found by voting are only guaranteed to be correct if they actually clear the n/3 threshold — do a second pass to count their real occurrences and verify before including them.",
    ],
    solutionApproach:
      "Generalized Boyer-Moore voting with two candidate slots. Scan once, maintaining `(cand1, count1)` and `(cand2, count2)`: if the current value matches an existing candidate, bump its count; else if a count is at 0, claim that slot; otherwise decrement both counts. This narrows the field to at most two possible candidates (since three groups can't all individually cancel out a value appearing more than n/3 times). Then do a second pass counting the real occurrences of `cand1` and `cand2`, and keep only the ones whose true count exceeds `floor(n/3)`. Sort the survivors ascending. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def majority_element_ii(nums):\n    cand1 = cand2 = None\n    count1 = count2 = 0\n    for n in nums:\n        if cand1 == n:\n            count1 += 1\n        elif cand2 == n:\n            count2 += 1\n        elif count1 == 0:\n            cand1, count1 = n, 1\n        elif count2 == 0:\n            cand2, count2 = n, 1\n        else:\n            count1 -= 1\n            count2 -= 1\n    threshold = len(nums) // 3\n    result = []\n    for cand in (cand1, cand2):\n        if cand is not None and nums.count(cand) > threshold:\n            result.append(cand)\n    return sorted(set(result))\n',
    solve: (nums) => {
      let cand1 = null;
      let cand2 = null;
      let count1 = 0;
      let count2 = 0;
      for (const n of nums) {
        if (cand1 === n) count1 += 1;
        else if (cand2 === n) count2 += 1;
        else if (count1 === 0) {
          cand1 = n;
          count1 = 1;
        } else if (count2 === 0) {
          cand2 = n;
          count2 = 1;
        } else {
          count1 -= 1;
          count2 -= 1;
        }
      }
      const threshold = Math.floor(nums.length / 3);
      const actual1 = nums.filter((n) => n === cand1).length;
      const actual2 = nums.filter((n) => n === cand2).length;
      const result = [];
      if (cand1 !== null && actual1 > threshold) result.push(cand1);
      if (cand2 !== null && actual2 > threshold && cand2 !== cand1) result.push(cand2);
      return [...new Set(result)].sort((a, b) => a - b);
    },
    exampleExplanation: (args, result) =>
      result.length ? `Value(s) ${result.join(', ')} each appear more than floor(n / 3) times.` : 'No value appears more than floor(n / 3) times.',
    edgeCases: [
      { args: [[3, 2, 3]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[2, 2, 3, 3]], kind: 'edge' },
      { args: [[1, 1, 1, 3, 3, 2, 2, 2]], kind: 'edge' },
      { args: [[0, 0, 0, 0]], kind: 'edge' },
    ],
  },
];
