import { randInt, randIntArray, randString } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Gas Station',
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'int', minN: 3, maxN: 14, min: 0, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 3, cfg.maxN ?? 14);
      const gas = randIntArray(rng, n, cfg.min ?? 0, cfg.max ?? 50);
      const cost = randIntArray(rng, n, cfg.min ?? 0, cfg.max ?? 50);
      return [gas, cost];
    },
    statement:
      "You are driving around a circular route with `n` gas stations. At station `i`, you can pick up `gas[i]` amount of fuel, and it costs `cost[i]` fuel to drive from station `i` to station `i + 1` (the route wraps around after the last station back to the first).\n\nYou begin the trip at some station with an empty tank. Determine the 0-indexed starting station from which you can travel the entire circuit exactly once, in order, without your tank ever going negative. If no such starting station exists, return `-1`.\n\nYou may assume that if a valid starting station exists, it is unique.",
    constraints:
      '- `1 <= gas.length == cost.length <= 10^5`\n- `0 <= gas[i], cost[i] <= 10^4`\n- If a valid starting station exists, it is guaranteed to be unique.',
    inputFormat: 'Line 1: the array `gas`, space-separated. Line 2: the array `cost`, space-separated (same length as `gas`).',
    outputFormat: 'A single integer: the 0-indexed starting station, or `-1` if no starting station works.',
    hints: [
      'If the total gas available across the whole route is less than the total cost, no starting point can ever work — that check alone rules out a lot of cases immediately.',
      "Imagine simulating a drive starting from station 0 and tracking your tank level station by station. If the tank ever goes negative at some station `i`, what does that tell you about every station you started from on the way to `i`?",
      'Make a single left-to-right pass tracking a running tank balance; the moment it dips below zero, none of the stations up to and including the current one can be the answer, so advance your candidate start to the next station and reset the tank to zero.',
    ],
    solutionApproach:
      "First check `sum(gas) < sum(cost)`: if true, return -1 immediately since completing the circuit is impossible regardless of starting point. Otherwise a valid, unique starting station is guaranteed to exist. Make one left-to-right pass maintaining a running `tank` total, adding `gas[i] - cost[i]` at each station. Whenever `tank` drops below zero, every station visited since the current candidate start (inclusive) would have run dry by station `i`, so none of them can be the true start — set the candidate start to `i + 1` and reset `tank` to 0. The candidate start remaining at the end of the pass is the answer. O(n) time, O(1) space.",
    pythonSolutionCode:
      "def gas_station(gas, cost):\n    total = 0\n    tank = 0\n    start = 0\n    for i in range(len(gas)):\n        diff = gas[i] - cost[i]\n        total += diff\n        tank += diff\n        if tank < 0:\n            start = i + 1\n            tank = 0\n    return start if total >= 0 else -1\n",
    solve: (gas, cost) => {
      let total = 0;
      let tank = 0;
      let start = 0;
      for (let i = 0; i < gas.length; i += 1) {
        const diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {
          start = i + 1;
          tank = 0;
        }
      }
      return total >= 0 ? start : -1;
    },
    exampleExplanation: (args, result) =>
      result === -1
        ? 'The total gas available is less than the total cost of the route, so no starting station can complete the circuit.'
        : `Starting the tank at station ${result} keeps the running fuel balance non-negative all the way around the circuit.`,
    edgeCases: [
      { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], kind: 'edge' },
      { args: [[2, 3, 4], [3, 4, 3]], kind: 'edge' },
      { args: [[5], [4]], kind: 'edge' },
      { args: [[3], [5]], kind: 'edge' },
      { args: [[0, 0, 0, 0], [0, 0, 0, 0]], kind: 'edge' },
      { args: [[2, 2, 2], [2, 2, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Candy',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 50 },
    statement:
      "There are `n` children standing in a line, each assigned an integer `rating`. You must give each child at least one candy, and any child whose rating is strictly greater than an adjacent child's rating must receive strictly more candies than that neighbor.\n\nReturn the minimum total number of candies you need to satisfy both rules.",
    constraints: '- `1 <= ratings.length <= 10^5`\n- `0 <= ratings[i] <= 2*10^4`',
    inputFormat: 'Line 1: the array `ratings`, space-separated.',
    outputFormat: 'A single integer: the minimum total number of candies required.',
    hints: [
      'The rule only ever compares a child to their immediate left and right neighbor — try handling those two directions somewhat separately instead of all at once.',
      "A single left-to-right pass can correctly enforce 'give more candy than your left neighbor when your rating is higher', but it has no way to know yet what the right neighbor will require.",
      'Do two passes: left-to-right enforcing the left-neighbor rule, then right-to-left enforcing the right-neighbor rule by taking the max of what a child already has and one more than their right neighbor.',
    ],
    solutionApproach:
      "Start every child at 1 candy. In a left-to-right pass, whenever `ratings[i] > ratings[i-1]`, set `candies[i] = candies[i-1] + 1`. In a right-to-left pass, whenever `ratings[i] > ratings[i+1]`, set `candies[i] = max(candies[i], candies[i+1] + 1)` (using max so the left-pass result for that child is never accidentally lowered). Summing the final array gives the minimum total: each pass independently guarantees one of the two directional constraints, and taking the max in the second pass never breaks the constraint already established by the first. O(n) time, O(n) space.",
    pythonSolutionCode:
      'def candy(ratings):\n    n = len(ratings)\n    candies = [1] * n\n    for i in range(1, n):\n        if ratings[i] > ratings[i - 1]:\n            candies[i] = candies[i - 1] + 1\n    for i in range(n - 2, -1, -1):\n        if ratings[i] > ratings[i + 1]:\n            candies[i] = max(candies[i], candies[i + 1] + 1)\n    return sum(candies)\n',
    solve: (ratings) => {
      const n = ratings.length;
      const candies = new Array(n).fill(1);
      for (let i = 1; i < n; i += 1) {
        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
      }
      for (let i = n - 2; i >= 0; i -= 1) {
        if (ratings[i] > ratings[i + 1]) candies[i] = Math.max(candies[i], candies[i + 1] + 1);
      }
      return candies.reduce((a, b) => a + b, 0);
    },
    exampleExplanation: (args, result) => `Satisfying both neighbor rules for these ${args[0].length} children requires ${result} candies in total.`,
    edgeCases: [
      { args: [[1, 0, 2]], kind: 'edge' },
      { args: [[1, 2, 2]], kind: 'edge' },
      { args: [[5]], kind: 'edge' },
      { args: [[1, 1, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Minimum Number of Arrows to Burst Balloons',
    shape: 'intervals_to_intervals_or_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 10, min: 0, max: 50 },
    statement:
      "Balloons are represented as intervals `points[i] = [x_start_i, x_end_i]`, the two x-coordinates spanned by the i-th balloon along a horizontal line (their shared height doesn't matter). An arrow shot straight up at some x-coordinate bursts every balloon whose interval contains that coordinate — including balloons it merely touches at an endpoint — and it has unlimited range, so a single arrow can burst many overlapping balloons at once.\n\nGiven the balloons, return the minimum number of arrows needed to burst all of them.",
    constraints: '- `1 <= points.length <= 10^5`\n- `-2^31 <= x_start_i <= x_end_i <= 2^31 - 1`',
    inputFormat: 'Line 1: count `n`. Next `n` lines: `xStart xEnd` for each balloon.',
    outputFormat: 'A single integer: the minimum number of arrows needed.',
    hints: [
      'Since a single arrow can burst every balloon whose range covers its x-coordinate, overlapping balloons can often share one arrow — the real question is how to group them optimally.',
      "Sorting the balloons by their ending x-coordinate lets you decide, one balloon at a time, the earliest position an arrow could be shot to cover as many of the remaining balloons as possible.",
      "Shoot the first arrow at the end of whichever balloon ends soonest. Any later balloon (in end-sorted order) whose start is at or before that x is already burst; the first one whose start is past it needs a brand-new arrow, placed at its own end.",
    ],
    solutionApproach:
      "Sort the balloons by their ending coordinate. Shoot an arrow at the end of the first (soonest-ending) balloon and remember that position as `arrowPos`. Walk the rest in sorted order: if a balloon's start is `<= arrowPos`, it's already burst by the current arrow. Otherwise it needs a new arrow — increment the count and move `arrowPos` to that balloon's own end. Because balloons are processed in order of increasing end, this greedy choice never wastes an arrow. O(n log n) time for the sort.",
    pythonSolutionCode:
      "def min_arrows(points):\n    if not points:\n        return 0\n    pts = sorted(points, key=lambda p: p[1])\n    arrows = 1\n    end = pts[0][1]\n    for s, e in pts[1:]:\n        if s > end:\n            arrows += 1\n            end = e\n    return arrows\n",
    solve: (intervals) => {
      if (!intervals.length) return 0;
      const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
      let arrows = 1;
      let end = sorted[0][1];
      for (let i = 1; i < sorted.length; i += 1) {
        const [s, e] = sorted[i];
        if (s > end) {
          arrows += 1;
          end = e;
        }
      }
      return arrows;
    },
    exampleExplanation: (args, result) => `The ${args[0].length} balloon(s) can all be burst using ${result} arrow(s) shot at their optimal x-coordinates.`,
    edgeCases: [
      { args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], kind: 'edge' },
      { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], kind: 'edge' },
      { args: [[[1, 2]]], kind: 'edge' },
      { args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], kind: 'edge' },
      { args: [[[1, 1], [1, 1]]], kind: 'edge' },
      { args: [[[-5, -3], [-2, 1], [0, 5]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Non-overlapping Intervals',
    shape: 'intervals_to_intervals_or_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 10, min: -20, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
      const intervals = Array.from({ length: n }, () => {
        const s = randInt(rng, cfg.min ?? -20, cfg.max ?? 50);
        const e = s + randInt(rng, 1, 10);
        return [s, e];
      });
      return [intervals];
    },
    statement:
      "Given a collection of intervals `intervals[i] = [start_i, end_i]`, return the minimum number of intervals you must remove so that none of the remaining intervals overlap.\n\nTwo intervals are considered overlapping only if they share more than a single boundary point — for example, `[1,2]` and `[2,3]` do **not** overlap.",
    constraints: '- `1 <= intervals.length <= 10^5`\n- `-5*10^4 <= start_i < end_i <= 5*10^4`',
    inputFormat: 'Line 1: count `n`. Next `n` lines: `start end` for each interval.',
    outputFormat: 'A single integer: the minimum number of intervals to remove.',
    hints: [
      'Removing the fewest intervals to eliminate overlaps is the same problem as keeping the largest possible subset of pairwise non-overlapping intervals.',
      'Greedily choosing intervals that end earliest leaves the most room on the number line for future intervals to also fit without overlapping.',
      'Sort by ending coordinate, then keep an interval whenever its start is at or after the end of the most recently kept interval; everything you could not keep must be removed.',
    ],
    solutionApproach:
      "Sort the intervals by their ending coordinate. Walk through them greedily, keeping an interval whenever its start is `>=` the end of the most recently kept interval (a classic exchange-argument greedy: always preferring the interval that frees up the most room for what comes next never does worse than any other choice). The answer is `total count - kept count`, since every interval that couldn't be kept must be removed. O(n log n) time for the sort.",
    pythonSolutionCode:
      "def erase_overlap_intervals(intervals):\n    if not intervals:\n        return 0\n    ivs = sorted(intervals, key=lambda x: x[1])\n    end = float('-inf')\n    kept = 0\n    for s, e in ivs:\n        if s >= end:\n            kept += 1\n            end = e\n    return len(intervals) - kept\n",
    solve: (intervals) => {
      if (!intervals.length) return 0;
      const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
      let end = -Infinity;
      let kept = 0;
      for (const [s, e] of sorted) {
        if (s >= end) {
          kept += 1;
          end = e;
        }
      }
      return intervals.length - kept;
    },
    exampleExplanation: (args, result) =>
      result === 0
        ? 'The intervals are already pairwise non-overlapping, so nothing needs to be removed.'
        : `Removing ${result} interval(s) leaves the rest pairwise non-overlapping, which is the fewest possible.`,
    edgeCases: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], kind: 'edge' },
      { args: [[[1, 2], [1, 2], [1, 2]]], kind: 'edge' },
      { args: [[[1, 2], [2, 3]]], kind: 'edge' },
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], kind: 'edge' },
      { args: [[[1, 2]]], kind: 'edge' },
      { args: [[[1, 2], [3, 4], [5, 6]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Partition Labels',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'intArray', minN: 1, maxN: 20, alphabet: 'abcdefgh' },
    statement:
      "You're given a string `s` consisting of lowercase English letters. Partition `s` into as many contiguous parts as possible so that each letter of the alphabet appears in at most one part (no letter may be split across two different parts).\n\nReturn the sizes of the resulting parts, in left-to-right order.",
    constraints:
      '- `1 <= s.length <= 500`\n- `s` consists of lowercase English letters only.\n- The partition sizes returned must correspond to the unique maximal partition (the greedy left-to-right split described in the approach) — this is the only partition that also maximizes the number of parts, so there is no ambiguity in the expected answer.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'The partition sizes, in left-to-right order, space-separated.',
    hints: [
      "A letter appearing anywhere later in the string forces the current part to extend at least that far — so knowing each letter's last occurrence position up front is key.",
      'Precompute, for every letter that appears in `s`, the index of its last occurrence.',
      "Scan left to right, keeping a running 'this part must extend at least to here' boundary that grows to the last occurrence of every letter you encounter; the moment your scan position reaches that boundary, the current part is complete and cannot be shortened further.",
    ],
    solutionApproach:
      "First compute `last[ch]`, the last index at which each character occurs in `s`. Then scan left to right maintaining `end`, the furthest index the current part is forced to reach, updating it as `end = max(end, last[s[i]])` for every character visited. Whenever the scan position `i` reaches `end`, the current part is finished — every letter seen in it has had its last occurrence accounted for, so it's safe to cut here — record its length (`i - start + 1`) and begin the next part at `i + 1`. O(n) time, O(1) extra space (a fixed 26-letter table).",
    pythonSolutionCode:
      'def partition_labels(s):\n    last = {ch: i for i, ch in enumerate(s)}\n    sizes = []\n    start = end = 0\n    for i, ch in enumerate(s):\n        end = max(end, last[ch])\n        if i == end:\n            sizes.append(i - start + 1)\n            start = i + 1\n    return sizes\n',
    solve: (s) => {
      const last = {};
      for (let i = 0; i < s.length; i += 1) last[s[i]] = i;
      const sizes = [];
      let start = 0;
      let end = 0;
      for (let i = 0; i < s.length; i += 1) {
        end = Math.max(end, last[s[i]]);
        if (i === end) {
          sizes.push(i - start + 1);
          start = i + 1;
        }
      }
      return sizes;
    },
    exampleExplanation: (args, result) =>
      `The string splits into ${result.length} part(s) of sizes [${result.join(', ')}], with every letter confined to a single part.`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['aaaa'], kind: 'edge' },
      { args: ['abab'], kind: 'edge' },
      { args: ['abcdef'], kind: 'edge' },
      { args: ['ababcbacadefegdehijhklij'], kind: 'edge' },
      { args: ['abcabc'], kind: 'edge' },
    ],
  },
];
