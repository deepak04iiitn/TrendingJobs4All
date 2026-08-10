import { randInt, formatByType, linesOf, SHAPES } from '../dsaIOShapes.js';
import { defaultStarterCode } from '../dsaConstants.js';

/*
 * Two of this batch's problems ("Pow(x, n)" and "K-th Symbol in Grammar") take a pair
 * of plain scalars that don't match any shape in the shared catalog: a (float, int) pair
 * and an (int, int) pair respectively. Nothing in dsaIOShapes.js's catalog decodes two
 * bare scalars like that (the closest built-ins pair a scalar with an array/string, not
 * with each other). Per the guide's "bespoke: you own everything" allowance — and
 * following the precedent set in linkedlist-batch2.problems.js — we register two small,
 * fully self-contained shapes onto the shared registry (`SHAPES` is a plain exported
 * object, not frozen). Each id is namespaced with a `recursion_` prefix and used by
 * exactly one problem below, so there's no collision risk with the shared catalog or any
 * other authoring batch.
 */

// ---- recursion_pow_to_float: (x: float, n: int) -> x^n, printed as a float ----
SHAPES.recursion_pow_to_float = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    return [Number(L[0] || 0), parseInt(L[1] || '0', 10)];
  },
  encode: (x, n) => `${x}\n${n}`,
  gen: (rng, cfg = {}) => {
    // baseUnits/10 keeps x at one-decimal precision and away from 0 so random cases
    // never hit the x=0-with-negative-n undefined case; expMin/expMax stay small enough
    // that |x^n| never overflows a double (see the curated edge/stress cases for the
    // deliberately huge-|n| scenarios, which are hand-picked to avoid overflow too).
    let baseUnits = randInt(rng, cfg.baseMin ?? -30, cfg.baseMax ?? 30);
    if (baseUnits === 0) baseUnits = 1;
    const x = baseUnits / 10;
    const n = randInt(rng, cfg.expMin ?? -8, cfg.expMax ?? 8);
    return [x, n];
  },
  format: (result) => formatByType(result, 'float'),
  pretty: (args) => `x = ${args[0]}, n = ${args[1]}`,
  starter: (title) => defaultStarterCode(title),
};

// ---- recursion_two_ints_to_int: (n: row, k: 1-indexed position) -> 0 or 1 ----
SHAPES.recursion_two_ints_to_int = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    return [Number(L[0] || 0), Number(L[1] || 0)];
  },
  encode: (n, k) => `${n}\n${k}`,
  gen: (rng, cfg = {}) => {
    const n = randInt(rng, cfg.rowLo ?? 1, cfg.rowHi ?? 18);
    const maxK = 2 ** (n - 1);
    const k = randInt(rng, 1, maxK);
    return [n, k];
  },
  format: (result) => formatByType(result, 'int'),
  pretty: (args) => `n = ${args[0]}, k = ${args[1]}`,
  starter: (title) => defaultStarterCode(title),
};

export default [
  {
    legacyProblemName: 'Fibonacci using Recursion',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 25 },
    statement:
      'The Fibonacci sequence is defined by `F(0) = 0`, `F(1) = 1`, and `F(i) = F(i-1) + F(i-2)` for `i >= 2`. Given an integer `n`, write a **recursive** function that returns `F(n)`.\n\nSolve it by expressing `F(n)` directly in terms of smaller Fibonacci numbers — the recurrence itself should be your function body.',
    constraints:
      '- `0 <= n <= 25` (kept small because naive recursion re-solves the same subproblems many times and is exponential in `n`).\n- `F(0) = 0`, `F(1) = 1`.',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: `F(n)`.',
    hints: [
      'Think about how F(n) is defined in terms of two smaller Fibonacci numbers — that definition can be your entire function body.',
      'Every recursive function needs base case(s) that return directly without calling itself — what are F(0) and F(1)?',
      'Once the two recursive calls `fib(n-1)` and `fib(n-2)` return, the answer is just their sum.',
    ],
    solutionApproach:
      'Translate the recurrence directly into code: `fib(n) = n` for `n <= 1` (base cases), and `fib(n) = fib(n-1) + fib(n-2)` otherwise. This naive recursion recomputes the same subproblems many times, so it runs in exponential time O(2^n) — fine for the small `n` here, though in practice you would add memoization (or switch to an iterative approach) to bring it down to O(n).',
    pythonSolutionCode: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n',
    solve: (n) => {
      const fib = (m) => (m <= 1 ? m : fib(m - 1) + fib(m - 2));
      return fib(n);
    },
    exampleExplanation: (args, result) =>
      `F(${args[0]}) = ${result}, built by summing the two preceding Fibonacci numbers all the way down to the base cases F(0)=0 and F(1)=1.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [20], kind: 'edge' },
      { args: [25], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Factorial using Recursion',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 18 },
    statement:
      'The factorial of a non-negative integer `n`, written `n!`, is the product of all positive integers up to `n` (with `0! = 1` by definition). Given `n`, write a **recursive** function that returns `n!`.',
    constraints:
      '- `0 <= n <= 18` (kept small so the result stays an exact integer in a standard 64-bit / double numeric type).\n- `0! = 1`.',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: `n!`.',
    hints: [
      'The defining property of factorial is `n! = n * (n-1)!` — that recurrence is your recursive step.',
      'Every recursion needs a base case that does not call itself — what is `0!` (or `1!`)?',
      'Multiply `n` by the result of the recursive call on `n - 1`; you should never need a loop variable that accumulates the product.',
    ],
    solutionApproach:
      'Base case: `factorial(0) = 1` (and `factorial(1) = 1`). Recursive case: `factorial(n) = n * factorial(n - 1)`. Each call does O(1) work and there are `n` calls in the chain, so this runs in O(n) time and O(n) stack space.',
    pythonSolutionCode: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n',
    solve: (n) => {
      const fact = (m) => (m <= 1 ? 1 : m * fact(m - 1));
      return fact(n);
    },
    exampleExplanation: (args, result) => `${args[0]}! = ${result}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [18], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Reverse String using Recursion',
    shape: 'string_to_string',
    shapeConfig: { minN: 1, maxN: 15 },
    statement:
      'Given a string `s`, return the string with its characters in reverse order — but solve it **recursively**: express the reverse of a string in terms of the reverse of a smaller string.',
    constraints: '- `0 <= s.length <= 15`\n- `s` consists of lowercase English letters (or is empty).',
    inputFormat: 'Line 1: the string `s` (may be empty, i.e. a blank line).',
    outputFormat: 'The reversed string (a blank line if `s` is empty).',
    hints: [
      'The reverse of a string equals the reverse of everything after its first character, followed by that first character.',
      'Base case: a string of length 0 or 1 is already its own reverse.',
      'Peel off the first character (`s[0]` / `s[1:]` in Python), recurse on the rest, then append that first character at the end of the recursive result.',
    ],
    solutionApproach:
      'If `s` has length `<= 1`, it is its own reverse (base case). Otherwise, `reverse(s) = reverse(s[1:]) + s[0]` — recursively reverse everything after the first character, then place the first character at the end. This makes O(n) recursive calls; the naive string-concatenation version shown here does O(n) work per call for O(n^2) time overall (an accumulator-passing version reduces this to O(n)).',
    pythonSolutionCode: 'def reverse_string(s):\n    if len(s) <= 1:\n        return s\n    return reverse_string(s[1:]) + s[0]\n',
    solve: (s) => {
      const rev = (str) => (str.length <= 1 ? str : rev(str.slice(1)) + str[0]);
      return rev(s);
    },
    exampleExplanation: (args, result) => `"${args[0]}" reversed is "${result}".`,
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: ['a'], kind: 'edge' },
      { args: ['ab'], kind: 'edge' },
      { args: ['racecar'], kind: 'edge' },
      { args: ['zzzz'], kind: 'edge' },
      { args: ['abcdefghijklmno'], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Power of Two using Recursion',
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
      'Given an integer `n`, return `true` if `n` is a power of two (`n = 2^x` for some non-negative integer `x`), and `false` otherwise — but determine it **recursively** by repeatedly halving `n`, rather than using a one-line bit trick.',
    constraints: '- `-2^31 <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Negative numbers and zero are never powers of two — handle those as an immediate base case.',
      '1 (which is 2^0) is itself a power of two — another base case that stops the recursion.',
      'For any other n, it can only be a power of two if it is even; if it is, recurse on n / 2 and ask the exact same question one level down.',
    ],
    solutionApproach:
      'Base cases: `n <= 0` is never a power of two; `n === 1` (2^0) always is. Otherwise `n` can only be a power of two if it is even — an odd `n` (other than 1) fails immediately, while an even `n` recurses on `n / 2`. Each call divides `n` by 2, so the recursion terminates in O(log n) steps.',
    pythonSolutionCode:
      'def is_power_of_two(n):\n    if n <= 0:\n        return False\n    if n == 1:\n        return True\n    if n % 2 != 0:\n        return False\n    return is_power_of_two(n // 2)\n',
    solve: (n) => {
      const rec = (m) => {
        if (m <= 0) return false;
        if (m === 1) return true;
        if (m % 2 !== 0) return false;
        return rec(m / 2);
      };
      return rec(n);
    },
    exampleExplanation: (args, result) =>
      result
        ? `${args[0]} can be repeatedly halved down to 1, so it is a power of two.`
        : `${args[0]} is not a power of two (it is non-positive, or does not halve evenly down to 1).`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [-1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [1024], kind: 'edge' },
      { args: [2147483647], kind: 'stress' },
      { args: [-2147483648], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Pow(x, n)',
    shape: 'recursion_pow_to_float',
    shapeConfig: { baseMin: -30, baseMax: 30, expMin: -8, expMax: 8 },
    comparisonMode: 'float',
    comparisonConfig: { epsilon: 1e-4 },
    statement:
      'Implement `pow(x, n)`, which computes `x` raised to the integer power `n` (i.e. `x^n`).\n\nUse a **recursive divide-and-conquer** approach (binary/"fast" exponentiation) rather than multiplying `x` by itself `n` times — the naive approach is far too slow once `n` is large.',
    constraints:
      "- `-100.0 < x < 100.0`\n- `-2^31 <= n <= 2^31 - 1`, and `n` is always an integer.\n- Either `x` is non-zero or `n > 0` (so `0` raised to a negative power never occurs).\n- Answers are graded with a `1e-4` absolute tolerance on the floating-point result (`comparisonMode: 'float'`), and are guaranteed not to overflow a standard double.",
    inputFormat: 'Line 1: the floating-point number `x`. Line 2: the integer `n`.',
    outputFormat: 'A single floating-point number: `x^n`, printed to 5 decimal places.',
    hints: [
      'Multiplying x by itself n times is O(n) — with |n| up to 2^31 that is far too slow to finish in time.',
      'Notice that `x^n = (x^(n/2))^2` whenever n is even — that halves the exponent at every recursive step.',
      'Handle an odd exponent by pulling out one extra factor of x after squaring, and handle negative n by computing the positive power `x^(-n)` first and returning its reciprocal.',
    ],
    solutionApproach:
      'Binary ("fast") exponentiation: to compute `x^n`, recursively compute `half = x^floor(n/2)`, then the answer is `half * half` if `n` is even, or `half * half * x` if `n` is odd (base case `x^0 = 1`). For negative `n`, compute `x^(-n)` the same way and return its reciprocal. Each recursive call halves the exponent, so this runs in O(log n) time instead of the naive O(n).',
    pythonSolutionCode:
      'def my_pow(x, n):\n    def fast_pow(base, exp):\n        if exp == 0:\n            return 1.0\n        half = fast_pow(base, exp // 2)\n        half_sq = half * half\n        return half_sq if exp % 2 == 0 else half_sq * base\n\n    if n < 0:\n        return 1 / fast_pow(x, -n)\n    return fast_pow(x, n)\n',
    solve: (x, n) => {
      const fastPow = (base, exp) => {
        if (exp === 0) return 1;
        const half = fastPow(base, Math.floor(exp / 2));
        const halfSq = half * half;
        return exp % 2 === 0 ? halfSq : halfSq * base;
      };
      return n < 0 ? 1 / fastPow(x, -n) : fastPow(x, n);
    },
    exampleExplanation: (args, result) => `${args[0]}^${args[1]} ≈ ${Number(result).toFixed(5)}.`,
    edgeCases: [
      { args: [2.0, 10], kind: 'edge' },
      { args: [2.1, 3], kind: 'edge' },
      { args: [2.0, -2], kind: 'edge' },
      { args: [0.0, 5], kind: 'edge' },
      { args: [3.0, 0], kind: 'edge' },
      { args: [-1.0, 3], kind: 'edge' },
      { args: [1.0, 2147483647], kind: 'stress' },
      { args: [2.0, -2147483648], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'K-th Symbol in Grammar',
    shape: 'recursion_two_ints_to_int',
    shapeConfig: { rowLo: 1, rowHi: 18 },
    statement:
      'We build a table of binary strings row by row: row 1 is `"0"`. To build row `i` from row `i-1`, replace every `0` with `01` and every `1` with `10`.\n\nGiven the row number `n` and a 1-indexed position `k` within that row, return the symbol (`0` or `1`) at position `k` in row `n` — without ever materializing the full row (it doubles in length every row, so row 30 alone has over 500 million symbols).',
    constraints: '- `1 <= n <= 30`\n- `1 <= k <= 2^(n-1)`',
    inputFormat: 'Line 1: the integer `n`. Line 2: the integer `k`.',
    outputFormat: 'A single integer, `0` or `1`: the symbol at position `k` in row `n`.',
    hints: [
      'Row n is built by expanding every symbol of row n-1 into a pair of symbols, so position k in row n descends from exactly one "parent" symbol at position ceil(k/2) in row n-1.',
      'From the expansion rule (`0` -> `"01"`, `1` -> `"10"`), work out whether your position is the first or second half of its parent pair, and whether that means "same as parent" or "flipped".',
      'That gives a clean recursion: `kth(1, 1) = 0`, and `kth(n, k)` is derived from `kth(n-1, ceil(k/2))` depending on whether k is odd or even — no row string ever needs to be built.',
    ],
    solutionApproach:
      "Every symbol in row n descends from exactly one 'parent' symbol in row n-1, at position `ceil(k/2)`. Since `0` expands to `01` and `1` expands to `10`, the first symbol of a pair (k odd) always equals its parent, and the second symbol of a pair (k even) is always the parent flipped. So `kth(1, 1) = 0`, and for `n > 1`: `kth(n, k) = kth(n-1, ceil(k/2))` if k is odd, otherwise `1 - kth(n-1, ceil(k/2))`. This makes only `n` recursive calls total (one per row), so it runs in O(n) time without ever constructing a row.",
    pythonSolutionCode:
      'def kth_grammar(n, k):\n    def kth(row, pos):\n        if row == 1:\n            return 0\n        parent = kth(row - 1, (pos + 1) // 2)\n        return parent if pos % 2 == 1 else 1 - parent\n\n    return kth(n, k)\n',
    solve: (n, k) => {
      const kth = (row, pos) => {
        if (row === 1) return 0;
        const parent = kth(row - 1, Math.ceil(pos / 2));
        return pos % 2 === 1 ? parent : 1 - parent;
      };
      return kth(n, k);
    },
    exampleExplanation: (args, result) => `Row ${args[0]}, position ${args[1]} holds the symbol ${result}.`,
    edgeCases: [
      { args: [1, 1], kind: 'edge' },
      { args: [2, 1], kind: 'edge' },
      { args: [2, 2], kind: 'edge' },
      { args: [3, 3], kind: 'edge' },
      { args: [4, 5], kind: 'edge' },
      { args: [30, 1], kind: 'stress' },
      { args: [30, 2 ** 29], kind: 'stress' },
    ],
  },
];
