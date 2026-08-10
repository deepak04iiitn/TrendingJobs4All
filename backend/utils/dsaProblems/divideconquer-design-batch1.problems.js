import { randInt } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Merge Sort',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 0, maxN: 15, min: -100, max: 100 },
    statement:
      "Write a function that sorts an integer array `nums` in ascending order using **merge sort**: a classic divide-and-conquer algorithm.\n\nRepeatedly split the array in half until each piece has at most one element (trivially sorted), then merge pairs of sorted pieces back together, combining smaller pieces into larger sorted ones until the whole array is sorted. Return the sorted array. A solution that just calls a built-in sort defeats the point of the exercise, but the grader only checks the final sorted output.",
    constraints: '- `0 <= nums.length <= 10^4`\n- `-10^5 <= nums[i] <= 10^5`\n- There is exactly one correct sorted output regardless of implementation details.',
    inputFormat: 'Line 1: the array `nums`, space-separated (empty line if `nums` is empty).',
    outputFormat: 'The array sorted in ascending order, space-separated (empty line if the input is empty).',
    hints: [
      'Divide and conquer: if you could magically sort the left half and the right half separately, what single step would be left to do?',
      'That last step is "merging" two already-sorted sequences into one sorted sequence — the same operation used to merge two sorted arrays.',
      'Recurse down to sub-arrays of length 0 or 1 (already sorted by definition), then merge pairs of sorted halves back up the call stack using two pointers, always taking the smaller of the two current fronts.',
    ],
    solutionApproach:
      'Recursively split `nums` at its midpoint into a left half and a right half, sort each half the same way, and merge the two now-sorted halves with a two-pointer walk: repeatedly compare the front of each half and append the smaller one to the output, then append whatever is left over once one half runs out. The recursion bottoms out at arrays of length 0 or 1. This runs in O(n log n) time (log n levels of splitting, O(n) work merging at each level) and O(n) auxiliary space for the merge buffers; it is also a stable sort.',
    pythonSolutionCode:
      'def merge_sort(nums):\n    if len(nums) <= 1:\n        return list(nums)\n    mid = len(nums) // 2\n    left = merge_sort(nums[:mid])\n    right = merge_sort(nums[mid:])\n\n    merged = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            merged.append(left[i])\n            i += 1\n        else:\n            merged.append(right[j])\n            j += 1\n    merged.extend(left[i:])\n    merged.extend(right[j:])\n    return merged\n',
    solve: (nums) => {
      const merge = (a, b) => {
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
      };
      const sortRec = (arr) => {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        return merge(sortRec(arr.slice(0, mid)), sortRec(arr.slice(mid)));
      };
      return sortRec(nums);
    },
    exampleExplanation: () =>
      'The array is halved recursively down to single elements, then those pieces are merged back together two at a time, each merge producing a larger sorted run, until the whole array is sorted.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[42]], kind: 'edge' },
      { args: [[6, 6, 6, 6]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[-8, 12, -3, 0, 12, -8, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Quick Sort',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 0, maxN: 15, min: -100, max: 100 },
    statement:
      "Write a function that sorts an integer array `nums` in ascending order using **quicksort**: a divide-and-conquer, partition-based algorithm.\n\nPick a pivot element, rearrange (\"partition\") the array so every element smaller than the pivot ends up to its left and every element larger ends up to its right, then recursively apply the same process to the left and right sub-ranges. Return the sorted array. A solution that just calls a built-in sort defeats the point of the exercise, but the grader only checks the final sorted output.",
    constraints: '- `0 <= nums.length <= 10^4`\n- `-10^5 <= nums[i] <= 10^5`\n- There is exactly one correct sorted output regardless of pivot strategy.',
    inputFormat: 'Line 1: the array `nums`, space-separated (empty line if `nums` is empty).',
    outputFormat: 'The array sorted in ascending order, space-separated (empty line if the input is empty).',
    hints: [
      "Unlike merge sort, quicksort does its main work *before* recursing: it first places one element — the pivot — exactly where it belongs in the final sorted order.",
      'Partitioning: scan the range once, moving every element `<=` the pivot to a growing block on the left, then drop the pivot right after that block.',
      "Once the pivot sits in its final position, everything left of it is already `<=` pivot and everything right is `>=` pivot — recurse independently on those two sub-ranges (excluding the pivot itself, which never moves again).",
    ],
    solutionApproach:
      "Use Lomuto-style partitioning: pick the last element of the current `[lo, hi]` range as the pivot, walk `j` from `lo` to `hi-1` keeping a boundary index `i` for 'elements confirmed `<= pivot`', swapping the current element into that boundary whenever it qualifies, then swap the pivot itself into position `i`. Recurse on `[lo, i-1]` and `[i+1, hi]`. Average case O(n log n) time with O(1) extra space beyond the recursion stack; worst case O(n^2) on already-sorted/adversarial input with this fixed pivot choice (randomizing or median-of-three pivot selection avoids that in practice).",
    pythonSolutionCode:
      'def quick_sort(nums):\n    arr = list(nums)\n\n    def partition(lo, hi):\n        pivot = arr[hi]\n        i = lo\n        for j in range(lo, hi):\n            if arr[j] <= pivot:\n                arr[i], arr[j] = arr[j], arr[i]\n                i += 1\n        arr[i], arr[hi] = arr[hi], arr[i]\n        return i\n\n    def sort(lo, hi):\n        if lo >= hi:\n            return\n        p = partition(lo, hi)\n        sort(lo, p - 1)\n        sort(p + 1, hi)\n\n    sort(0, len(arr) - 1)\n    return arr\n',
    solve: (nums) => {
      const arr = [...nums];
      const partition = (lo, hi) => {
        const pivot = arr[hi];
        let i = lo;
        for (let j = lo; j < hi; j += 1) {
          if (arr[j] <= pivot) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i += 1;
          }
        }
        [arr[i], arr[hi]] = [arr[hi], arr[i]];
        return i;
      };
      const sortRange = (lo, hi) => {
        if (lo >= hi) return;
        const p = partition(lo, hi);
        sortRange(lo, p - 1);
        sortRange(p + 1, hi);
      };
      sortRange(0, arr.length - 1);
      return arr;
    },
    exampleExplanation: () =>
      'Each partition step drops one pivot into its final sorted position and splits the remaining elements into a "smaller" side and a "larger" side, which are then sorted the same way.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[7]], kind: 'edge' },
      { args: [[3, 3, 3, 3]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[9, -4, 9, 0, -4, 15]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Count of Smaller Numbers After Self',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 14, min: -50, max: 50 },
    statement:
      'Given an integer array `nums`, compute an array `counts` of the same length where `counts[i]` is the number of elements to the **right** of index `i` that are strictly smaller than `nums[i]`.',
    constraints: '- `1 <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The array `counts`, space-separated, same length as `nums`.',
    hints: [
      'A brute-force double loop is O(n^2) and correct but too slow for large inputs — is there a way to count "how many smaller elements come after this one" while sorting?',
      'This is a classic divide-and-conquer problem: adapt merge sort so it also counts, for every element, how many elements that end up to its left during a merge were originally to its right and smaller.',
      "Sort indices instead of values: during the merge step of a merge sort on (value, original index) pairs, every time you take an element from the right half before the left half is exhausted, it means all remaining left-half elements have one more 'smaller element to the right' — add the right-half pointer's advance count to each left element as it is taken.",
    ],
    solutionApproach:
      "Perform merge sort over an array of *indices* into `nums` (sorted by `nums[index]`), rather than over the values directly, and augment the merge step: while merging a left half and a right half, keep a running count of how many right-half elements have already been placed into the merged result. Every time a left-half element is placed, add that running count to `counts[originalIndexOfThatElement]` — those are exactly the right-half elements smaller than it that have been confirmed to sit to its right in the original array. Because merge sort only ever compares/moves elements within the same recursive sub-range (which always spans a contiguous block of original positions), this correctly counts \"smaller and to the right\" for every element in O(n log n) time and O(n) space. (An equivalent alternative is a Fenwick/BIT tree over coordinate-compressed values, scanning `nums` right to left.)",
    pythonSolutionCode:
      'def count_smaller(nums):\n    n = len(nums)\n    counts = [0] * n\n    indices = list(range(n))\n\n    def sort(lo, hi):\n        if hi - lo <= 1:\n            return\n        mid = (lo + hi) // 2\n        sort(lo, mid)\n        sort(mid, hi)\n        merged = []\n        i, j = lo, mid\n        right_taken = 0\n        while i < mid and j < hi:\n            if nums[indices[j]] < nums[indices[i]]:\n                right_taken += 1\n                merged.append(indices[j])\n                j += 1\n            else:\n                counts[indices[i]] += right_taken\n                merged.append(indices[i])\n                i += 1\n        while i < mid:\n            counts[indices[i]] += right_taken\n            merged.append(indices[i])\n            i += 1\n        while j < hi:\n            merged.append(indices[j])\n            j += 1\n        indices[lo:hi] = merged\n\n    sort(0, n)\n    return counts\n',
    solve: (nums) => {
      const n = nums.length;
      const counts = new Array(n).fill(0);
      let indices = Array.from({ length: n }, (_, i) => i);

      const sortRange = (lo, hi) => {
        if (hi - lo <= 1) return;
        const mid = Math.floor((lo + hi) / 2);
        sortRange(lo, mid);
        sortRange(mid, hi);
        const merged = [];
        let i = lo;
        let j = mid;
        let rightTaken = 0;
        while (i < mid && j < hi) {
          if (nums[indices[j]] < nums[indices[i]]) {
            rightTaken += 1;
            merged.push(indices[j]);
            j += 1;
          } else {
            counts[indices[i]] += rightTaken;
            merged.push(indices[i]);
            i += 1;
          }
        }
        while (i < mid) {
          counts[indices[i]] += rightTaken;
          merged.push(indices[i]);
          i += 1;
        }
        while (j < hi) {
          merged.push(indices[j]);
          j += 1;
        }
        for (let k = lo; k < hi; k += 1) indices[k] = merged[k - lo];
      };

      sortRange(0, n);
      return counts;
    },
    exampleExplanation: (args, result) =>
      `For nums = [${args[0].join(', ')}], counts = [${result.join(', ')}] — each position holds how many later elements are strictly smaller than the value at that position.`,
    edgeCases: [
      { args: [[5]], kind: 'edge' },
      { args: [[5, 2, 6, 1]], kind: 'edge' },
      { args: [[-1, -1]], kind: 'edge' },
      { args: [[2, 0, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[4, 3, 2, 1]], kind: 'edge' },
      { args: [[3, 3, 3, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'LFU Cache',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'int',
      queryOps: ['get'],
      genOps: (rng) => {
        const capacity = randInt(rng, 1, 3);
        const ops = [{ name: 'LFUCache', args: [capacity] }];
        const keys = Array.from({ length: capacity + 2 }, (_, i) => i + 1);
        const count = randInt(rng, 8, 14);
        let getsSoFar = 0;
        for (let i = 0; i < count; i += 1) {
          const key = keys[randInt(rng, 0, keys.length - 1)];
          const doGet = rng() < 0.45;
          if (doGet) {
            ops.push({ name: 'get', args: [key] });
            getsSoFar += 1;
          } else {
            ops.push({ name: 'put', args: [key, randInt(rng, 1, 100)] });
          }
        }
        if (getsSoFar === 0) ops.push({ name: 'get', args: [keys[0]] });
        return ops;
      },
    },
    statement:
      'Design a fixed-capacity cache that supports `get` and `put` in O(1) average time, evicting the **least frequently used** entry when it is full — breaking ties between equally-frequent entries by evicting the **least recently used** one among them:\n\n- `LFUCache(capacity)` — initializes the cache with a positive size limit (a capacity of `0` means the cache holds nothing at all).\n- `get(key)` — returns the value for `key` if present, otherwise `-1`. On success, this counts as a "use" of `key`, incrementing its use-frequency by 1.\n- `put(key, value)` — inserts or updates the value for `key`, which also counts as a use (incrementing frequency by 1, or starting a new key at frequency 1). If this would exceed `capacity`, first evict the least frequently used key (ties broken by least recently used).',
    constraints:
      '- `0 <= capacity <= 10^4`\n- `0 <= key, value <= 10^5`\n- The first operation in every sequence is always `LFUCache capacity`.\n- At most `2*10^5` calls total.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName` followed by its arguments, e.g. `LFUCache 2`, `put 1 1`, `get 1` — the very first operation is always `LFUCache capacity`.',
    outputFormat: 'One line per `get` call, in order, with that call\'s result (`-1` if the key is not present). `LFUCache` and `put` produce no output.',
    hints: [
      "A hash map alone gives O(1) get/put but has no notion of \"frequency\" for eviction — you need to track a use-count per key as well.",
      'Group keys into buckets by their current frequency (frequency -> ordered collection of keys at that frequency), and track the minimum frequency currently present so eviction always looks in the right bucket.',
      "Within a frequency bucket, order matters too: use an insertion-ordered structure (a doubly linked list, or JS's `Map` / Python's `OrderedDict`) so that when two keys tie on frequency, the one that was touched longest ago is evicted first. Every time a key is used, remove it from its old frequency bucket (bumping the global minimum frequency if that bucket becomes empty and was the minimum) and re-insert it at the back of the next frequency bucket.",
    ],
    solutionApproach:
      "Maintain: a `keyVal` map (key -> value), a `keyFreq` map (key -> current use count), and a `freqKeys` map from frequency -> insertion-ordered set of keys currently at that frequency, plus a running `minFreq`. `get`/an update `put` both call a shared `touch(key)`: remove the key from `freqKeys[oldFreq]` (deleting the bucket and bumping `minFreq` if that bucket becomes empty and was the minimum), then add it to `freqKeys[oldFreq+1]` and bump `keyFreq[key]`. A fresh `put` for a new key, when the cache is full, evicts the front (least-recently-used) key of `freqKeys[minFreq]` — the least-frequently-used bucket, with recency as the tie-break — before inserting the new key at frequency 1 and resetting `minFreq` to 1. Because ordered maps support O(1) delete-and-reinsert-at-the-end, every operation is O(1) average.",
    pythonSolutionCode:
      'from collections import defaultdict, OrderedDict\n\n\nclass LFUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.key_val = {}\n        self.key_freq = {}\n        self.freq_keys = defaultdict(OrderedDict)\n        self.min_freq = 0\n\n    def _touch(self, key):\n        freq = self.key_freq[key]\n        del self.freq_keys[freq][key]\n        if not self.freq_keys[freq]:\n            del self.freq_keys[freq]\n            if self.min_freq == freq:\n                self.min_freq += 1\n        self.key_freq[key] = freq + 1\n        self.freq_keys[freq + 1][key] = None\n\n    def get(self, key):\n        if self.capacity == 0 or key not in self.key_val:\n            return -1\n        val = self.key_val[key]\n        self._touch(key)\n        return val\n\n    def put(self, key, value):\n        if self.capacity == 0:\n            return\n        if key in self.key_val:\n            self.key_val[key] = value\n            self._touch(key)\n            return\n        if len(self.key_val) >= self.capacity:\n            evict_key, _ = self.freq_keys[self.min_freq].popitem(last=False)\n            if not self.freq_keys[self.min_freq]:\n                del self.freq_keys[self.min_freq]\n            del self.key_val[evict_key]\n            del self.key_freq[evict_key]\n        self.key_val[key] = value\n        self.key_freq[key] = 1\n        self.freq_keys[1][key] = None\n        self.min_freq = 1\n',
    solve: (ops) => {
      let capacity = 0;
      let keyVal = new Map();
      let keyFreq = new Map();
      let freqKeys = new Map();
      let minFreq = 0;
      const results = [];

      const touch = (key) => {
        const freq = keyFreq.get(key);
        const bucket = freqKeys.get(freq);
        bucket.delete(key);
        if (bucket.size === 0) {
          freqKeys.delete(freq);
          if (minFreq === freq) minFreq += 1;
        }
        const newFreq = freq + 1;
        keyFreq.set(key, newFreq);
        if (!freqKeys.has(newFreq)) freqKeys.set(newFreq, new Map());
        freqKeys.get(newFreq).set(key, true);
      };

      for (const op of ops) {
        if (op.name === 'LFUCache') {
          capacity = op.args[0];
          keyVal = new Map();
          keyFreq = new Map();
          freqKeys = new Map();
          minFreq = 0;
        } else if (op.name === 'get') {
          const key = op.args[0];
          if (capacity === 0 || !keyVal.has(key)) {
            results.push(-1);
            continue;
          }
          const val = keyVal.get(key);
          touch(key);
          results.push(val);
        } else if (op.name === 'put') {
          if (capacity === 0) continue;
          const [key, value] = op.args;
          if (keyVal.has(key)) {
            keyVal.set(key, value);
            touch(key);
            continue;
          }
          if (keyVal.size >= capacity) {
            const bucket = freqKeys.get(minFreq);
            const evictKey = bucket.keys().next().value;
            bucket.delete(evictKey);
            if (bucket.size === 0) freqKeys.delete(minFreq);
            keyVal.delete(evictKey);
            keyFreq.delete(evictKey);
          }
          keyVal.set(key, value);
          keyFreq.set(key, 1);
          if (!freqKeys.has(1)) freqKeys.set(1, new Map());
          freqKeys.get(1).set(key, true);
          minFreq = 1;
        }
      }
      return results;
    },
    exampleExplanation: () =>
      "Each `get` reflects the cache's contents at that point, after any evictions caused by earlier `put` calls choosing the least-frequently-used (then least-recently-used) key to remove.",
    edgeCases: [
      {
        args: [
          [
            { name: 'LFUCache', args: [2] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [2, 2] },
            { name: 'get', args: [1] },
            { name: 'put', args: [3, 3] },
            { name: 'get', args: [2] },
            { name: 'get', args: [3] },
            { name: 'put', args: [4, 4] },
            { name: 'get', args: [1] },
            { name: 'get', args: [3] },
            { name: 'get', args: [4] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'LFUCache', args: [0] },
            { name: 'put', args: [0, 0] },
            { name: 'get', args: [0] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'LFUCache', args: [1] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [2, 2] },
            { name: 'get', args: [1] },
            { name: 'get', args: [2] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'LFUCache', args: [2] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [1, 10] },
            { name: 'get', args: [1] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Design HashMap',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'int',
      queryOps: ['get'],
      genOps: (rng) => {
        const ops = [{ name: 'MyHashMap', args: [] }];
        const keys = Array.from({ length: 6 }, (_, i) => i * 2);
        const count = randInt(rng, 8, 16);
        for (let i = 0; i < count; i += 1) {
          const key = keys[randInt(rng, 0, keys.length - 1)];
          const roll = rng();
          if (roll < 0.45) {
            ops.push({ name: 'put', args: [key, randInt(rng, 1, 100)] });
          } else if (roll < 0.8) {
            ops.push({ name: 'get', args: [key] });
          } else {
            ops.push({ name: 'remove', args: [key] });
          }
        }
        ops.push({ name: 'get', args: [keys[randInt(rng, 0, keys.length - 1)]] });
        return ops;
      },
    },
    statement:
      'Design a hash map without using any built-in hash table library, supporting:\n\n- `MyHashMap()` — initializes an empty map.\n- `put(key, value)` — inserts `(key, value)`; if `key` already exists, updates its value.\n- `get(key)` — returns the value for `key`, or `-1` if `key` is not present.\n- `remove(key)` — removes `key` and its value if present (no-op otherwise).',
    constraints: '- `0 <= key, value <= 10^6`\n- The first operation in every sequence is always `MyHashMap` (no arguments).\n- At most `10^4` calls to `put`, `get`, and `remove` combined.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName` followed by its arguments, e.g. `MyHashMap`, `put 1 5`, `get 1`, `remove 1`.',
    outputFormat: 'One line per `get` call, in order, with that call\'s result (`-1` if the key is absent). Other operations produce no output.',
    hints: [
      "The point of this exercise is the bucketing/collision strategy behind a hash map, not just \"use a language dictionary\" — but functionally, get/put/remove need to run in expected O(1) each.",
      'A classic from-scratch design uses a fixed array of buckets (e.g. sized ~1000-10000), each bucket holding a small list of `[key, value]` pairs; `hash(key) = key % numBuckets` picks the bucket, and a linear scan within the (small) bucket handles collisions.',
      'On `put`, scan the target bucket for an existing entry with that key and update it in place; only append a new entry if none was found. `get`/`remove` scan the same bucket and act on a match (or do nothing / return -1 if none exists).',
    ],
    solutionApproach:
      'Allocate a fixed number of buckets (e.g. 1009, a prime, to spread keys evenly) where each bucket is a small array of `[key, value]` pairs. `hash(key) = key % numBuckets` selects the bucket. `put` scans the bucket for a pair with a matching key — updates it if found, otherwise appends `[key, value]`. `get` scans the bucket and returns the matching value, or `-1`. `remove` scans the bucket and splices out a matching pair if found. Since real-world keys spread across buckets, each bucket stays small and every operation is expected O(1); worst case (all keys colliding into one bucket) degrades to O(n) for that bucket, same as any chained hash table.',
    pythonSolutionCode:
      'class MyHashMap:\n    def __init__(self):\n        self.num_buckets = 1009\n        self.buckets = [[] for _ in range(self.num_buckets)]\n\n    def _bucket(self, key):\n        return self.buckets[key % self.num_buckets]\n\n    def put(self, key, value):\n        bucket = self._bucket(key)\n        for pair in bucket:\n            if pair[0] == key:\n                pair[1] = value\n                return\n        bucket.append([key, value])\n\n    def get(self, key):\n        for k, v in self._bucket(key):\n            if k == key:\n                return v\n        return -1\n\n    def remove(self, key):\n        bucket = self._bucket(key)\n        for i, (k, _) in enumerate(bucket):\n            if k == key:\n                bucket.pop(i)\n                return\n',
    solve: (ops) => {
      const numBuckets = 1009;
      let buckets = Array.from({ length: numBuckets }, () => []);
      const results = [];
      for (const op of ops) {
        if (op.name === 'MyHashMap') {
          buckets = Array.from({ length: numBuckets }, () => []);
        } else if (op.name === 'put') {
          const [key, value] = op.args;
          const bucket = buckets[key % numBuckets];
          const found = bucket.find((pair) => pair[0] === key);
          if (found) found[1] = value;
          else bucket.push([key, value]);
        } else if (op.name === 'get') {
          const [key] = op.args;
          const bucket = buckets[key % numBuckets];
          const found = bucket.find((pair) => pair[0] === key);
          results.push(found ? found[1] : -1);
        } else if (op.name === 'remove') {
          const [key] = op.args;
          const bucket = buckets[key % numBuckets];
          const idx = bucket.findIndex((pair) => pair[0] === key);
          if (idx !== -1) bucket.splice(idx, 1);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each `get` reflects whatever the most recent `put`/`remove` on that key left behind.',
    edgeCases: [
      {
        args: [
          [
            { name: 'MyHashMap', args: [] },
            { name: 'get', args: [1] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashMap', args: [] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [2, 2] },
            { name: 'get', args: [1] },
            { name: 'get', args: [3] },
            { name: 'put', args: [2, 1] },
            { name: 'get', args: [2] },
            { name: 'remove', args: [2] },
            { name: 'get', args: [2] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashMap', args: [] },
            { name: 'remove', args: [5] },
            { name: 'get', args: [5] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashMap', args: [] },
            { name: 'put', args: [0, 0] },
            { name: 'get', args: [0] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Design HashSet',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'bool',
      queryOps: ['contains'],
      genOps: (rng) => {
        const ops = [{ name: 'MyHashSet', args: [] }];
        const keys = Array.from({ length: 6 }, (_, i) => i * 2);
        const count = randInt(rng, 8, 16);
        for (let i = 0; i < count; i += 1) {
          const key = keys[randInt(rng, 0, keys.length - 1)];
          const roll = rng();
          if (roll < 0.45) {
            ops.push({ name: 'add', args: [key] });
          } else if (roll < 0.8) {
            ops.push({ name: 'contains', args: [key] });
          } else {
            ops.push({ name: 'remove', args: [key] });
          }
        }
        ops.push({ name: 'contains', args: [keys[randInt(rng, 0, keys.length - 1)]] });
        return ops;
      },
    },
    statement:
      'Design a hash set without using any built-in set library, supporting:\n\n- `MyHashSet()` — initializes an empty set.\n- `add(key)` — inserts `key` into the set (no-op if already present).\n- `remove(key)` — removes `key` from the set if present (no-op otherwise).\n- `contains(key)` — returns `true` if `key` is in the set, `false` otherwise.',
    constraints: '- `0 <= key <= 10^6`\n- The first operation in every sequence is always `MyHashSet` (no arguments).\n- At most `10^4` calls to `add`, `remove`, and `contains` combined.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName` followed by its arguments, e.g. `MyHashSet`, `add 1`, `remove 1`, `contains 1`.',
    outputFormat: 'One line per `contains` call, in order, with `true` or `false`. Other operations produce no output.',
    hints: [
      'This is the same bucketing idea as designing a hash map, just tracking presence instead of a key-value pair.',
      'Use a fixed array of buckets, each holding the small list of keys currently hashed into it, with `hash(key) = key % numBuckets` picking the bucket.',
      '`add` should scan its bucket first so adding an already-present key stays a no-op rather than creating a duplicate; `remove` and `contains` scan the same bucket for a match.',
    ],
    solutionApproach:
      'Allocate a fixed number of buckets (e.g. 1009, a prime) where each bucket is a small array of keys that hashed into it via `key % numBuckets`. `add` scans the bucket and only appends `key` if it is not already present. `contains` scans the bucket for `key` and returns whether it was found. `remove` scans the bucket and splices `key` out if found. Because real key sets spread across buckets, each bucket stays small and every operation is expected O(1) (worst case O(n) if all keys collide into one bucket, as with any chained hash table).',
    pythonSolutionCode:
      'class MyHashSet:\n    def __init__(self):\n        self.num_buckets = 1009\n        self.buckets = [[] for _ in range(self.num_buckets)]\n\n    def _bucket(self, key):\n        return self.buckets[key % self.num_buckets]\n\n    def add(self, key):\n        bucket = self._bucket(key)\n        if key not in bucket:\n            bucket.append(key)\n\n    def remove(self, key):\n        bucket = self._bucket(key)\n        if key in bucket:\n            bucket.remove(key)\n\n    def contains(self, key):\n        return key in self._bucket(key)\n',
    solve: (ops) => {
      const numBuckets = 1009;
      let buckets = Array.from({ length: numBuckets }, () => []);
      const results = [];
      for (const op of ops) {
        if (op.name === 'MyHashSet') {
          buckets = Array.from({ length: numBuckets }, () => []);
        } else if (op.name === 'add') {
          const [key] = op.args;
          const bucket = buckets[key % numBuckets];
          if (!bucket.includes(key)) bucket.push(key);
        } else if (op.name === 'remove') {
          const [key] = op.args;
          const bucket = buckets[key % numBuckets];
          const idx = bucket.indexOf(key);
          if (idx !== -1) bucket.splice(idx, 1);
        } else if (op.name === 'contains') {
          const [key] = op.args;
          results.push(buckets[key % numBuckets].includes(key));
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each `contains` reflects whatever the most recent `add`/`remove` on that key left behind.',
    edgeCases: [
      {
        args: [
          [
            { name: 'MyHashSet', args: [] },
            { name: 'contains', args: [1] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashSet', args: [] },
            { name: 'add', args: [1] },
            { name: 'add', args: [2] },
            { name: 'contains', args: [1] },
            { name: 'contains', args: [3] },
            { name: 'add', args: [2] },
            { name: 'contains', args: [2] },
            { name: 'remove', args: [2] },
            { name: 'contains', args: [2] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashSet', args: [] },
            { name: 'remove', args: [5] },
            { name: 'contains', args: [5] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'MyHashSet', args: [] },
            { name: 'add', args: [0] },
            { name: 'contains', args: [0] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },
];
