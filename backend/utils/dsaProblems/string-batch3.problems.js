import { randInt, randString, shuffle } from '../dsaIOShapes.js';

/** Builds a genuinely-balanced random bracket string using a random mix of (), [], {}. */
function randomBalancedBrackets(rng, pairs) {
  const types = ['()', '[]', '{}'];
  const total = 2 * pairs;
  let s = '';
  let opened = 0;
  const openStack = [];
  for (let i = 0; i < total; i += 1) {
    const remaining = total - i;
    const canOpen = opened < pairs;
    const canClose = openStack.length > 0;
    const mustClose = canClose && openStack.length === remaining;
    if (canOpen && !mustClose && (!canClose || rng() < 0.55)) {
      const t = types[randInt(rng, 0, 2)];
      s += t[0];
      openStack.push(t[1]);
      opened += 1;
    } else {
      s += openStack.pop();
    }
  }
  return s;
}

export default [
  {
    legacyProblemName: 'Longest Substring Without Repeating Characters',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 0, maxN: 20, alphabet: 'abcdefgh' },
    statement:
      "Given a string `s`, find the length of the longest substring that does not contain any repeated characters. A substring is a contiguous run of characters within `s`.",
    constraints: '- `0 <= s.length <= 5*10^4`\n- `s` consists of English letters, digits, symbols, and spaces.',
    inputFormat: 'Line 1: the string `s` (may be empty).',
    outputFormat: 'A single integer: the length of the longest substring with all-distinct characters.',
    hints: [
      'A brute-force check of every substring is O(n^2) or worse — think about extending a window incrementally instead.',
      'Keep a sliding window `[start, end]` that always contains distinct characters, and a map of the last index each character was seen at.',
      'When you see a character already inside the current window, jump `start` to just past its previous occurrence rather than resetting to 0.',
    ],
    solutionApproach:
      "Sliding window with a hash map from character to its most recent index. Extend the window's right edge one character at a time; whenever the current character was last seen at or after `start`, move `start` to just past that previous occurrence. Track the best window length seen. O(n) time, O(min(n, alphabet size)) space.",
    pythonSolutionCode:
      'def length_of_longest_substring(s):\n    last_seen = {}\n    start = 0\n    best = 0\n    for i, c in enumerate(s):\n        if c in last_seen and last_seen[c] >= start:\n            start = last_seen[c] + 1\n        last_seen[c] = i\n        best = max(best, i - start + 1)\n    return best\n',
    solve: (s) => {
      const lastSeen = new Map();
      let start = 0;
      let best = 0;
      for (let i = 0; i < s.length; i += 1) {
        const c = s[i];
        if (lastSeen.has(c) && lastSeen.get(c) >= start) start = lastSeen.get(c) + 1;
        lastSeen.set(c, i);
        best = Math.max(best, i - start + 1);
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      result === 0
        ? 'The string is empty, so the longest distinct-character substring has length 0.'
        : `The longest run of characters with no repeats has length ${result}.`,
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: ['a'], kind: 'edge' },
      { args: ['bbbbb'], kind: 'edge' },
      { args: ['abcabcbb'], kind: 'edge' },
      { args: ['pwwkew'], kind: 'edge' },
      { args: ['abcdefg'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Repeating Character Replacement',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 20 },
    genArgs: (rng, cfg) => {
      const alphabet = 'ABCD';
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 20);
      const s = randString(rng, n, alphabet);
      const k = randInt(rng, 0, n);
      return [s, String(k)];
    },
    statement:
      "You are given a string `s` consisting of uppercase English letters and an integer `k`. You may choose up to `k` characters of the string and change each of them to any other uppercase letter.\n\nReturn the length of the longest substring you can obtain that contains only one repeated character, after performing at most `k` such replacements.",
    constraints: '- `1 <= s.length <= 10^5`\n- `s` consists of uppercase English letters.\n- `0 <= k <= s.length`',
    inputFormat: 'Line 1: the string `s`. Line 2: the integer `k`.',
    outputFormat: 'A single integer: the length of the longest achievable same-character substring.',
    hints: [
      'Think in terms of a sliding window: a window of length L is achievable if you can turn it all into one letter using at most k replacements.',
      "Inside a window, the number of characters you'd need to change is `windowLength - (count of the most frequent letter in that window)`.",
      "Grow the window to the right always; only shrink it from the left when `windowLength - maxFrequencyInWindow` exceeds k. The window never needs to shrink below its best-ever size, so the answer is simply the largest window length reached.",
    ],
    solutionApproach:
      "Sliding window with a running character-frequency count and a running `maxFreq` (the highest single-letter frequency seen in any window so far — it never needs to decrease, even if it becomes stale, because a stale window merely fails to grow further without shrinking the true answer). While `(end - start + 1) - maxFreq > k`, shrink from the left. The window length at every step is a valid answer candidate; track the maximum. O(n) time, O(26) space.",
    pythonSolutionCode:
      'def character_replacement(s, k):\n    k = int(k)\n    counts = {}\n    start = 0\n    max_freq = 0\n    best = 0\n    for end, c in enumerate(s):\n        counts[c] = counts.get(c, 0) + 1\n        max_freq = max(max_freq, counts[c])\n        while (end - start + 1) - max_freq > k:\n            counts[s[start]] -= 1\n            start += 1\n        best = max(best, end - start + 1)\n    return best\n',
    solve: (s, kStr) => {
      const k = Number(kStr);
      const counts = new Map();
      let start = 0;
      let maxFreq = 0;
      let best = 0;
      for (let end = 0; end < s.length; end += 1) {
        const c = s[end];
        counts.set(c, (counts.get(c) || 0) + 1);
        maxFreq = Math.max(maxFreq, counts.get(c));
        while (end - start + 1 - maxFreq > k) {
          const cs = s[start];
          counts.set(cs, counts.get(cs) - 1);
          start += 1;
        }
        best = Math.max(best, end - start + 1);
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      `With up to ${args[1]} replacement(s), the longest run of a single repeated letter achievable is ${result}.`,
    edgeCases: [
      { args: ['A', '0'], kind: 'edge' },
      { args: ['AAAA', '0'], kind: 'edge' },
      { args: ['AAAB', '0'], kind: 'edge' },
      { args: ['ABAB', '2'], kind: 'edge' },
      { args: ['AABABBA', '1'], kind: 'edge' },
      { args: ['ABCD', '4'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Minimum Window Substring',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'string', minN: 1, maxN: 15, alphabet: 'ABC' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet || 'ABC';
      const tLen = randInt(rng, 1, cfg.maxT ?? 4);
      const t = randString(rng, tLen, alphabet);
      if (rng() < 0.7) {
        const noiseLen = randInt(rng, 0, cfg.maxN ?? 15);
        const noise = randString(rng, noiseLen, alphabet);
        const s = shuffle(rng, (t + noise).split('')).join('');
        return [s, t];
      }
      const sLen = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const s = randString(rng, sLen, alphabet);
      return [s, t];
    },
    statement:
      "Given two strings `s` and `t`, return the shortest contiguous substring of `s` that contains every character of `t` (including duplicates — if `t` has two `'A'`s, the window must contain at least two `'A'`s too). If no such window exists, return an empty string.\n\nIf multiple windows share the same minimum length, return the one whose start index in `s` is smallest.",
    constraints: '- `1 <= s.length, t.length <= 10^5`\n- `s` and `t` consist of uppercase English letters.',
    inputFormat: 'Line 1: the string `s`. Line 2: the string `t`.',
    outputFormat: 'The shortest valid window substring, or an empty line if none exists.',
    hints: [
      'This calls for a sliding window that expands to find a valid window and contracts to shrink it once found.',
      'Track how many of each required character (from `t`) you still need inside the current window with a frequency map.',
      'Expand the right edge until the window satisfies every requirement, then greedily shrink from the left while it still satisfies them, recording the best window found at each satisfied state.',
    ],
    solutionApproach:
      "Build a need-count map from `t`. Expand a right pointer over `s`, updating a window-count map, and track how many distinct required characters currently have their need fully met (`formed`). Whenever `formed` equals the number of distinct required characters, the window is valid: record it if it's the smallest so far (strictly smaller, so the first/leftmost tie wins), then shrink from the left until it's no longer valid. O(|s| + |t|) time.",
    pythonSolutionCode:
      'def min_window(s, t):\n    if not s or not t:\n        return ""\n    need = {}\n    for c in t:\n        need[c] = need.get(c, 0) + 1\n    required = len(need)\n    formed = 0\n    window = {}\n    l = 0\n    best_len = float("inf")\n    best_l = 0\n    for r, c in enumerate(s):\n        window[c] = window.get(c, 0) + 1\n        if c in need and window[c] == need[c]:\n            formed += 1\n        while formed == required:\n            if r - l + 1 < best_len:\n                best_len = r - l + 1\n                best_l = l\n            lc = s[l]\n            window[lc] -= 1\n            if lc in need and window[lc] < need[lc]:\n                formed -= 1\n            l += 1\n    return "" if best_len == float("inf") else s[best_l:best_l + best_len]\n',
    solve: (s, t) => {
      if (!s.length || !t.length) return '';
      const need = new Map();
      for (const c of t) need.set(c, (need.get(c) || 0) + 1);
      const required = need.size;
      let formed = 0;
      const window = new Map();
      let l = 0;
      let bestLen = Infinity;
      let bestL = 0;
      for (let r = 0; r < s.length; r += 1) {
        const c = s[r];
        window.set(c, (window.get(c) || 0) + 1);
        if (need.has(c) && window.get(c) === need.get(c)) formed += 1;
        while (formed === required) {
          if (r - l + 1 < bestLen) {
            bestLen = r - l + 1;
            bestL = l;
          }
          const lc = s[l];
          window.set(lc, window.get(lc) - 1);
          if (need.has(lc) && window.get(lc) < need.get(lc)) formed -= 1;
          l += 1;
        }
      }
      return bestLen === Infinity ? '' : s.substring(bestL, bestL + bestLen);
    },
    exampleExplanation: (args, result) =>
      result ? `"${result}" is the shortest window of s containing every character of t.` : 'No window of s contains all characters of t.',
    edgeCases: [
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['a', 'aa'], kind: 'edge' },
      { args: ['a', 'b'], kind: 'edge' },
      { args: ['aa', 'a'], kind: 'edge' },
      { args: ['ADOBECODEBANC', 'ABC'], kind: 'edge' },
      { args: ['ab', 'A'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Permutation in String',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 8, alphabet: 'abcde' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet || 'abcde';
      const n1 = randInt(rng, 1, cfg.maxN ?? 8);
      const s1 = randString(rng, n1, alphabet);
      if (rng() < 0.6) {
        const perm = shuffle(rng, s1.split('')).join('');
        const prefix = randString(rng, randInt(rng, 0, cfg.maxN ?? 8), alphabet);
        const suffix = randString(rng, randInt(rng, 0, cfg.maxN ?? 8), alphabet);
        return [s1, prefix + perm + suffix];
      }
      const n2 = randInt(rng, 1, (cfg.maxN ?? 8) * 2);
      const s2 = randString(rng, n2, alphabet);
      return [s1, s2];
    },
    statement:
      "Given two strings `s1` and `s2`, return `true` if `s2` contains a contiguous substring that is a permutation of `s1` (i.e. uses exactly the same multiset of characters, in any order), and `false` otherwise.",
    constraints: '- `1 <= s1.length, s2.length <= 10^4`\n- `s1` and `s2` consist of lowercase English letters.',
    inputFormat: 'Line 1: the string `s1`. Line 2: the string `s2`.',
    outputFormat: '`true` or `false`.',
    hints: [
      "A permutation of `s1` inside `s2` must be a contiguous window of exactly `s1.length` characters — so only windows of that fixed size matter.",
      'Compare character-frequency counts: a fixed-size window of `s2` is a permutation of `s1` exactly when their frequency counts match.',
      "Slide the fixed-size window across `s2` one character at a time, updating the window's frequency count incrementally (add the entering character, remove the leaving one) instead of recomputing it from scratch.",
    ],
    solutionApproach:
      "Build a frequency map of `s1`. Slide a fixed-size window of length `s1.length` across `s2`, maintaining the window's own frequency map incrementally as characters enter and leave. If at any point the window's map equals `s1`'s map, a permutation was found. O(|s2| * 26) time in the worst case with array-based counts (here done generically with maps), O(1) extra windows to check.",
    pythonSolutionCode:
      'def check_inclusion(s1, s2):\n    k = len(s1)\n    if k > len(s2):\n        return False\n    need = {}\n    for c in s1:\n        need[c] = need.get(c, 0) + 1\n    window = {}\n    for c in s2[:k]:\n        window[c] = window.get(c, 0) + 1\n    if window == need:\n        return True\n    for i in range(k, len(s2)):\n        in_c = s2[i]\n        window[in_c] = window.get(in_c, 0) + 1\n        out_c = s2[i - k]\n        window[out_c] -= 1\n        if window[out_c] == 0:\n            del window[out_c]\n        if window == need:\n            return True\n    return False\n',
    solve: (s1, s2) => {
      const k = s1.length;
      if (k > s2.length) return false;
      const mapsEqual = (a, b) => {
        if (a.size !== b.size) return false;
        for (const [key, v] of a) if (b.get(key) !== v) return false;
        return true;
      };
      const need = new Map();
      for (const c of s1) need.set(c, (need.get(c) || 0) + 1);
      const window = new Map();
      for (let i = 0; i < k; i += 1) {
        const c = s2[i];
        window.set(c, (window.get(c) || 0) + 1);
      }
      if (mapsEqual(need, window)) return true;
      for (let i = k; i < s2.length; i += 1) {
        const inC = s2[i];
        window.set(inC, (window.get(inC) || 0) + 1);
        const outC = s2[i - k];
        window.set(outC, window.get(outC) - 1);
        if (window.get(outC) === 0) window.delete(outC);
        if (mapsEqual(need, window)) return true;
      }
      return false;
    },
    exampleExplanation: (args, result) =>
      result ? `s2 contains a contiguous window that is exactly a permutation of "${args[0]}".` : `No window of s2 has the same letters as "${args[0]}".`,
    edgeCases: [
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['ab', 'eidbaooo'], kind: 'edge' },
      { args: ['ab', 'eidboaoo'], kind: 'edge' },
      { args: ['abc', 'cba'], kind: 'edge' },
      { args: ['abcd', 'ab'], kind: 'edge' },
      { args: ['aa', 'aa'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Count and Say',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'string', min: 1, max: 25 },
    statement:
      'The "count-and-say" sequence starts with `"1"`. Every subsequent term is generated by reading off the previous term as consecutive runs of the same digit, describing each run as "<count><digit>".\n\nFor example: term 1 is `"1"`; term 2 describes it as "one 1", giving `"11"`; term 3 describes term 2 as "two 1s", giving `"21"`; term 4 describes term 3 as "one 2, one 1", giving `"1211"`.\n\nGiven an integer `n`, return the `n`th term of the sequence as a string.',
    constraints: '- `1 <= n <= 30`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single string: the nth term of the count-and-say sequence.',
    hints: [
      'Each term is built purely from the previous term — simulate it step by step from term 1 up to n.',
      'To describe a term, scan it left to right and group consecutive equal digits into runs.',
      'For each run, append its length followed by the digit itself to the new term being built.',
    ],
    solutionApproach:
      'Start with `"1"` and iterate `n - 1` times: each iteration scans the current string, grouping consecutive identical digits into runs, and appends `"<runLength><digit>"` for every run to build the next string. O(total output length) time overall.',
    pythonSolutionCode:
      'def count_and_say(n):\n    result = "1"\n    for _ in range(n - 1):\n        nxt = []\n        i = 0\n        while i < len(result):\n            j = i\n            while j < len(result) and result[j] == result[i]:\n                j += 1\n            nxt.append(str(j - i))\n            nxt.append(result[i])\n            i = j\n        result = "".join(nxt)\n    return result\n',
    solve: (n) => {
      let result = '1';
      for (let iter = 1; iter < n; iter += 1) {
        let next = '';
        let i = 0;
        while (i < result.length) {
          let j = i;
          while (j < result.length && result[j] === result[i]) j += 1;
          next += (j - i) + result[i];
          i = j;
        }
        result = next;
      }
      return result;
    },
    exampleExplanation: (args, result) => `Term ${args[0]} of the count-and-say sequence is "${result}".`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [10], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Add Binary',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'string', minN: 1, maxN: 16 },
    genArgs: (rng, cfg) => {
      const gen = () => {
        const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 16);
        if (n === 1) return String(randInt(rng, 0, 1));
        let str = '1';
        for (let i = 1; i < n; i += 1) str += String(randInt(rng, 0, 1));
        return str;
      };
      return [gen(), gen()];
    },
    statement: 'Given two binary strings `a` and `b`, return their sum, also represented as a binary string.',
    constraints:
      '- `1 <= a.length, b.length <= 10^4`\n- `a` and `b` consist only of `0` or `1` characters.\n- Neither string has leading zeros, except the string `"0"` itself.',
    inputFormat: 'Line 1: binary string `a`. Line 2: binary string `b`.',
    outputFormat: 'A single binary string: the sum of a and b, with no leading zeros (unless the result is "0").',
    hints: [
      'This is exactly like elementary-school addition, but base 2 instead of base 10.',
      'Walk both strings from the rightmost digit toward the front, tracking a carry as you go.',
      'At each position, the digit sum plus carry can be 0, 1, 2, or 3 — the result bit is that value mod 2, and the new carry is that value divided by 2 (integer division).',
    ],
    solutionApproach:
      "Two pointers starting at the end of each string, plus a carry initialized to 0. At each step, sum the two current bits (0 if a pointer has run past its string's start) and the carry, append `sum % 2` to the result, and set the new carry to `floor(sum / 2)`. Continue until both pointers are exhausted and the carry is 0, then reverse the accumulated bits. O(max(|a|, |b|)) time.",
    pythonSolutionCode:
      'def add_binary(a, b):\n    i, j = len(a) - 1, len(b) - 1\n    carry = 0\n    res = []\n    while i >= 0 or j >= 0 or carry:\n        da = int(a[i]) if i >= 0 else 0\n        db = int(b[j]) if j >= 0 else 0\n        total = da + db + carry\n        res.append(str(total % 2))\n        carry = total // 2\n        i -= 1\n        j -= 1\n    return "".join(reversed(res)) or "0"\n',
    solve: (a, b) => {
      let i = a.length - 1;
      let j = b.length - 1;
      let carry = 0;
      let res = '';
      while (i >= 0 || j >= 0 || carry) {
        const da = i >= 0 ? Number(a[i]) : 0;
        const db = j >= 0 ? Number(b[j]) : 0;
        const total = da + db + carry;
        res = (total % 2) + res;
        carry = Math.floor(total / 2);
        i -= 1;
        j -= 1;
      }
      return res || '0';
    },
    exampleExplanation: (args, result) => `Adding binary "${args[0]}" and "${args[1]}" gives "${result}".`,
    edgeCases: [
      { args: ['0', '0'], kind: 'edge' },
      { args: ['1', '1'], kind: 'edge' },
      { args: ['11', '1'], kind: 'edge' },
      { args: ['1010', '1011'], kind: 'edge' },
      { args: ['1111', '1111'], kind: 'edge' },
      { args: ['1', '111'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Multiply Strings',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'string', minN: 1, maxN: 8, alphabet: '0123456789' },
    genArgs: (rng, cfg) => {
      const gen = () => {
        const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
        if (n === 1) return String(randInt(rng, 0, 9));
        let str = String(randInt(rng, 1, 9));
        for (let i = 1; i < n; i += 1) str += String(randInt(rng, 0, 9));
        return str;
      };
      return [gen(), gen()];
    },
    statement:
      "Given two non-negative integers `num1` and `num2` represented as strings, return the product of `num1` and `num2`, also represented as a string. You may not use a built-in arbitrary-precision integer type directly on the whole numbers — the point is to multiply digit by digit as if by hand.",
    constraints:
      '- `1 <= num1.length, num2.length <= 200`\n- `num1` and `num2` consist only of digits `0`-`9`.\n- Neither string has leading zeros, except the string `"0"` itself.',
    inputFormat: 'Line 1: digit string `num1`. Line 2: digit string `num2`.',
    outputFormat: 'A single digit string: the product, with no leading zeros (unless the result is "0").',
    hints: [
      'Multiplying digit `num1[i]` by digit `num2[j]` (grade-school long multiplication) always contributes to positions `i+j` and `i+j+1` of the result when both strings are indexed from the left.',
      'Instead of adding partial products one row at a time, accumulate every digit-pair product directly into a result array of size `num1.length + num2.length`, handling carries afterward.',
      "Once every digit pair has been multiplied and accumulated, propagate carries left-to-right through the result array, then strip any leading zeros.",
    ],
    solutionApproach:
      "Allocate a result array of length `m + n` (m, n = digit counts), initialized to 0. For every pair of digits at positions `i` (in num1) and `j` (in num2), their product lands across positions `i+j` and `i+j+1`: add the product to `result[i+j+1]`, then carry any overflow (`>= 10`) into `result[i+j]`. After processing all pairs, join the digits and strip leading zeros. O(m*n) time.",
    pythonSolutionCode:
      'def multiply(num1, num2):\n    if num1 == "0" or num2 == "0":\n        return "0"\n    m, n = len(num1), len(num2)\n    result = [0] * (m + n)\n    for i in range(m - 1, -1, -1):\n        for j in range(n - 1, -1, -1):\n            mul = int(num1[i]) * int(num2[j])\n            p1, p2 = i + j, i + j + 1\n            total = mul + result[p2]\n            result[p2] = total % 10\n            result[p1] += total // 10\n    s = "".join(map(str, result))\n    s = s.lstrip("0")\n    return s if s else "0"\n',
    solve: (num1, num2) => {
      if (num1 === '0' || num2 === '0') return '0';
      const m = num1.length;
      const n = num2.length;
      const result = new Array(m + n).fill(0);
      for (let i = m - 1; i >= 0; i -= 1) {
        for (let j = n - 1; j >= 0; j -= 1) {
          const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
          const p1 = i + j;
          const p2 = i + j + 1;
          const total = mul + result[p2];
          result[p2] = total % 10;
          result[p1] += Math.floor(total / 10);
        }
      }
      let s = result.join('');
      let start = 0;
      while (start < s.length - 1 && s[start] === '0') start += 1;
      return s.slice(start);
    },
    exampleExplanation: (args, result) => `${args[0]} * ${args[1]} = ${result}.`,
    edgeCases: [
      { args: ['0', '0'], kind: 'edge' },
      { args: ['0', '12345'], kind: 'edge' },
      { args: ['1', '1'], kind: 'edge' },
      { args: ['2', '3'], kind: 'edge' },
      { args: ['123', '456'], kind: 'edge' },
      { args: ['99', '99'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Parentheses',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'bool', minN: 0, maxN: 20, alphabet: '()[]{}' },
    genArgs: (rng, cfg) => {
      const maxPairs = Math.floor((cfg.maxN ?? 20) / 2);
      const pairs = randInt(rng, 0, maxPairs);
      if (pairs === 0) return [''];
      if (rng() < 0.5) return [randomBalancedBrackets(rng, pairs)];
      return [randString(rng, pairs * 2, cfg.alphabet || '()[]{}')];
    },
    statement:
      "Given a string `s` containing only the bracket characters `'('`, `')'`, `'['`, `']'`, `'{'`, and `'}'`, determine if the brackets are validly matched: every closing bracket must close the most recently opened, still-unclosed bracket of the matching type, and every opened bracket must eventually be closed.",
    constraints: "- `0 <= s.length <= 10^4`\n- `s` consists only of the characters `'()[]{}'`.",
    inputFormat: 'Line 1: the string `s` (may be empty).',
    outputFormat: '`true` or `false`.',
    hints: [
      'The most recently opened bracket must be the next one closed — that "last opened, first closed" behavior is exactly a stack.',
      'Push every opening bracket onto a stack; on a closing bracket, it must match whatever is currently on top of the stack.',
      'Two failure modes to catch: a closing bracket that mismatches (or has nothing to match), and leftover unclosed brackets once the string ends.',
    ],
    solutionApproach:
      "Use a stack. For every opening bracket, push it. For every closing bracket, pop the stack and check that it corresponds to the matching opening bracket — if the stack is empty or the popped bracket doesn't match, the string is invalid immediately. After processing the whole string, it's valid only if the stack is empty (no unclosed brackets remain). O(n) time.",
    pythonSolutionCode:
      'def is_valid(s):\n    pairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n    stack = []\n    for c in s:\n        if c in \'([{\':\n            stack.append(c)\n        else:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n    return not stack\n',
    solve: (s) => {
      const pairs = { ')': '(', ']': '[', '}': '{' };
      const stack = [];
      for (const c of s) {
        if (c === '(' || c === '[' || c === '{') {
          stack.push(c);
        } else if (stack.length === 0 || stack.pop() !== pairs[c]) {
          return false;
        }
      }
      return stack.length === 0;
    },
    exampleExplanation: (args, result) => (result ? 'Every bracket is closed in the correct order.' : 'Some bracket is mismatched or left unclosed.'),
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: ['()'], kind: 'edge' },
      { args: ['()[]{}'], kind: 'edge' },
      { args: ['(]'], kind: 'edge' },
      { args: ['([)]'], kind: 'edge' },
      { args: ['{[]}'], kind: 'edge' },
      { args: ['('], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Generate Parentheses',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'int', leafKind: 'scalar', min: 1, max: 6 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an integer `n` representing a number of pairs of parentheses, generate every possible string of `n` pairs of well-formed (validly matched) parentheses.\n\nEach generated string may be printed in any order relative to the others.',
    constraints: '- `1 <= n <= 8`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'One well-formed parentheses string per line, all of length `2n`. Order of lines does not matter.',
    hints: [
      'A greedy left-to-right build works well here: at each position you can place `(` or `)`, but not both are always legal.',
      "You may place an opening bracket as long as you haven't used all `n` of them yet, and a closing bracket only if there are currently more opens than closes placed so far (otherwise the string becomes invalid).",
      'Backtrack: try placing `(` first (if allowed), recurse, then try `)` (if allowed), recurse — stop and record the string once its length reaches `2n`.',
    ],
    solutionApproach:
      "Backtracking: build the string character by character, tracking the count of `(` used (`open`) and `)` used (`close`). At each step, recurse with an added `(` if `open < n`, and recurse with an added `)` if `close < open` (there must be an unmatched open to close). Once the string reaches length `2n`, it is guaranteed well-formed — record it. This generates exactly the Catalan number `C(n)` of valid strings, visiting no invalid ones.",
    pythonSolutionCode:
      'def generate_parenthesis(n):\n    res = []\n    def backtrack(cur, open_count, close_count):\n        if len(cur) == 2 * n:\n            res.append(cur)\n            return\n        if open_count < n:\n            backtrack(cur + "(", open_count + 1, close_count)\n        if close_count < open_count:\n            backtrack(cur + ")", open_count, close_count + 1)\n    backtrack("", 0, 0)\n    return res\n',
    solve: (n) => {
      const res = [];
      const backtrack = (cur, openCount, closeCount) => {
        if (cur.length === 2 * n) {
          res.push(cur);
          return;
        }
        if (openCount < n) backtrack(cur + '(', openCount + 1, closeCount);
        if (closeCount < openCount) backtrack(cur + ')', openCount, closeCount + 1);
      };
      backtrack('', 0, 0);
      return res;
    },
    exampleExplanation: (args, result) => `There are ${result.length} well-formed combinations of ${args[0]} pair(s) of parentheses.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Valid Parentheses',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 0, maxN: 24, alphabet: '()' },
    statement:
      "Given a string `s` containing only the characters `'('` and `')'`, find the length of the longest contiguous substring of `s` that is a valid (well-formed) parentheses sequence.",
    constraints: "- `0 <= s.length <= 3*10^4`\n- `s[i]` is `'('` or `')'`.",
    inputFormat: 'Line 1: the string `s` (may be empty).',
    outputFormat: 'A single integer: the length of the longest valid parentheses substring.',
    hints: [
      "Tracking indices (not just counts) on a stack lets you measure the length of a valid run once it closes.",
      "Keep a stack of indices, seeded with -1 as a sentinel 'last position before the current valid run started'. Push the index of every `'('`.",
      "On every `')'`, pop the stack. If the stack becomes empty, the current `')'` breaks any run, so push its index as the new base. Otherwise, the current valid length is `i - stack.top()`.",
    ],
    solutionApproach:
      "Maintain a stack of indices initialized with `[-1]` (a base marker for 'the position just before a potential valid run'). For each `'('`, push its index. For each `')'`, pop the stack: if the stack is now empty, this `')'` has no matching `'('` to pair with, so push the current index as the new base; otherwise, the length of the valid run ending here is `i - stack[top]`, which is a candidate for the answer. O(n) time, O(n) space.",
    pythonSolutionCode:
      'def longest_valid_parentheses(s):\n    stack = [-1]\n    best = 0\n    for i, c in enumerate(s):\n        if c == \'(\':\n            stack.append(i)\n        else:\n            stack.pop()\n            if not stack:\n                stack.append(i)\n            else:\n                best = max(best, i - stack[-1])\n    return best\n',
    solve: (s) => {
      const stack = [-1];
      let best = 0;
      for (let i = 0; i < s.length; i += 1) {
        if (s[i] === '(') {
          stack.push(i);
        } else {
          stack.pop();
          if (stack.length === 0) stack.push(i);
          else best = Math.max(best, i - stack[stack.length - 1]);
        }
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      result === 0 ? 'No contiguous substring forms a valid parentheses sequence.' : `The longest valid (well-formed) run has length ${result}.`,
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: ['()'], kind: 'edge' },
      { args: [')('], kind: 'edge' },
      { args: ['(()'], kind: 'edge' },
      { args: [')()())'], kind: 'edge' },
      { args: ['()(()'], kind: 'edge' },
      { args: ['((()))'], kind: 'edge' },
    ],
  },
];
