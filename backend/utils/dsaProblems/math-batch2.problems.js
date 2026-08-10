export default [
  {
    legacyProblemName: 'FizzBuzz',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'stringArray', min: 1, max: 10000 },
    statement:
      'Given an integer `n`, print one line for every integer `i` from `1` to `n` (inclusive) according to these rules:\n\n- If `i` is divisible by both `3` and `5`, print `"FizzBuzz"`.\n- Otherwise, if `i` is divisible by `3`, print `"Fizz"`.\n- Otherwise, if `i` is divisible by `5`, print `"Buzz"`.\n- Otherwise, print the number `i` itself.',
    constraints: '- `1 <= n <= 10^4`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'Exactly `n` lines: the FizzBuzz value for `1, 2, ..., n`, one per line, in order.',
    hints: [
      "Check the hardest-to-reach condition first: divisible by both 3 and 5 is the same as divisible by 15.",
      'If you check "divisible by 3" and "divisible by 5" as two separate independent `if`s (not `else if`), a multiple of 15 would wrongly print both "Fizz" and "Buzz" on separate lines instead of "FizzBuzz" — order your checks from most to least specific.',
      'Loop `i` from 1 to n, and for each i decide FizzBuzz vs Fizz vs Buzz vs the number itself with one chain of conditions.',
    ],
    solutionApproach:
      'Walk `i` from `1` to `n`. Test the most specific condition first — `i % 15 === 0` (divisible by both 3 and 5) — before the individual `i % 3 === 0` and `i % 5 === 0` checks, otherwise a multiple of 15 would match the wrong branch. Collect one line of output per `i`. O(n) time, O(n) output space.',
    pythonSolutionCode:
      'def fizz_buzz(n):\n    out = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            out.append("FizzBuzz")\n        elif i % 3 == 0:\n            out.append("Fizz")\n        elif i % 5 == 0:\n            out.append("Buzz")\n        else:\n            out.append(str(i))\n    return out\n',
    solve: (n) => {
      const out = [];
      for (let i = 1; i <= n; i += 1) {
        if (i % 15 === 0) out.push('FizzBuzz');
        else if (i % 3 === 0) out.push('Fizz');
        else if (i % 5 === 0) out.push('Buzz');
        else out.push(String(i));
      }
      return out;
    },
    exampleExplanation: (args, result) => `For n = ${args[0]}, the output has ${result.length} line(s), one per number from 1 to ${args[0]}.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [15], kind: 'edge' },
      { args: [16], kind: 'edge' },
      { args: [30], kind: 'edge' },
      { args: [10000], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Fibonacci Series',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'intArray', min: 1, max: 40 },
    statement:
      'Given an integer `n`, print the first `n` terms of the Fibonacci series, where the series is defined as `F(0) = 0`, `F(1) = 1`, and `F(i) = F(i-1) + F(i-2)` for `i >= 2`.\n\nFor example, the first 6 terms are `0, 1, 1, 2, 3, 5`.',
    constraints: '- `1 <= n <= 40`\n- The series always starts at `F(0) = 0`.',
    inputFormat: 'Line 1: the integer `n`, the number of terms to print.',
    outputFormat: 'A single line with the first `n` Fibonacci terms, space-separated.',
    hints: [
      'You only ever need the previous two terms to produce the next one — no need to recompute from scratch each time.',
      'Seed your sequence with `F(0) = 0` and `F(1) = 1`, then build forward.',
      'Handle `n = 1` as a special short case: the series is just `[0]`, since there is no second term to add yet.',
    ],
    solutionApproach:
      'Keep two running values, `a = F(0) = 0` and `b = F(1) = 1`. Push `a` to the result, then repeatedly push `b` and advance `(a, b) = (b, a + b)` until `n` terms have been collected. O(n) time, O(n) output space.',
    pythonSolutionCode:
      'def fibonacci_series(n):\n    res = []\n    a, b = 0, 1\n    for _ in range(n):\n        res.append(a)\n        a, b = b, a + b\n    return res\n',
    solve: (n) => {
      const res = [];
      let a = 0;
      let b = 1;
      for (let i = 0; i < n; i += 1) {
        res.push(a);
        [a, b] = [b, a + b];
      }
      return res;
    },
    exampleExplanation: (args, result) => `The first ${args[0]} term(s) of the series are [${result.join(', ')}].`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [20], kind: 'edge' },
      { args: [40], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'N-th Tribonacci Number',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 37 },
    statement:
      'The Tribonacci sequence `T` is defined by `T(0) = 0`, `T(1) = 1`, `T(2) = 1`, and for `n >= 0`, `T(n+3) = T(n) + T(n+1) + T(n+2)` (each term is the sum of the *three* terms before it, not two).\n\nGiven `n`, return the value of `T(n)`.',
    constraints: '- `0 <= n <= 37`\n- The answer is guaranteed to fit in a 32-bit signed integer.',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: `T(n)`.',
    hints: [
      'This is like Fibonacci, but every term depends on the three previous terms instead of two.',
      'Handle `n = 0` and `n = 1` directly from the definition before starting any loop, since they are given base cases.',
      'Keep a sliding window of the last three computed values and shift it forward once per step.',
    ],
    solutionApproach:
      'Start from the base cases `T(0)=0, T(1)=1, T(2)=1`. If `n` is 0, 1, or 2, return the matching base value directly. Otherwise, iterate from `i = 3` to `n`, at each step computing the next term as the sum of the previous three and sliding the three tracked values forward. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def tribonacci(n):\n    if n == 0:\n        return 0\n    if n in (1, 2):\n        return 1\n    a, b, c = 0, 1, 1\n    for _ in range(3, n + 1):\n        a, b, c = b, c, a + b + c\n    return c\n',
    solve: (n) => {
      if (n === 0) return 0;
      if (n === 1 || n === 2) return 1;
      let a = 0;
      let b = 1;
      let c = 1;
      for (let i = 3; i <= n; i += 1) {
        const next = a + b + c;
        a = b;
        b = c;
        c = next;
      }
      return c;
    },
    exampleExplanation: (args, result) => `T(${args[0]}) = ${result}, built up from the base cases T(0)=0, T(1)=1, T(2)=1.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [25], kind: 'edge' },
      { args: [37], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Prime Number Check',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: 0, max: 1000000 },
    statement:
      'Given an integer `n`, determine whether it is a prime number. A prime number is a natural number greater than `1` that has no positive divisors other than `1` and itself.\n\nReturn `true` if `n` is prime, and `false` otherwise (this includes `n <= 1`, which are never prime by definition).',
    constraints: '- `0 <= n <= 10^6`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` if `n` is prime, `false` otherwise.',
    hints: [
      'Numbers `0` and `1` are special-cased as not prime — check those first.',
      'You never need to test divisors all the way up to `n` — if `n` has a factor larger than its square root, it must also have a matching factor smaller than the square root.',
      'Trial-divide by every integer from `2` up to and including `floor(sqrt(n))`; any exact divisor found means `n` is not prime.',
    ],
    solutionApproach:
      'Immediately return `false` for `n < 2`. Then test divisibility by every integer `d` from `2` up to `floor(sqrt(n))` inclusive; if any divides `n` evenly, `n` is composite. If none do, `n` is prime. Checking only up to `sqrt(n)` is safe because factors always pair up around the square root, giving O(sqrt(n)) time.',
    pythonSolutionCode:
      'def is_prime(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n',
    solve: (n) => {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d += 1) {
        if (n % d === 0) return false;
      }
      return true;
    },
    exampleExplanation: (args, result) => (result ? `${args[0]} has no divisors other than 1 and itself, so it is prime.` : `${args[0]} has a divisor other than 1 and itself, so it is not prime.`),
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [17], kind: 'edge' },
      { args: [997], kind: 'edge' },
      { args: [999983], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Count Primes',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 100000 },
    statement:
      'Given an integer `n`, return the number of prime numbers that are strictly less than `n`.\n\nFor example, if `n = 10`, the primes less than 10 are `2, 3, 5, 7`, so the answer is `4`.',
    constraints: '- `0 <= n <= 10^5`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: the count of primes strictly less than `n`.',
    hints: [
      'Checking each number below n for primality individually (trial division per number) works but is slower than necessary — think about eliminating multiples in bulk instead.',
      'The Sieve of Eratosthenes marks every multiple of each prime as composite in one pass per prime, instead of re-testing each number from scratch.',
      'Start a boolean "is composite" array of size n, and for every number from 2 upward that is still unmarked, mark all of its multiples starting at its square; count what remains unmarked.',
    ],
    solutionApproach:
      'Use the Sieve of Eratosthenes: allocate a boolean array `composite` of size `n` (all false). For every `p` from `2` to `sqrt(n)`, if `composite[p]` is still false, mark every multiple of `p` starting at `p*p` as composite. Finally, count indices from `2` to `n-1` that were never marked composite. This runs in O(n log log n) time, far faster than testing each number individually.',
    pythonSolutionCode:
      'def count_primes(n):\n    if n < 3:\n        return 0\n    composite = [False] * n\n    p = 2\n    while p * p < n:\n        if not composite[p]:\n            for multiple in range(p * p, n, p):\n                composite[multiple] = True\n        p += 1\n    return sum(1 for i in range(2, n) if not composite[i])\n',
    solve: (n) => {
      if (n < 3) return 0;
      const composite = new Array(n).fill(false);
      for (let p = 2; p * p < n; p += 1) {
        if (!composite[p]) {
          for (let multiple = p * p; multiple < n; multiple += p) composite[multiple] = true;
        }
      }
      let count = 0;
      for (let i = 2; i < n; i += 1) if (!composite[i]) count += 1;
      return count;
    },
    exampleExplanation: (args, result) => `There are ${result} prime number(s) strictly less than ${args[0]}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [100], kind: 'edge' },
      { args: [100000], kind: 'stress' },
    ],
  },

  {
    legacyProblemName: 'Factorial of a Number',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 0, max: 15 },
    statement:
      'Given a non-negative integer `n`, return `n!` (n factorial), the product of all positive integers from `1` up to `n`.\n\nBy definition, `0! = 1`.',
    constraints: '- `0 <= n <= 15`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: `n!`.',
    hints: [
      'Factorial is just a running product — no need for recursion, though recursion works too.',
      'Remember the base case: `0! = 1`, not `0`.',
      'Multiply a running total by every integer from `1` to `n` in a single loop.',
    ],
    solutionApproach:
      'Initialize `result = 1`, then multiply it by every integer from `2` to `n` (multiplying by `1` is a no-op, so the loop can start at 2). Returning `1` immediately handles `n = 0` and `n = 1` correctly since the loop simply never executes. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n',
    solve: (n) => {
      let result = 1;
      for (let i = 2; i <= n; i += 1) result *= i;
      return result;
    },
    exampleExplanation: (args, result) => `${args[0]}! = ${result}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [15], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Check Even or Odd',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'string', min: -1000000000, max: 1000000000 },
    statement: 'Given an integer `n` (which may be negative, zero, or positive), print `"Even"` if `n` is divisible by `2`, and `"Odd"` otherwise.',
    constraints: '- `-10^9 <= n <= 10^9`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`"Even"` or `"Odd"`.',
    hints: [
      'Evenness only depends on the remainder when dividing by 2 — the sign of `n` does not change whether that remainder is zero.',
      "Compute `n % 2`: if it is `0`, the number is even; any non-zero remainder means it's odd.",
      'Negative numbers are just as valid here — for example, `-4` is even and `-7` is odd.',
    ],
    solutionApproach: 'Compute `n % 2` and compare it to `0`. In both JavaScript and Python, an even number (positive, negative, or zero) always has remainder `0` when divided by `2`, so a single modulo check is sufficient — no need to special-case sign or take an absolute value first. O(1) time.',
    pythonSolutionCode: 'def check_even_or_odd(n):\n    return "Even" if n % 2 == 0 else "Odd"\n',
    solve: (n) => (n % 2 === 0 ? 'Even' : 'Odd'),
    exampleExplanation: (args, result) => `${args[0]} is ${result.toLowerCase()}.`,
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [-1], kind: 'edge' },
      { args: [-2], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [1000], kind: 'edge' },
      { args: [-1000], kind: 'edge' },
      { args: [1000000000], kind: 'stress' },
      { args: [-1000000000], kind: 'stress' },
      { args: [999999999], kind: 'stress' },
    ],
  },
];
