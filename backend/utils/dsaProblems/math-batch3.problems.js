import { randInt, randIntArray } from '../dsaIOShapes.js';

/** Shared Roman numeral helpers (used by both "Roman to Integer" and "Integer to Roman"). */
const ROMAN_PAIRS = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function intToRoman(num) {
  let n = num;
  let res = '';
  for (const [value, symbol] of ROMAN_PAIRS) {
    while (n >= value) {
      res += symbol;
      n -= value;
    }
  }
  return res;
}

const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function romanToInt(s) {
  let total = 0;
  for (let i = 0; i < s.length; i += 1) {
    const cur = ROMAN_VALUES[s[i]];
    const next = i + 1 < s.length ? ROMAN_VALUES[s[i + 1]] : 0;
    if (cur < next) total -= cur;
    else total += cur;
  }
  return total;
}

export default [
  {
    legacyProblemName: 'Reverse Integer',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: -2147483648, max: 2147483647 },
    statement:
      "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to fall outside the signed 32-bit integer range (`[-2^31, 2^31 - 1]`), return `0` instead.\n\nAssume your program cannot rely on a wider integer type happening to hold the intermediate value — a correct solution detects the overflow itself before returning.",
    constraints: '- `-2^31 <= x <= 2^31 - 1`\n- If the reversed value would overflow the signed 32-bit range, return `0`.',
    inputFormat: 'Line 1: the integer `x`.',
    outputFormat: 'A single integer: the digit-reversed value, or `0` on overflow.',
    hints: [
      "Peel off digits one at a time from the end using `% 10` and integer division by `10`, the same way you'd reverse a number by hand.",
      'Handle the sign separately: reverse the absolute value, then re-apply the original sign at the end.',
      'Overflow can only be checked after the number is fully reversed — compare the final value against `[-2^31, 2^31 - 1]` and return 0 if it falls outside.',
    ],
    solutionApproach:
      'Take the absolute value of `x` and repeatedly extract its last digit (`num % 10`), appending it to a running total (`rev = rev * 10 + digit`) while stripping that digit off `num` (`num = floor(num / 10)`). Re-apply the original sign once `num` reaches 0. Finally, compare the signed result against the 32-bit range `[-2^31, 2^31 - 1]`; if it falls outside, return `0` instead. O(log10(|x|)) time, O(1) space.',
    pythonSolutionCode:
      'def reverse(x):\n    sign = -1 if x < 0 else 1\n    num = abs(x)\n    rev = 0\n    while num > 0:\n        rev = rev * 10 + num % 10\n        num //= 10\n    rev *= sign\n    if rev < -2**31 or rev > 2**31 - 1:\n        return 0\n    return rev\n',
    solve: (x) => {
      const sign = x < 0 ? -1 : 1;
      let num = Math.abs(x);
      let rev = 0;
      while (num > 0) {
        rev = rev * 10 + (num % 10);
        num = Math.floor(num / 10);
      }
      rev *= sign;
      if (rev < -2147483648 || rev > 2147483647) return 0;
      return rev;
    },
    exampleExplanation: (args, result) =>
      result === 0 && args[0] !== 0
        ? `Reversing ${args[0]} would overflow the signed 32-bit range, so the answer is 0.`
        : `Reversing the digits of ${args[0]} gives ${result}.`,
    edgeCases: [
      { args: [123], kind: 'edge' },
      { args: [-123], kind: 'edge' },
      { args: [120], kind: 'edge' },
      { args: [0], kind: 'edge' },
      { args: [1534236469], kind: 'edge' },
      { args: [-2147483648], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Plus One',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 12, min: 0, max: 9 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12);
      const digits = randIntArray(rng, n, 0, 9);
      if (n > 1 && digits[0] === 0) digits[0] = randInt(rng, 1, 9);
      return [digits];
    },
    statement:
      'You are given a non-negative integer represented as an array of digits `digits`, where each element is a single digit and the most significant digit comes first (there are no leading zeros, except when the array represents the value `0` itself).\n\nIncrement the represented integer by one and return the resulting digits, again with the most significant digit first.',
    constraints: '- `1 <= digits.length <= 100`\n- `0 <= digits[i] <= 9`\n- `digits` has no leading zero, except for the single-element `[0]`.',
    inputFormat: 'Line 1: the digits of the number, space-separated, most significant first.',
    outputFormat: 'The digits of `digits + 1`, space-separated, most significant first.',
    hints: [
      'Adding one only ever changes a trailing run of 9s (plus the digit right before that run) — everything to the left of that run is untouched.',
      "Walk the digits from right to left: as soon as you find a digit that isn't a 9, incrementing it stops the carry immediately and you're done.",
      "If every digit is a 9, the whole array turns to zeros and gains one new leading digit (e.g. 999 -> 1000) — handle that case after the scan.",
    ],
    solutionApproach:
      "Scan the digits from the last one backward. The first digit that isn't a 9 can simply be incremented by one and returned immediately — everything after it was a 9 that already rolled over to 0. If the scan finishes without finding such a digit, every digit was a 9 (now all zeros), so prepend a new leading `1`. O(n) time, O(n) space for the output.",
    pythonSolutionCode:
      'def plus_one(digits):\n    res = digits[:]\n    i = len(res) - 1\n    while i >= 0:\n        if res[i] < 9:\n            res[i] += 1\n            return res\n        res[i] = 0\n        i -= 1\n    return [1] + res\n',
    solve: (digits) => {
      const res = [...digits];
      let i = res.length - 1;
      while (i >= 0) {
        if (res[i] < 9) {
          res[i] += 1;
          return res;
        }
        res[i] = 0;
        i -= 1;
      }
      return [1, ...res];
    },
    exampleExplanation: (args, result) => `Incrementing [${args[0].join(',')}] by one gives [${result.join(',')}].`,
    edgeCases: [
      { args: [[9]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[9, 9, 9]], kind: 'edge' },
      { args: [[0]], kind: 'edge' },
      { args: [[4, 3, 2, 1]], kind: 'edge' },
      { args: [[2, 9, 9]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Excel Sheet Column Number',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 7, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    statement:
      'Spreadsheet columns are labeled `A, B, C, ..., Z, AA, AB, ..., ZY, ZZ, AAA, ...`, similar to a base-26 number system except there is no symbol for zero. Given a column title `columnTitle` as it appears in a spreadsheet header, return its corresponding column number.',
    constraints:
      '- `1 <= columnTitle.length <= 7`\n- `columnTitle` consists only of uppercase English letters (`A`-`Z`).\n- The corresponding column number fits in a 32-bit signed integer.',
    inputFormat: 'Line 1: the column title string.',
    outputFormat: 'A single integer: the corresponding column number.',
    hints: [
      'This looks a lot like converting a base-26 number to decimal — except the "digits" run from 1 to 26 instead of 0 to 25.',
      "Process the letters left to right, keeping a running total: at each letter, multiply the total so far by 26 and add the letter's 1-indexed position in the alphabet.",
      "`'A'` contributes `1`, not `0` — that offset is the one twist versus an ordinary base conversion.",
    ],
    solutionApproach:
      "Walk the string left to right, maintaining a running total. At each character, update `total = total * 26 + value`, where `value` is the letter's 1-indexed position (`'A'` = 1, ..., `'Z'` = 26). This is exactly converting a base-26 number to base-10 with digits shifted up by one. O(n) time, O(1) space.",
    pythonSolutionCode: 'def title_to_number(column_title):\n    result = 0\n    for ch in column_title:\n        result = result * 26 + (ord(ch) - 64)\n    return result\n',
    solve: (s) => {
      let result = 0;
      for (let i = 0; i < s.length; i += 1) {
        result = result * 26 + (s.charCodeAt(i) - 64);
      }
      return result;
    },
    exampleExplanation: (args, result) => `"${args[0]}" converts to the column number ${result}.`,
    edgeCases: [
      { args: ['A'], kind: 'edge' },
      { args: ['Z'], kind: 'edge' },
      { args: ['AA'], kind: 'edge' },
      { args: ['AB'], kind: 'edge' },
      { args: ['ZY'], kind: 'edge' },
      { args: ['AAA'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Excel Sheet Column Title',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'string', min: 1, max: 2147483647 },
    statement:
      'Given a positive integer `columnNumber`, return its corresponding spreadsheet column title, exactly as it would appear in a spreadsheet header (`1 -> "A"`, `2 -> "B"`, ..., `26 -> "Z"`, `27 -> "AA"`, `28 -> "AB"`, ...).',
    constraints: '- `1 <= columnNumber <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `columnNumber`.',
    outputFormat: 'A single string: the corresponding column title (uppercase letters only).',
    hints: [
      "This is base-26, but since there's no symbol for zero (letters run 1-26, not 0-25), a plain modulo/divide loop needs a small adjustment.",
      'Before taking `n % 26` at each step, subtract 1 from `n` first — that shifts the 1-26 letter range down to the usual 0-25 digit range.',
      "Build the letters from last to first (just like building a number's digits in reverse) by prepending each one, then stop once `n` reaches 0.",
    ],
    solutionApproach:
      "Repeat: decrement `n` by 1 (shifting from 1-indexed letters to a 0-indexed digit), take `n % 26` to get the current letter (`0` -> `'A'`, ..., `25` -> `'Z'`), prepend it to the result, then set `n = floor(n / 26)`. Stop once `n` reaches 0. O(log26(n)) time.",
    pythonSolutionCode:
      "def convert_to_title(column_number):\n    n = column_number\n    letters = []\n    while n > 0:\n        n -= 1\n        letters.append(chr(65 + n % 26))\n        n //= 26\n    return ''.join(reversed(letters))\n",
    solve: (n) => {
      let num = n;
      let result = '';
      while (num > 0) {
        num -= 1;
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
      }
      return result;
    },
    exampleExplanation: (args, result) => `Column number ${args[0]} corresponds to the title "${result}".`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [26], kind: 'edge' },
      { args: [27], kind: 'edge' },
      { args: [52], kind: 'edge' },
      { args: [701], kind: 'edge' },
      { args: [703], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Roman to Integer',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int' },
    genArgs: (rng) => [intToRoman(randInt(rng, 1, 3999))],
    statement:
      'Roman numerals use seven symbols: `I=1, V=5, X=10, L=50, C=100, D=500, M=1000`. Symbols are normally added left to right (e.g. `VI = 5+1 = 6`), but six specific pairs are subtractive when a smaller-value symbol immediately precedes a larger one (`IV=4, IX=9, XL=40, XC=90, CD=400, CM=900`).\n\nGiven a valid Roman numeral string `s`, convert it to its integer value.',
    constraints:
      '- `1 <= s.length <= 15`\n- `s` contains only the characters `I, V, X, L, C, D, M`.\n- `s` is guaranteed to be a valid Roman numeral representing an integer in the range `[1, 3999]`.',
    inputFormat: 'Line 1: the Roman numeral string `s`.',
    outputFormat: 'A single integer: the value represented by `s`.',
    hints: [
      "Summing every symbol's value left to right would get `IV` wrong (it would read as 6 instead of 4) — subtractive pairs need special handling.",
      "Compare each symbol to the one immediately after it: if the current symbol's value is smaller than the next symbol's value, it should be subtracted rather than added.",
      'A single left-to-right pass with one symbol of lookahead correctly handles every case, including all six subtractive pairs, without naming each pair explicitly.',
    ],
    solutionApproach:
      "Map each symbol to its numeric value. Scan the string left to right; for each symbol, compare its value to the next symbol's value (if there is one). If the current value is smaller than the next one, subtract it from the running total (it's the first half of a subtractive pair like `IV`); otherwise add it. O(n) time, O(1) space.",
    pythonSolutionCode:
      "def roman_to_int(s):\n    values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}\n    total = 0\n    for i, ch in enumerate(s):\n        cur = values[ch]\n        nxt = values[s[i + 1]] if i + 1 < len(s) else 0\n        if cur < nxt:\n            total -= cur\n        else:\n            total += cur\n    return total\n",
    solve: (s) => romanToInt(s),
    exampleExplanation: (args, result) => `"${args[0]}" represents the integer ${result}.`,
    edgeCases: [
      { args: ['III'], kind: 'edge' },
      { args: ['LVIII'], kind: 'edge' },
      { args: ['MCMXCIV'], kind: 'edge' },
      { args: ['IV'], kind: 'edge' },
      { args: ['IX'], kind: 'edge' },
      { args: ['MMMCMXCIX'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Integer to Roman',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'string', min: 1, max: 3999 },
    statement:
      'Given an integer `num` in the range `[1, 3999]`, convert it to its Roman numeral representation, using the standard symbols `I, V, X, L, C, D, M` together with the six subtractive pairs (`IV, IX, XL, XC, CD, CM`) wherever they apply.',
    constraints: '- `1 <= num <= 3999`',
    inputFormat: 'Line 1: the integer `num`.',
    outputFormat: 'A single string: the Roman numeral representation of `num`.',
    hints: [
      'Rather than handling thousands/hundreds/tens/units as separate special cases, list every (value, symbol) pair you might need, from largest to smallest — including the six subtractive combinations.',
      'Work through that list greedily: for each (value, symbol) pair, append the symbol and subtract the value from `num` as many times as it still fits, then move to the next pair.',
      'Because subtractive pairs like `900 -> "CM"` sit in that list right alongside the plain symbols in descending order, the greedy pass produces correct subtractive notation automatically, with no extra branching.',
    ],
    solutionApproach:
      'Precompute a descending list of (value, symbol) pairs that interleaves the plain symbols (1000, 500, 100, 50, 10, 5, 1) with the six subtractive combinations (900, 400, 90, 40, 9, 4). Greedily walk the list: while `num` is at least the current value, append the symbol and subtract the value, then advance once it no longer fits. At most 13 iterations regardless of input, so effectively O(1) time.',
    pythonSolutionCode:
      "def int_to_roman(num):\n    pairs = [\n        (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),\n        (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),\n        (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I'),\n    ]\n    res = []\n    n = num\n    for value, symbol in pairs:\n        while n >= value:\n            res.append(symbol)\n            n -= value\n    return ''.join(res)\n",
    solve: (n) => intToRoman(n),
    exampleExplanation: (args, result) => `${args[0]} is written in Roman numerals as "${result}".`,
    edgeCases: [
      { args: [3], kind: 'edge' },
      { args: [58], kind: 'edge' },
      { args: [1994], kind: 'edge' },
      { args: [1], kind: 'edge' },
      { args: [3999], kind: 'edge' },
      { args: [4], kind: 'edge' },
    ],
  },
];
