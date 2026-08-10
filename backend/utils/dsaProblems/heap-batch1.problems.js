import { randInt, randIntArray } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Kth Largest Element in a Stream',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'int',
      queryOps: ['add'],
      genOps: (rng) => {
        const k = randInt(rng, 1, 4);
        const initLen = randInt(rng, k, k + 5);
        const nums = randIntArray(rng, initLen, -50, 50);
        const ops = [{ name: 'init', args: [k, ...nums] }];
        const addCount = randInt(rng, 3, 8);
        for (let i = 0; i < addCount; i += 1) {
          ops.push({ name: 'add', args: [randInt(rng, -50, 50)] });
        }
        return ops;
      },
    },
    statement:
      'Design a class that finds the `k`th largest element in a growing stream of numbers.\n\nImplement the `KthLargest` operations:\n- `init(k, nums)` — the constructor. Initializes the object with the integer `k` and an initial stream of numbers `nums`.\n- `add(val)` — appends `val` to the stream, then returns the current `k`th largest element in the stream (counting duplicates as separate elements — the kth largest by rank, not the kth distinct value).\n\nIt is guaranteed that the stream always contains at least `k` elements whenever `add` is called (i.e. `nums.length` is at least `k`).',
    constraints:
      '- `1 <= k <= 10^4`\n- `k <= nums.length` at construction time\n- `-10^4 <= nums[i], val <= 10^4`\n- At most `10^4` calls to `add`.',
    inputFormat:
      "Line 1: operation count `M`. Next `M` lines: `opName arg1 arg2 ...` — the first line is always `init k n1 n2 ... nm` (k followed by the initial stream), and every following line is `add val`.",
    outputFormat: 'One line per `add` call, in order, with the kth largest value in the stream at that point. `init` produces no output.',
    hints: [
      "You don't need to re-sort the whole stream on every add — think about what data structure lets you find 'the kth largest' cheaply as elements keep arriving.",
      'A min-heap that only ever holds the k largest elements seen so far has a very useful property: its smallest element (the top) IS the kth largest overall.',
      'On every add: push the new value in, and if the heap now holds more than k elements, pop the smallest one out. The top of the heap is always your answer.',
    ],
    solutionApproach:
      "Maintain a min-heap capped at size `k`, containing the k largest elements seen so far. Whenever a new value arrives, push it onto the heap; if the heap's size exceeds `k`, pop the minimum. Because the heap only ever holds the k largest elements, its root (minimum of that set) is exactly the kth largest overall. Each `add` is O(log k) instead of resorting the entire stream.",
    pythonSolutionCode:
      'import heapq\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.heap = list(nums)\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n\n    def add(self, val):\n        heapq.heappush(self.heap, val)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]\n',
    solve: (ops) => {
      const heap = [];
      const push = (v) => {
        heap.push(v);
        let i = heap.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (heap[p] <= heap[i]) break;
          [heap[p], heap[i]] = [heap[i], heap[p]];
          i = p;
        }
      };
      const pop = () => {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length) {
          heap[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            let smallest = i;
            if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
            if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
          }
        }
        return top;
      };
      let k = 0;
      const results = [];
      for (const op of ops) {
        if (op.name === 'init') {
          k = op.args[0];
          heap.length = 0;
          for (const n of op.args.slice(1)) push(n);
          while (heap.length > k) pop();
        } else if (op.name === 'add') {
          push(op.args[0]);
          if (heap.length > k) pop();
          results.push(heap[0]);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each `add` call returns the kth largest value across every number seen so far, including the ones from the initial stream.',
    edgeCases: [
      { args: [[{ name: 'init', args: [3, 4, 5, 8, 2] }, { name: 'add', args: [3] }, { name: 'add', args: [5] }, { name: 'add', args: [10] }, { name: 'add', args: [9] }, { name: 'add', args: [4] }]], kind: 'edge' },
      { args: [[{ name: 'init', args: [1] }, { name: 'add', args: [5] }, { name: 'add', args: [-1] }, { name: 'add', args: [9] }]], kind: 'edge' },
      { args: [[{ name: 'init', args: [2, 0, 0] }, { name: 'add', args: [0] }, { name: 'add', args: [0] }]], kind: 'edge' },
      { args: [[{ name: 'init', args: [4, -5, -10, -3, -1] }, { name: 'add', args: [-2] }, { name: 'add', args: [-20] }]], kind: 'edge' },
      { args: [[{ name: 'init', args: [1, 7] }, { name: 'add', args: [7] }, { name: 'add', args: [7] }, { name: 'add', args: [7] }]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Last Stone Weight',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 1, max: 1000 },
    statement:
      'You are given an array of integers `stones` where each value is the weight of a stone.\n\nOn each turn, take the two heaviest stones and smash them together. Say the two stones have weights `x <= y`:\n- If `x == y`, both stones are destroyed.\n- Otherwise, the stone of weight `x` is destroyed, and the stone of weight `y` is reduced to weight `y - x` (it goes back into the pile).\n\nKeep going until at most one stone remains. Return the weight of the last remaining stone, or `0` if none remain.',
    constraints: '- `1 <= stones.length <= 30`\n- `1 <= stones[i] <= 1000`',
    inputFormat: 'Line 1: the array `stones`, space-separated.',
    outputFormat: 'A single integer: the weight of the last stone, or `0` if no stone remains.',
    hints: [
      'You always need the two currently-heaviest stones — repeatedly scanning for the max twice per round works but is wasteful.',
      'A max-heap lets you pop the two heaviest stones in O(log n) each round instead of re-scanning the whole pile.',
      'After each smash, at most one new stone (the leftover `y - x`) goes back in — push it back onto the heap if it is nonzero and repeat until at most one stone is left.',
    ],
    solutionApproach:
      "Use a max-heap of stone weights. Repeatedly pop the two largest stones `y >= x`; if they differ, push `y - x` back onto the heap. Stop when the heap has 0 or 1 stones left. Each round is O(log n), and there are at most n rounds, giving O(n log n) overall.",
    pythonSolutionCode:
      'import heapq\n\n\ndef solve(stones):\n    heap = [-s for s in stones]\n    heapq.heapify(heap)\n    while len(heap) > 1:\n        y = -heapq.heappop(heap)\n        x = -heapq.heappop(heap)\n        if y != x:\n            heapq.heappush(heap, -(y - x))\n    return -heap[0] if heap else 0\n',
    solve: (stones) => {
      const arr = [...stones];
      while (arr.length > 1) {
        arr.sort((a, b) => b - a);
        const y = arr.shift();
        const x = arr.shift();
        if (y !== x) arr.push(y - x);
      }
      return arr.length ? arr[0] : 0;
    },
    exampleExplanation: (args, result) =>
      result > 0 ? `After repeatedly smashing the two heaviest stones, a single stone of weight ${result} remains.` : 'The stones cancel out completely, leaving no stone behind.',
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[2, 2]], kind: 'edge' },
      { args: [[2, 7, 4, 1, 8, 1]], kind: 'edge' },
      { args: [[1, 3]], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
      { args: [[1000, 1000, 1000]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'K Closest Points to Origin',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'array', minN: 2, maxN: 8, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const numPoints = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 8);
      const flat = [];
      for (let i = 0; i < numPoints; i += 1) {
        flat.push(randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
        flat.push(randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
      }
      const k = randInt(rng, 1, numPoints);
      return [flat, k];
    },
    statement:
      'You are given a list of points on the X-Y plane and an integer `k`. Return the `k` points that are closest to the origin `(0, 0)`, using standard Euclidean distance.\n\nBecause several points can sit at exactly the same distance from the origin, this judge requires a specific canonical answer when a tie sits right at the cutoff: sort points by ascending distance, breaking ties by ascending `x` and then ascending `y`, and take the first `k`. Points are encoded as a single flattened list of coordinates for input/output (see the format below).',
    constraints:
      '- `1 <= k <= points.length <= 10^4`\n- `-10^4 <= x_i, y_i <= 10^4`\n- Distance is the plain (non-squared) Euclidean distance, but comparisons never need the square root — comparing squared distances is equivalent and avoids floating point.\n- **Tie-break rule**: among points at equal distance, prefer smaller `x`, then smaller `y`. The output must list the resulting k points in that same order (ascending distance, then ascending x, then ascending y) — a differently-ordered-but-otherwise-valid k-subset will not match.',
    inputFormat:
      'Line 1: flattened point coordinates `x1 y1 x2 y2 ... xn yn`, space-separated (n = number of points). Line 2: the integer `k`.',
    outputFormat:
      'The k closest points, ordered by ascending distance (ties broken by ascending x, then ascending y), flattened as `x1 y1 x2 y2 ... xk yk`, space-separated.',
    hints: [
      "Sorting all n points by distance and taking the first k works, but you don't need a full sort if k is much smaller than n.",
      'A max-heap of size k (keyed on squared distance) lets you keep only the k closest points seen so far in O(n log k).',
      "Compare *squared* distances (`x*x + y*y`) — it avoids floating point square roots entirely and preserves the same ordering.",
    ],
    solutionApproach:
      "Compute each point's squared distance from the origin (no need for an actual square root, since it preserves ordering). Sort all points by squared distance, breaking ties by x then y for a deterministic answer, and return the first k. This is O(n log n); a max-heap of size k gets it down to O(n log k) for large inputs.",
    pythonSolutionCode:
      'def solve(flat, k):\n    points = [(flat[i], flat[i + 1]) for i in range(0, len(flat), 2)]\n    points.sort(key=lambda p: (p[0] * p[0] + p[1] * p[1], p[0], p[1]))\n    closest = points[:k]\n    out = []\n    for x, y in closest:\n        out.append(x)\n        out.append(y)\n    return out\n',
    solve: (flat, k) => {
      const points = [];
      for (let i = 0; i < flat.length; i += 2) points.push([flat[i], flat[i + 1]]);
      const sorted = [...points].sort((a, b) => {
        const da = a[0] * a[0] + a[1] * a[1];
        const db = b[0] * b[0] + b[1] * b[1];
        if (da !== db) return da - db;
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      });
      const closest = sorted.slice(0, k);
      const out = [];
      for (const [x, y] of closest) {
        out.push(x);
        out.push(y);
      }
      return out;
    },
    exampleExplanation: (args, result) => `The ${args[1]} point(s) with the smallest distance to the origin are returned, closest first.`,
    edgeCases: [
      { args: [[0, 0], 1], kind: 'edge' },
      { args: [[1, 3, -2, 2], 1], kind: 'edge' },
      { args: [[3, 3, 5, -1, -2, 4], 2], kind: 'edge' },
      { args: [[1, 0, -1, 0], 1], kind: 'edge' },
      { args: [[0, 0, 0, 0, 0, 0], 2], kind: 'edge' },
      { args: [[5, 5], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find Median from Data Stream',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'float',
      queryOps: ['findMedian'],
      genOps: (rng) => {
        const ops = [];
        const count = randInt(rng, 5, 12);
        for (let i = 0; i < count; i += 1) {
          ops.push({ name: 'addNum', args: [randInt(rng, -100, 100)] });
          if (rng() < 0.6 || i === count - 1) ops.push({ name: 'findMedian', args: [] });
        }
        return ops;
      },
    },
    comparisonMode: 'float',
    statement:
      'Design a data structure that supports adding integers from a stream one at a time and, at any point, efficiently returning the median of all integers added so far.\n\nImplement the `MedianFinder` operations:\n- `addNum(num)` — adds `num` to the running multiset of numbers.\n- `findMedian()` — returns the median of all numbers added so far. If the count is even, the median is the average of the two middle values.',
    constraints:
      '- `-10^5 <= num <= 10^5`\n- `findMedian` is only ever called after at least one `addNum`.\n- At most `5*10^4` calls total.\n- The median is printed with 5 digits after the decimal point.',
    inputFormat:
      "Line 1: operation count `M`. Next `M` lines: `addNum val` or `findMedian` (no argument).",
    outputFormat: 'One line per `findMedian` call, in order, printing that call\'s median (as a floating point number). `addNum` produces no output.',
    hints: [
      'Keeping the whole stream sorted and re-finding the middle every time works, but re-sorting on every call is wasteful — think about keeping it *incrementally* sorted instead.',
      'Split the numbers into two halves: a "low" half (its largest values) and a "high" half (its smallest values), and keep them balanced in size.',
      'A max-heap for the low half and a min-heap for the high half let you find the median in O(1) — it\'s either the top of the larger heap, or the average of both tops when they\'re equal size.',
    ],
    solutionApproach:
      'Maintain two heaps: a max-heap holding the smaller half of the numbers, and a min-heap holding the larger half, kept balanced so their sizes never differ by more than one. Every `addNum` pushes into one heap and rebalances between them in O(log n). `findMedian` is then O(1): if one heap has an extra element, its top is the median; otherwise the median is the average of both tops.',
    pythonSolutionCode:
      'import heapq\n\n\nclass MedianFinder:\n    def __init__(self):\n        self.low = []   # max-heap (negated)\n        self.high = []  # min-heap\n\n    def add_num(self, num):\n        heapq.heappush(self.low, -num)\n        heapq.heappush(self.high, -heapq.heappop(self.low))\n        if len(self.high) > len(self.low):\n            heapq.heappush(self.low, -heapq.heappop(self.high))\n\n    def find_median(self):\n        if len(self.low) > len(self.high):\n            return float(-self.low[0])\n        return (-self.low[0] + self.high[0]) / 2.0\n',
    solve: (ops) => {
      const arr = [];
      const results = [];
      for (const op of ops) {
        if (op.name === 'addNum') {
          const num = op.args[0];
          let lo = 0;
          let hi = arr.length;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] < num) lo = mid + 1;
            else hi = mid;
          }
          arr.splice(lo, 0, num);
        } else if (op.name === 'findMedian') {
          const n = arr.length;
          const mid = n >> 1;
          const median = n % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
          results.push(median);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each `findMedian` call reflects the median of every number added to the stream up to that point.',
    edgeCases: [
      { args: [[{ name: 'addNum', args: [1] }, { name: 'findMedian', args: [] }]], kind: 'edge' },
      {
        args: [
          [
            { name: 'addNum', args: [1] },
            { name: 'addNum', args: [2] },
            { name: 'findMedian', args: [] },
            { name: 'addNum', args: [3] },
            { name: 'findMedian', args: [] },
          ],
        ],
        kind: 'edge',
      },
      { args: [[{ name: 'addNum', args: [-5] }, { name: 'addNum', args: [-10] }, { name: 'findMedian', args: [] }]], kind: 'edge' },
      {
        args: [
          [
            { name: 'addNum', args: [5] },
            { name: 'addNum', args: [5] },
            { name: 'findMedian', args: [] },
            { name: 'addNum', args: [5] },
            { name: 'findMedian', args: [] },
          ],
        ],
        kind: 'edge',
      },
      { args: [[{ name: 'addNum', args: [100] }, { name: 'addNum', args: [-100] }, { name: 'addNum', args: [0] }, { name: 'findMedian', args: [] }]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Task Scheduler',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 20, numTaskTypes: 5, maxCooldown: 4 },
    genArgs: (rng, cfg) => {
      const len = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 20);
      const nums = randIntArray(rng, len, 0, (cfg.numTaskTypes ?? 5) - 1);
      const n = randInt(rng, 0, cfg.maxCooldown ?? 4);
      return [nums, n];
    },
    statement:
      'You are given a list of CPU tasks, each represented by an integer task type (identical integers mean identical task type), and a non-negative cooldown `n`.\n\nThe CPU executes exactly one task (or sits idle) per unit of time. Two tasks of the *same* type must be separated by at least `n` units of time. Return the minimum number of time units the CPU needs to finish all the given tasks (idle slots count toward the total).',
    constraints: '- `1 <= tasks.length <= 10^4`\n- Task types are given as integers `0 <= tasks[i] <= 25` (standing in for 26 possible task labels, e.g. `A`-`Z`).\n- `0 <= n <= 100`',
    inputFormat: 'Line 1: the array `tasks` (integer task type per task), space-separated. Line 2: the cooldown `n`.',
    outputFormat: 'A single integer: the minimum number of time units required.',
    hints: [
      'The most frequent task type is the real bottleneck — it forces a minimum number of cooldown gaps no matter how you arrange everything else.',
      "If a task type appears `maxFreq` times, it needs `maxFreq - 1` gaps of length `n` after it, e.g. `A _ _ A _ _ A` for maxFreq=3, n=2 — that skeleton alone takes `(maxFreq - 1) * (n + 1) + 1` slots.",
      'If several task types are tied for the most frequent, one more of them can slot into the very last position of that skeleton for each tie. Compare that skeleton length against simply doing every task back-to-back (`tasks.length`), since with enough distinct task types there may be no idle time at all — take the larger of the two.',
    ],
    solutionApproach:
      "Count how many times each task type occurs. Let `maxFreq` be the highest count, and `numMax` be how many task types share that highest count. The most-frequent task type(s) force a skeleton of length `(maxFreq - 1) * (n + 1) + numMax` (maxFreq-1 full cooldown blocks of length n+1, plus one slot per tied task type at the very end). The true answer is never less than simply running every task with no idle time at all (`tasks.length`), so the result is `max(tasks.length, (maxFreq - 1) * (n + 1) + numMax)`. O(n) time to count frequencies.",
    pythonSolutionCode:
      'from collections import Counter\n\n\ndef solve(tasks, n):\n    counts = Counter(tasks)\n    max_freq = max(counts.values())\n    num_max = sum(1 for c in counts.values() if c == max_freq)\n    return max(len(tasks), (max_freq - 1) * (n + 1) + num_max)\n',
    solve: (tasks, n) => {
      const freq = new Map();
      for (const t of tasks) freq.set(t, (freq.get(t) || 0) + 1);
      const counts = [...freq.values()];
      const maxFreq = Math.max(...counts);
      const numMax = counts.filter((c) => c === maxFreq).length;
      return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + numMax);
    },
    exampleExplanation: (args, result) => `With cooldown n=${args[1]}, the schedule (including any forced idle slots) takes ${result} time unit(s).`,
    edgeCases: [
      { args: [[0, 0, 0, 1, 1, 1], 2], kind: 'edge' },
      { args: [[0, 0, 0, 1], 0], kind: 'edge' },
      { args: [[0, 0, 0, 0], 2], kind: 'edge' },
      { args: [[0], 5], kind: 'edge' },
      { args: [[0, 1, 2, 3], 2], kind: 'edge' },
      { args: [[0, 0, 1, 1, 2, 2], 2], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sliding Window Maximum',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'array', minN: 1, maxN: 15, min: -50, max: 50 },
    statement:
      'You are given an integer array `nums` and an integer `k` representing the size of a sliding window that moves from the very left of the array to the very right, one position at a time.\n\nFor each position of the window, return the maximum value contained in it. The result is the list of these maximums, in order.',
    constraints: '- `1 <= k <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the window size `k`.',
    outputFormat: 'The maximum of each window, in left-to-right order, space-separated.',
    hints: [
      "Recomputing the max of every window from scratch is O(n*k) — think about what information you can carry over from one window to the next.",
      'Keep a deque of indices whose values are in decreasing order. The front of the deque is always the index of the current window\'s maximum.',
      'Before adding a new index, pop off any indices from the back whose values are smaller (they can never be the max again); also drop indices from the front once they slide out of the window.',
    ],
    solutionApproach:
      "Maintain a deque of indices with strictly decreasing values. For each new index i: first drop the front of the deque if it has fallen out of the window (index <= i - k); then pop from the back while the new value is >= the value at the back index (those can never be a future maximum); push i. Once the window is fully formed (i >= k - 1), the front of the deque is the window's maximum. This is O(n) overall since each index is pushed and popped at most once.",
    pythonSolutionCode:
      'from collections import deque\n\n\ndef solve(nums, k):\n    dq = deque()\n    res = []\n    for i, v in enumerate(nums):\n        while dq and dq[0] <= i - k:\n            dq.popleft()\n        while dq and nums[dq[-1]] <= v:\n            dq.pop()\n        dq.append(i)\n        if i >= k - 1:\n            res.append(nums[dq[0]])\n    return res\n',
    solve: (nums, k) => {
      const deque = [];
      const res = [];
      for (let i = 0; i < nums.length; i += 1) {
        while (deque.length && deque[0] <= i - k) deque.shift();
        while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
        deque.push(i);
        if (i >= k - 1) res.push(nums[deque[0]]);
      }
      return res;
    },
    exampleExplanation: (args, result) => `Sliding a window of size ${args[1]} across the array yields ${result.length} window maximum(s): [${result.join(', ')}].`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], kind: 'edge' },
      { args: [[9, 8, 7, 6], 2], kind: 'edge' },
      { args: [[1, 2, 3, 4], 4], kind: 'edge' },
      { args: [[4, 4, 4, 4], 2], kind: 'edge' },
      { args: [[-1, -2, -3], 1], kind: 'edge' },
    ],
  },
];
