import { randInt, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Single Number',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 8, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const pairCount = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      const seen = new Set();
      while (seen.size < pairCount + 1) seen.add(randInt(rng, cfg.min ?? -1000, cfg.max ?? 1000));
      const values = [...seen];
      const single = values.pop();
      const nums = [];
      for (const v of values) nums.push(v, v);
      nums.push(single);
      return [shuffle(rng, nums)];
    },
    statement:
      "Given a non-empty integer array `nums` where every element appears **exactly twice** except for one element which appears **exactly once**, find and return that single element.\n\nYour solution should run in linear time and use only constant extra space (no hash maps or sets).",
    constraints: '- `1 <= nums.length <= 3 * 10^4`\n- `-3 * 10^4 <= nums[i] <= 3 * 10^4`\n- Every element appears exactly twice except for one which appears exactly once.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the element that appears only once.',
    hints: [
      "A hash map counting occurrences works but needs O(n) extra space — the constant-space requirement is a hint toward a bitwise trick.",
      'XOR of a number with itself is `0`, and XOR is commutative/associative, so pairing order never matters.',
      'XOR every element of the array together in one pass — every duplicated value cancels itself out, leaving only the unique one.',
    ],
    solutionApproach:
      'XOR has two properties that solve this directly: `x ^ x = 0` and `x ^ 0 = x`, and XOR is commutative and associative so the order of operations does not matter. XOR-ing every element of the array together cancels out every value that appears twice (each pair XORs to `0`), leaving exactly the value that appeared once. O(n) time, O(1) space.',
    pythonSolutionCode: 'def single_number(nums):\n    result = 0\n    for n in nums:\n        result ^= n\n    return result\n',
    solve: (nums) => {
      let result = 0;
      for (const n of nums) result ^= n;
      return result;
    },
    exampleExplanation: (args, result) => `XOR-ing every element together cancels out all the duplicated pairs, leaving ${result} as the single unpaired value.`,
    edgeCases: [
      { args: [[5]], kind: 'edge' },
      { args: [[4, 1, 2, 1, 2]], kind: 'edge' },
      { args: [[-1, -1, -2]], kind: 'edge' },
      { args: [[0, 0, 7]], kind: 'edge' },
      { args: [[2, 2, 3, 3, 9]], kind: 'edge' },
      { args: [[-30000, 30000, -30000]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Single Number II',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 6, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const groupCount = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 6);
      const seen = new Set();
      while (seen.size < groupCount + 1) seen.add(randInt(rng, cfg.min ?? -1000, cfg.max ?? 1000));
      const values = [...seen];
      const single = values.pop();
      const nums = [];
      for (const v of values) nums.push(v, v, v);
      nums.push(single);
      return [shuffle(rng, nums)];
    },
    statement:
      "Given an integer array `nums` where every element appears **exactly three times** except for one element which appears **exactly once**, find and return that single element.\n\nYour solution should run in linear time and use only constant extra space.",
    constraints: '- `1 <= nums.length <= 3 * 10^4`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- Every element appears exactly three times except for one which appears exactly once.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the element that appears only once.',
    hints: [
      'Plain XOR (as in the appears-twice version) no longer works, because a value appearing three times does not cancel itself out — you need to reason about each bit position separately.',
      'For each of the 32 bit positions, sum how many numbers have that bit set. If a value truly appears three times, its contribution to that sum is a multiple of 3 — only the singleton bit breaks that pattern.',
      'You can track this per-bit-position counting with two accumulator variables (`ones`/`twos`) that cycle through states `0 -> 1 -> 2 -> 0` as each bit position is seen 0, 1, 2, or 3 times, instead of 32 separate counters.',
    ],
    solutionApproach:
      'For any bit position, if every number but one appears three times, the total count of set bits at that position (mod 3) equals the singleton\'s bit there. Rather than keeping 32 explicit counters, track two bitmasks, `ones` and `twos`, that together encode each bit\'s occurrence count mod 3: `ones = (ones ^ n) & ~twos` and `twos = (twos ^ n) & ~ones`, applied for every `n` in the array. After processing all elements, every bit that belongs to a value appearing three times has cycled back to 0 in both masks, so `ones` holds exactly the singleton value. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def single_number_ii(nums):\n    ones = twos = 0\n    for n in nums:\n        ones = (ones ^ n) & ~twos\n        twos = (twos ^ n) & ~ones\n    return ones\n',
    solve: (nums) => {
      let ones = 0;
      let twos = 0;
      for (const n of nums) {
        ones = (ones ^ n) & ~twos;
        twos = (twos ^ n) & ~ones;
      }
      return ones;
    },
    exampleExplanation: (args, result) => `Every value except ${result} appears three times in this array, so tracking each bit's count modulo 3 isolates ${result}.`,
    edgeCases: [
      { args: [[2]], kind: 'edge' },
      { args: [[0, 1, 0, 1, 0, 1, 99]], kind: 'edge' },
      { args: [[-2, -2, -2, -3]], kind: 'edge' },
      { args: [[5, 5, 5, 1, 1, 1, 7]], kind: 'edge' },
      { args: [[30000, 30000, 30000, -30000]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Single Number III',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 7, min: -1000, max: 1000 },
    genArgs: (rng, cfg) => {
      const pairCount = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 7);
      const seen = new Set();
      while (seen.size < pairCount + 2) seen.add(randInt(rng, cfg.min ?? -1000, cfg.max ?? 1000));
      const values = [...seen];
      const singles = [values.pop(), values.pop()];
      const nums = [...singles];
      for (const v of values) nums.push(v, v);
      return [shuffle(rng, nums)];
    },
    statement:
      "Given an integer array `nums` in which exactly **two** elements appear only once and every other element appears **exactly twice**, return the two elements that appear only once.\n\nSince there are two valid answers, print them in **ascending order** (smaller value first).",
    constraints:
      '- `2 <= nums.length <= 3 * 10^4`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- Exactly two elements appear once; every other element appears exactly twice.\n- The two singleton values are always distinct, so a canonical ascending order fully determines the printed answer.',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The two singleton values, ascending, space-separated.',
    hints: [
      'XOR-ing the whole array cancels every paired value, leaving `a ^ b` where `a` and `b` are the two singletons — but you still need to separate them.',
      'Any bit that is set in `a ^ b` is a bit where `a` and `b` differ. Pick any one such bit (e.g. the lowest set bit) to split the numbers into two groups.',
      'Every paired value has both copies land in the same group (since they are identical), so XOR-ing within each group in isolation recovers `a` and `b` separately.',
    ],
    solutionApproach:
      'XOR every element together; duplicated pairs cancel, leaving `xorAll = a ^ b` for the two singletons `a` and `b`. Isolate the lowest set bit of `xorAll` with `diff = xorAll & (-xorAll)` — this bit is guaranteed to differ between `a` and `b`. Split the array into two groups by whether that bit is set, and XOR each group independently: since every duplicated pair shares the same bit value there, they still cancel within their group, leaving exactly `a` in one group and `b` in the other. Sort the pair ascending before returning. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def single_number_iii(nums):\n    xor_all = 0\n    for n in nums:\n        xor_all ^= n\n    diff = xor_all & (-xor_all)\n    a = 0\n    for n in nums:\n        if n & diff:\n            a ^= n\n    b = xor_all ^ a\n    return sorted([a, b])\n',
    solve: (nums) => {
      let xorAll = 0;
      for (const n of nums) xorAll ^= n;
      const diff = xorAll & -xorAll;
      let a = 0;
      for (const n of nums) {
        if (n & diff) a ^= n;
      }
      const b = xorAll ^ a;
      return [a, b].sort((x, y) => x - y);
    },
    exampleExplanation: (args, result) => `The two values that appear only once are ${result[0]} and ${result[1]}, printed smaller-first.`,
    edgeCases: [
      { args: [[1, 2]], kind: 'edge' },
      { args: [[1, 2, 1, 3, 2, 5]], kind: 'edge' },
      { args: [[-1, 0]], kind: 'edge' },
      { args: [[0, 1]], kind: 'edge' },
      { args: [[3, 3, 7, 9, 7, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Number of 1 Bits',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 2147483647 },
    statement:
      "Given an integer `n`, treat it as the binary representation of a 32-bit value and return the number of `1` bits it has (its **Hamming weight**).",
    constraints: '- `0 <= n <= 2^31 - 1` (a non-negative value whose 32-bit binary representation is well-defined).',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: the count of `1` bits in the 32-bit binary representation of `n`.',
    hints: [
      'You can check each of the 32 bit positions one at a time with a shift and a mask, but there is a trick that skips straight to the set bits.',
      '`n & (n - 1)` always clears exactly the lowest set bit of `n` — no matter how many zero bits sit below it.',
      'Repeatedly apply `n = n & (n - 1)` and count how many times you can do it before `n` becomes `0` — that count is the number of `1` bits.',
    ],
    solutionApproach:
      "Brian Kernighan's trick: `n & (n - 1)` clears the lowest set bit of `n`. Repeatedly clear the lowest set bit and count the iterations until `n` reaches `0` — the iteration count equals the number of `1` bits. This runs in O(k) time where `k` is the number of set bits (at most 32), rather than always checking all 32 positions.",
    pythonSolutionCode:
      'def hamming_weight(n):\n    count = 0\n    while n:\n        n &= n - 1\n        count += 1\n    return count\n',
    solve: (n) => {
      let count = 0;
      let x = n >>> 0;
      while (x !== 0) {
        x &= x - 1;
        count += 1;
      }
      return count;
    },
    exampleExplanation: (args, result) => `The 32-bit binary representation of ${args[0]} contains ${result} one-bit(s).`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [128], kind: 'edge' },
      { args: [11], kind: 'edge' },
      { args: [2147483647], kind: 'edge' },
      { args: [1073741824], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Counting Bits',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'intArray', min: 0, max: 10000 },
    statement:
      'Given an integer `n`, return an array `ans` of length `n + 1` where, for every `i` from `0` to `n`, `ans[i]` is the number of `1` bits in the binary representation of `i`.',
    constraints: '- `0 <= n <= 10^5`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single line with `n + 1` space-separated integers: the popcount of `0, 1, ..., n` in order.',
    hints: [
      'Computing the popcount of every number from scratch is wasteful — each number is closely related to a smaller one you already processed.',
      'Every integer `i` is either an even number `2*k` (same bit count as `k`, just shifted left) or an odd number `2*k + 1` (same bit count as `k`, plus one extra bit).',
      'That relationship is exactly `i >> 1`: build the answer with dynamic programming using `ans[i] = ans[i >> 1] + (i & 1)`.',
    ],
    solutionApproach:
      'Use dynamic programming on the observation that `i >> 1` is `i` with its lowest bit dropped, and `i & 1` tells you whether that dropped bit was a `1`. So `ans[i] = ans[i >> 1] + (i & 1)`, built up from `ans[0] = 0`. This computes all `n + 1` answers in O(n) total time, O(n) output space, reusing each previous answer instead of recomputing a popcount for every value.',
    pythonSolutionCode:
      'def counting_bits(n):\n    ans = [0] * (n + 1)\n    for i in range(1, n + 1):\n        ans[i] = ans[i >> 1] + (i & 1)\n    return ans\n',
    solve: (n) => {
      const ans = new Array(n + 1).fill(0);
      for (let i = 1; i <= n; i += 1) {
        ans[i] = ans[i >> 1] + (i & 1);
      }
      return ans;
    },
    exampleExplanation: (args, result) => `For n = ${args[0]}, the popcounts of 0 through ${args[0]} are [${result.join(', ')}].`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [16], kind: 'edge' },
      { args: [10000], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Reverse Bits',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 2147483647 },
    statement:
      "Given an integer `n` representing the bits of a 32-bit value, return the integer obtained by reversing the order of its 32 bits (bit 0 swaps with bit 31, bit 1 with bit 30, and so on).\n\nThe result should be printed as the non-negative decimal value of the reversed 32-bit pattern.",
    constraints:
      '- `0 <= n <= 2^31 - 1` (a non-negative value whose 32-bit binary representation is well-defined).\n- The output is the reversed 32-bit pattern read as an unsigned integer, so it may be larger than the input.',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: `n` with its 32 bits reversed, as an unsigned value.',
    hints: [
      "You need to look at all 32 bit positions of `n`, even the leading zero bits — the reversal isn't just about the bits that happen to be set.",
      'Peel off the lowest bit of `n` (`n & 1`) and it becomes the highest bit of the answer; then shift `n` right and shift your growing answer left, one position at a time.',
      'Repeat that peel-and-place step exactly 32 times, regardless of how large `n` is, since a 32-bit reversal always has exactly 32 positions to fill.',
    ],
    solutionApproach:
      'Build the result bit by bit: for each of the 32 iterations, shift the accumulated `result` left by one to make room, OR in the lowest bit of `n` (`n & 1`), then shift `n` right by one to expose its next bit. After 32 iterations, `result` holds `n`\'s bits in reverse order. Read/treated as an unsigned 32-bit value. O(1) time (fixed 32 iterations).',
    pythonSolutionCode:
      'def reverse_bits(n):\n    result = 0\n    for _ in range(32):\n        result = (result << 1) | (n & 1)\n        n >>= 1\n    return result\n',
    solve: (n) => {
      let result = 0;
      let x = n;
      for (let i = 0; i < 32; i += 1) {
        result = (result << 1) | (x & 1);
        x >>>= 1;
      }
      return result >>> 0;
    },
    exampleExplanation: (args, result) => `Reversing the 32-bit pattern of ${args[0]} bit-by-bit produces ${result}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [128], kind: 'edge' },
      { args: [43261596], kind: 'edge' },
      { args: [2147483647], kind: 'edge' },
      { args: [1073741824], kind: 'edge' },
    ],
  },
];
