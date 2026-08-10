import { randInt, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Power of Two',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: -2147483648, max: 2147483647 },
    genArgs: (rng, cfg) => {
      if (rng() < 0.5) {
        const k = randInt(rng, 0, 30);
        return [2 ** k];
      }
      return [randInt(rng, cfg.min ?? -2147483648, cfg.max ?? 2147483647)];
    },
    statement:
      'Given an integer `n`, return `true` if `n` is a power of two (that is, `n = 2^x` for some non-negative integer `x`), and `false` otherwise.',
    constraints: '- `-2^31 <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` if `n` is a power of two, `false` otherwise.',
    hints: [
      'Repeatedly dividing by 2 while the result stays a whole number works, but there is a constant-time trick using bits.',
      'Look at the binary representation of powers of two: 1, 10, 100, 1000, ... — each has exactly one set bit.',
      "Subtracting 1 from a number with a single set bit flips that bit off and every bit below it on: n & (n - 1) clears the lowest set bit, so for a true power of two that result is always 0 (and n itself must be positive).",
    ],
    solutionApproach:
      'A positive integer is a power of two exactly when its binary form has exactly one set bit. The expression `n & (n - 1)` clears the lowest set bit of `n` — if `n` only had one bit set to begin with, the result is `0`. So the whole check is `n > 0 && (n & (n - 1)) === 0`; the `n > 0` guard rules out zero and negative numbers, which can never be a power of two. O(1) time, O(1) space.',
    pythonSolutionCode: 'def is_power_of_two(n):\n    return n > 0 and (n & (n - 1)) == 0\n',
    solve: (n) => n > 0 && (n & (n - 1)) === 0,
    exampleExplanation: (args, result) =>
      result ? `${args[0]} is 2 raised to some whole-number power.` : `${args[0]} cannot be written as 2^x for a non-negative integer x.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [-1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [16], kind: 'edge' },
      { args: [1073741824], kind: 'edge' },
      { args: [2147483647], kind: 'stress' },
      { args: [-2147483648], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Power of Three',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: -2147483648, max: 2147483647 },
    genArgs: (rng, cfg) => {
      if (rng() < 0.5) {
        const k = randInt(rng, 0, 19);
        return [3 ** k];
      }
      return [randInt(rng, cfg.min ?? -2147483648, cfg.max ?? 2147483647)];
    },
    statement:
      'Given an integer `n`, return `true` if `n` is a power of three (that is, `n = 3^x` for some non-negative integer `x`), and `false` otherwise.',
    constraints: '- `-2^31 <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` if `n` is a power of three, `false` otherwise.',
    hints: [
      'There is no neat single-bit test like there is for powers of two, since 3 is not the base of our number system\'s bits — but you can still peel off factors.',
      'If `n` is a power of three, dividing it by 3 repeatedly (while it divides evenly) should leave you with exactly `1` at the end, never something else.',
      'For an O(1) trick: because 3 is prime, the *only* divisors of the largest power of three that fits in a 32-bit signed integer (`3^19 = 1162261467`) are the powers of three themselves — so `n` is a power of three iff `n > 0` and `1162261467 % n == 0`.',
    ],
    solutionApproach:
      'Since 3 is prime, every divisor of `3^19 = 1162261467` (the largest power of three representable in a 32-bit signed integer) is itself a power of three, and every non-negative power of three up to `3^19` divides it evenly. So the whole check collapses to `n > 0 && 1162261467 % n === 0` — no loop needed. (An equally correct, more intuitive O(log₃ n) alternative is to repeatedly divide `n` by 3 while it divides evenly, then check whether you land on exactly 1.) O(1) time, O(1) space.',
    pythonSolutionCode: 'def is_power_of_three(n):\n    return n > 0 and 1162261467 % n == 0\n',
    solve: (n) => n > 0 && 1162261467 % n === 0,
    exampleExplanation: (args, result) =>
      result ? `${args[0]} is 3 raised to some whole-number power.` : `${args[0]} cannot be written as 3^x for a non-negative integer x.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [-1], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [9], kind: 'edge' },
      { args: [45], kind: 'edge' },
      { args: [1162261467], kind: 'edge' },
      { args: [2147483647], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Power of Four',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: -2147483648, max: 2147483647 },
    genArgs: (rng, cfg) => {
      if (rng() < 0.5) {
        const k = randInt(rng, 0, 15);
        return [4 ** k];
      }
      return [randInt(rng, cfg.min ?? -2147483648, cfg.max ?? 2147483647)];
    },
    statement:
      'Given an integer `n`, return `true` if `n` is a power of four (that is, `n = 4^x` for some non-negative integer `x`), and `false` otherwise.',
    constraints: '- `-2^31 <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` if `n` is a power of four, `false` otherwise.',
    hints: [
      'Every power of four is also a power of two (4^x = 2^(2x)), but not every power of two is a power of four — e.g. 8 and 32 are powers of two that fail this check.',
      'Start with the familiar power-of-two test, `n & (n - 1) === 0`, to confirm exactly one bit is set.',
      "The extra condition that separates powers of four from other powers of two is *which* bit is set: for a power of four it always sits at an even index (0, 2, 4, ...). Mask with `0x55555555` (binary ...01010101, ones at every even bit) and check the intersection is non-zero.",
    ],
    solutionApproach:
      "First apply the power-of-two check `n > 0 && (n & (n - 1)) === 0` to confirm `n` has exactly one set bit. Then confirm that bit sits at an even position by intersecting with the constant `0x55555555` (which has 1s at bit positions 0, 2, 4, ...); a power of four always has its single bit at an even index, while a power of two that is not a power of four (2, 8, 32, ...) has it at an odd index. O(1) time, O(1) space.",
    pythonSolutionCode: 'def is_power_of_four(n):\n    return n > 0 and (n & (n - 1)) == 0 and (n & 0x55555555) != 0\n',
    solve: (n) => n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0,
    exampleExplanation: (args, result) =>
      result ? `${args[0]} is 4 raised to some whole-number power.` : `${args[0]} cannot be written as 4^x for a non-negative integer x.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [-1], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [8], kind: 'edge' },
      { args: [16], kind: 'edge' },
      { args: [64], kind: 'edge' },
      { args: [1073741824], kind: 'edge' },
      { args: [2147483647], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Missing Number using XOR',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 0, maxN: 15, min: 0, max: 15 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 15);
      const full = Array.from({ length: n + 1 }, (_, i) => i);
      full.splice(randInt(rng, 0, n), 1);
      return [shuffle(rng, full)];
    },
    statement:
      'You are given an array `nums` containing `n` distinct numbers taken from the range `[0, n]`, so exactly one number in that range is missing from the array. Return the missing number.\n\nYou must solve it using **bitwise XOR** rather than summation or a hash set, so the solution never risks integer overflow and uses only O(1) extra space.',
    constraints: '- `0 <= n <= 10^4`\n- `0 <= nums[i] <= n`\n- All values in `nums` are distinct.\n- Your solution should use bitwise XOR, not arithmetic summation.',
    inputFormat: 'Line 1: the array `nums`, space-separated (may be empty when n = 0).',
    outputFormat: 'A single integer: the missing number in `[0, n]`.',
    hints: [
      'XOR-ing a number with itself always gives 0, and XOR-ing anything with 0 leaves it unchanged — that cancellation is the key tool here.',
      'If you XOR together every index `0..n-1`, every value actually present in `nums`, and the extra index `n` (since `nums` has one fewer element than the full range), every number that appears in both the index list and the value list cancels out in pairs.',
      'Only the number that was never in `nums` — the missing one — is left standing after all the cancellation.',
    ],
    solutionApproach:
      "Start `result` at `nums.length` (this represents the one index, `n`, that has no matching array position). Then, for every index `i` from `0` to `nums.length - 1`, XOR `result` with both `i` and `nums[i]`. Every value from `0` to `n` that actually appears in `nums` gets XORed in twice — once as an index, once as a value — and cancels to 0. The single number that is genuinely missing only ever gets XORed in once (as an index, never as a value), so it survives as the final `result`. O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def missing_number_xor(nums):\n    result = len(nums)\n    for i, num in enumerate(nums):\n        result ^= i ^ num\n    return result\n',
    solve: (nums) => {
      let result = nums.length;
      for (let i = 0; i < nums.length; i += 1) {
        result ^= i ^ nums[i];
      }
      return result;
    },
    exampleExplanation: (args, result) => `The numbers 0 through ${args[0].length} are expected; XOR-cancellation leaves ${result} as the one that never appeared.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[0, 1, 2]], kind: 'edge' },
      { args: [[3, 0, 1]], kind: 'edge' },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sum of Two Integers',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', min: -1000, max: 1000 },
    genArgs: (rng, cfg) => [[randInt(rng, cfg.min ?? -1000, cfg.max ?? 1000), randInt(rng, cfg.min ?? -1000, cfg.max ?? 1000)]],
    statement:
      'Given two integers `a` and `b`, return their sum. You may not use the `+` or `-` operators anywhere in your solution — compute the sum using bitwise operations only.',
    constraints: '- `-1000 <= a, b <= 1000`\n- The `+` and `-` operators may not be used.',
    inputFormat: 'Line 1: the two integers `a` and `b`, space-separated.',
    outputFormat: 'A single integer: `a + b`.',
    hints: [
      'Think about how you add two binary numbers by hand: at each bit position you combine the two bits and possibly carry a 1 into the next position.',
      'XOR (`^`) of two bits gives their sum ignoring any carry; AND (`&`) of two bits tells you exactly where a carry is generated, and that carry belongs one position to the left, i.e. shifted by `<< 1`.',
      'Repeat: let the XOR become your new running total and the shifted AND become a new "carry to add in" — keep going until there is no carry left to add.',
    ],
    solutionApproach:
      'Simulate binary addition without `+`. At each step, `a ^ b` gives the sum of `a` and `b` ignoring carries, and `(a & b) << 1` gives exactly the carry bits that need to be added in at the next position. Treat that carry as a new number to add: set `a` to the XOR result and `b` to the shifted-AND carry, and repeat until `b` becomes `0` (no carry left), at which point `a` holds the final sum. Because JavaScript\'s bitwise operators (and this problem\'s 32-bit integer domain) treat operands as fixed-width signed integers, the loop always terminates — the carry eventually shifts out of the 32-bit range. O(1) time (at most 32 iterations), O(1) space.',
    pythonSolutionCode:
      'def get_sum(nums):\n    a, b = nums\n    mask = 0xFFFFFFFF\n    a &= mask\n    b &= mask\n    while b != 0:\n        carry = (a & b) << 1 & mask\n        a = (a ^ b) & mask\n        b = carry\n    if a > 0x7FFFFFFF:\n        return ~(a ^ mask)\n    return a\n',
    solve: (nums) => {
      let a = nums[0] | 0;
      let b = nums[1] | 0;
      while (b !== 0) {
        const carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
      }
      return a;
    },
    exampleExplanation: (args, result) => `${args[0][0]} + ${args[0][1]} = ${result}, computed here purely with XOR/AND/shift instead of \`+\`.`,
    edgeCases: [
      { args: [[0, 0]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[-1, 1]], kind: 'edge' },
      { args: [[-2, -3]], kind: 'edge' },
      { args: [[1000, 1000]], kind: 'edge' },
      { args: [[-1000, -1000]], kind: 'edge' },
      { args: [[500, -500]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Bitwise AND of Numbers Range',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', min: 0, max: 100000 },
    genArgs: (rng, cfg) => {
      const lo = cfg.min ?? 0;
      const hi = cfg.max ?? 100000;
      let m = randInt(rng, lo, hi);
      let n = randInt(rng, lo, hi);
      if (m > n) [m, n] = [n, m];
      return [[m, n]];
    },
    statement:
      'Given two integers `m` and `n` where `m <= n`, return the bitwise AND of every number in the inclusive range `[m, n]`.\n\nFor example, for `m = 5, n = 7`, ANDing together `5 (101)`, `6 (110)`, and `7 (111)` gives `4 (100)`.',
    constraints: '- `0 <= m <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the two integers `m` and `n`, space-separated.',
    outputFormat: 'A single integer: the bitwise AND of all numbers from `m` to `n` inclusive.',
    hints: [
      "ANDing a whole range together is dominated by disagreement: any bit position where the numbers in the range don't all agree gets zeroed out. Ranges with more than one number almost always disagree in their low bits.",
      "The bits that survive are exactly the common binary prefix shared by `m` and `n` — every bit position where `m` and `n` themselves already agree, that low-order bits beyond that will vary somewhere across the range.",
      "Right-shift `m` and `n` together, one bit at a time, until they become equal — that common value is the shared prefix. Then shift it back left by the number of shifts you performed to restore its original bit positions (filling the shifted-off low bits with 0).",
    ],
    solutionApproach:
      "The bitwise AND of an entire range collapses to the common binary prefix of `m` and `n`: any bit where `m` and `n` differ must also take both 0 and 1 somewhere among the numbers strictly between them, so that bit is 0 in the final answer. Repeatedly right-shift both `m` and `n` by 1, counting the shifts, until they're equal — at that point they share the same prefix. Shifting that common prefix back left by the shift count restores it to its original bit positions (with 0s in the low bits that were shifted away, matching what a real range-AND produces). O(log n) time, O(1) space.",
    pythonSolutionCode:
      'def range_bitwise_and(nums):\n    m, n = nums\n    shift = 0\n    while m < n:\n        m >>= 1\n        n >>= 1\n        shift += 1\n    return m << shift\n',
    solve: (nums) => {
      let m = nums[0];
      let n = nums[1];
      let shift = 0;
      while (m < n) {
        m >>= 1;
        n >>= 1;
        shift += 1;
      }
      return m << shift;
    },
    exampleExplanation: (args, result) => `ANDing every integer from ${args[0][0]} through ${args[0][1]} together leaves only their shared binary prefix, ${result}.`,
    edgeCases: [
      { args: [[0, 0]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[5, 7]], kind: 'edge' },
      { args: [[0, 1]], kind: 'edge' },
      { args: [[1, 2147483647]], kind: 'stress' },
      { args: [[2147483646, 2147483647]], kind: 'edge' },
      { args: [[123, 456]], kind: 'edge' },
    ],
  },
];
