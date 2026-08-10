import { randInt, randString, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Reverse Words in a String',
    shape: 'string_to_string',
    shapeConfig: { maxN: 6 },
    genArgs: (rng, cfg) => {
      const wordCount = randInt(rng, 1, cfg.maxN ?? 6);
      let s = '';
      for (let i = 0; i < wordCount; i += 1) {
        if (i > 0) s += ' '.repeat(randInt(rng, 1, 3));
        s += randString(rng, randInt(rng, 1, 6));
      }
      if (rng() < 0.5) s = ' '.repeat(randInt(rng, 1, 3)) + s;
      if (rng() < 0.5) s = `${s}${' '.repeat(randInt(rng, 1, 3))}`;
      return [s];
    },
    statement:
      "Given an input string `s`, reverse the order of the **words**.\n\nA word is a maximal run of non-space characters. Words in `s` may be separated by one or more spaces, and `s` may have leading or trailing spaces. Return a string with the words in reverse order, separated by a single space, with no leading or trailing spaces.",
    constraints: '- `1 <= s.length <= 10^4`\n- `s` contains English letters and spaces `\' \'`.\n- `s` contains at least one word.',
    inputFormat: 'Line 1: the string `s` (may contain leading/trailing/multiple spaces).',
    outputFormat: "The words of `s` in reverse order, joined by single spaces, with no leading or trailing spaces.",
    hints: [
      "Splitting naively on a single space will leave you with empty strings wherever there were multiple consecutive spaces — you need to filter those out.",
      'Most languages have a way to split on "runs of whitespace" directly; if not, split on single spaces and drop empty tokens yourself.',
      'Once you have a clean list of words, reversing the list and joining with single spaces gives the answer.',
    ],
    solutionApproach:
      "Split the string on runs of whitespace, discarding any empty tokens produced by leading/trailing/multiple spaces. Reverse the resulting list of words and join them with a single space. O(n) time, O(n) space.",
    pythonSolutionCode: "def reverse_words(s):\n    words = s.split()\n    return ' '.join(reversed(words))\n",
    solve: (s) => {
      const words = s.trim().split(/\s+/).filter(Boolean);
      return words.reverse().join(' ');
    },
    exampleExplanation: (args, result) => `Splitting "${args[0]}" into words and printing them back-to-front gives "${result}".`,
    edgeCases: [
      { args: ['hello'], kind: 'edge' },
      { args: ['  hello world  '], kind: 'edge' },
      { args: ['a good   example'], kind: 'edge' },
      { args: ['  Bob    Loves  Alice   '], kind: 'edge' },
      { args: ['the sky is blue'], kind: 'edge' },
      { args: ['   a   '], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Reverse Words in a String III',
    shape: 'string_to_string',
    shapeConfig: { maxN: 6 },
    genArgs: (rng, cfg) => {
      const wordCount = randInt(rng, 1, cfg.maxN ?? 6);
      const words = Array.from({ length: wordCount }, () => randString(rng, randInt(rng, 1, 8)));
      return [words.join(' ')];
    },
    statement:
      "Given a string `s` made of words separated by a single space, with no leading or trailing spaces, reverse the characters **within each word** while keeping the original whitespace and the original order of the words.",
    constraints: "- `1 <= s.length <= 5*10^4`\n- `s` contains printable ASCII characters and single spaces between words.\n- `s` has no leading or trailing spaces.",
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'The string with each word individually reversed, word order and spacing unchanged.',
    hints: [
      "Unlike the classic 'reverse the whole sentence' problem, the word order here must stay exactly the same.",
      'Split the string on the single spaces you know separate words, reverse each piece independently, then stitch them back together.',
      'Joining the reversed words with a single space reproduces the original spacing since it was guaranteed to be exactly one space.',
    ],
    solutionApproach:
      "Split `s` on `' '` to get the words in order (this is safe because the input guarantees single-space separation with no leading/trailing spaces). Reverse the characters of each word independently, then join the reversed words back together with single spaces. O(n) time, O(n) space.",
    pythonSolutionCode: "def reverse_words_iii(s):\n    return ' '.join(word[::-1] for word in s.split(' '))\n",
    solve: (s) => s.split(' ').map((w) => w.split('').reverse().join('')).join(' '),
    exampleExplanation: (args, result) => `Each word in "${args[0]}" is reversed in place, giving "${result}".`,
    edgeCases: [
      { args: ["Let's take LeetCode contest"], kind: 'edge' },
      { args: ['hello'], kind: 'edge' },
      { args: ['a'], kind: 'edge' },
      { args: ['God Ding'], kind: 'edge' },
      { args: ['ab cd ef'], kind: 'edge' },
      { args: ['a b c d'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Palindrome II',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15, alphabet: 'abc' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet ?? 'abc';
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      if (rng() < 0.6) {
        const half = randString(rng, Math.ceil(n / 2), alphabet);
        let pal = n % 2 ? half + half.slice(0, -1).split('').reverse().join('') : half + half.split('').reverse().join('');
        if (rng() < 0.7) {
          const pos = randInt(rng, 0, pal.length);
          pal = pal.slice(0, pos) + alphabet[randInt(rng, 0, alphabet.length - 1)] + pal.slice(pos);
        }
        return [pal];
      }
      return [randString(rng, n, alphabet)];
    },
    statement:
      "Given a string `s` of lowercase letters, return `true` if `s` can be turned into a palindrome by deleting **at most one** character, or `false` otherwise.",
    constraints: '- `1 <= s.length <= 10^5`\n- `s` consists of lowercase English letters only.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Start with the standard two-pointer palindrome check, moving inward from both ends.',
      'The moment the two pointers disagree on a character, you have (at most) one deletion to spend — try skipping either the left character or the right character.',
      'After skipping one side, the remaining substring must be a plain palindrome with zero further deletions allowed.',
    ],
    solutionApproach:
      "Use two pointers moving inward from both ends. While characters match, keep advancing. On the first mismatch, you have one deletion available: check whether the substring is a palindrome after skipping the left character, or after skipping the right character — if either check succeeds, the answer is `true`. Each check is O(n), and there is at most one mismatch to branch on, so the whole algorithm is O(n) time.",
    pythonSolutionCode:
      "def valid_palindrome_ii(s):\n    def is_pal(l, r):\n        while l < r:\n            if s[l] != s[r]:\n                return False\n            l += 1\n            r -= 1\n        return True\n\n    l, r = 0, len(s) - 1\n    while l < r:\n        if s[l] != s[r]:\n            return is_pal(l + 1, r) or is_pal(l, r - 1)\n        l += 1\n        r -= 1\n    return True\n",
    solve: (s) => {
      const isPal = (l, r) => {
        while (l < r) {
          if (s[l] !== s[r]) return false;
          l += 1;
          r -= 1;
        }
        return true;
      };
      let l = 0;
      let r = s.length - 1;
      while (l < r) {
        if (s[l] !== s[r]) return isPal(l + 1, r) || isPal(l, r - 1);
        l += 1;
        r -= 1;
      }
      return true;
    },
    exampleExplanation: (args, result) =>
      result ? `"${args[0]}" is a palindrome, or becomes one after removing a single character.` : `"${args[0]}" cannot be made a palindrome by removing just one character.`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['aba'], kind: 'edge' },
      { args: ['abca'], kind: 'edge' },
      { args: ['abc'], kind: 'edge' },
      { args: ['deeee'], kind: 'edge' },
      { args: ['aa'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Palindrome Number',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: -100000000, max: 100000000 },
    genArgs: (rng, cfg) => {
      if (rng() < 0.5) {
        const len = randInt(rng, 1, 6);
        let half = '';
        for (let i = 0; i < Math.ceil(len / 2); i += 1) half += String(randInt(rng, 0, 9));
        if (half[0] === '0' && half.length > 1) half = `1${half.slice(1)}`;
        const rev = half.split('').reverse().join('');
        const full = len % 2 === 0 ? half + rev : half + rev.slice(1);
        return [Number(full)];
      }
      return [randInt(rng, cfg.min ?? -100000000, cfg.max ?? 100000000)];
    },
    statement:
      "Given an integer `x`, return `true` if `x` reads the same forward and backward (as a base-10 number, ignoring any sign), and `false` otherwise.\n\nNegative numbers are never palindromes (because of the leading `-` sign).",
    constraints: '- `-2^31 <= x <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `x`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Any negative number can be rejected immediately — the minus sign breaks the mirror.',
      "You could convert to a string and check it against its reverse, but a purely numeric solution reverses only half of the digits.",
      'Keep peeling digits off the end of `x` and building a reversed number until the reversed half is at least as large as what remains, then compare.',
    ],
    solutionApproach:
      "Reject negative numbers immediately (and, as a minor optimization, any positive multiple of 10 other than 0, since its last digit is 0 but its first digit cannot be). Then repeatedly move the last digit of the remaining number onto a `reversedHalf` accumulator until `remaining <= reversedHalf`. At that point `x` is a palindrome exactly when `remaining` equals `reversedHalf` (even digit count) or `remaining` equals `reversedHalf` with its own last digit dropped (odd digit count, since the middle digit doesn't need a mirror). O(log10 x) time, O(1) space.",
    pythonSolutionCode:
      "def is_palindrome(x):\n    if x < 0 or (x != 0 and x % 10 == 0):\n        return False\n    reversed_half = 0\n    while x > reversed_half:\n        reversed_half = reversed_half * 10 + x % 10\n        x //= 10\n    return x == reversed_half or x == reversed_half // 10\n",
    solve: (x) => {
      if (x < 0 || (x !== 0 && x % 10 === 0)) return false;
      let remaining = x;
      let reversedHalf = 0;
      while (remaining > reversedHalf) {
        reversedHalf = reversedHalf * 10 + (remaining % 10);
        remaining = Math.floor(remaining / 10);
      }
      return remaining === reversedHalf || remaining === Math.floor(reversedHalf / 10);
    },
    exampleExplanation: (args, result) => (result ? `${args[0]} reads the same forward and backward.` : `${args[0]} does not read the same in reverse.`),
    edgeCases: [
      { args: [0], kind: 'edge' },
      { args: [121], kind: 'edge' },
      { args: [-121], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [12321], kind: 'edge' },
      { args: [1221], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Palindromic Substring',
    shape: 'string_to_string',
    shapeConfig: { minN: 1, maxN: 16, alphabet: 'abc' },
    genArgs: (rng, cfg) => [randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 16), cfg.alphabet ?? 'abc')],
    statement:
      'Given a string `s`, return the longest substring of `s` that is a palindrome.\n\nA substring must occupy contiguous positions in `s`.',
    constraints:
      '- `1 <= s.length <= 1000`\n- `s` consists of printable ASCII characters.\n- If multiple substrings of the maximum length are palindromes, return the one that starts earliest in `s` (equivalently, the first one found by expanding outward from every center, scanning centers left to right).',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'The longest palindromic substring (ties broken by leftmost starting index).',
    hints: [
      'Checking every possible substring for being a palindrome is O(n^3) — think about growing palindromes instead of checking them from scratch.',
      "Every palindrome has a center (a single character for odd-length ones, a gap between two characters for even-length ones). There are only `2n - 1` possible centers.",
      'For each of the `2n - 1` centers, expand outward while the characters on both sides match, and track the widest expansion seen.',
    ],
    solutionApproach:
      "Try every possible center of a palindrome (2n - 1 of them: n single-character centers for odd-length palindromes, and n - 1 between-character centers for even-length ones). For each center, expand outward while the two sides match, and keep the widest palindrome found, breaking ties by keeping the first (leftmost) one encountered. O(n^2) time, O(1) extra space.",
    pythonSolutionCode:
      "def longest_palindrome(s):\n    if not s:\n        return ''\n\n    def expand(l, r):\n        while l >= 0 and r < len(s) and s[l] == s[r]:\n            l -= 1\n            r += 1\n        return l + 1, r - l - 1\n\n    start, best_len = 0, 1\n    for i in range(len(s)):\n        for l0, r0 in ((i, i), (i, i + 1)):\n            l, length = expand(l0, r0)\n            if length > best_len:\n                start, best_len = l, length\n    return s[start:start + best_len]\n",
    solve: (s) => {
      if (!s.length) return '';
      const expand = (l, r) => {
        while (l >= 0 && r < s.length && s[l] === s[r]) {
          l -= 1;
          r += 1;
        }
        return { start: l + 1, len: r - l - 1 };
      };
      let start = 0;
      let bestLen = 1;
      for (let i = 0; i < s.length; i += 1) {
        const odd = expand(i, i);
        if (odd.len > bestLen) {
          bestLen = odd.len;
          start = odd.start;
        }
        const even = expand(i, i + 1);
        if (even.len > bestLen) {
          bestLen = even.len;
          start = even.start;
        }
      }
      return s.substring(start, start + bestLen);
    },
    exampleExplanation: (args, result) => `The longest run of characters in "${args[0]}" that reads the same forward and backward is "${result}".`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['bb'], kind: 'edge' },
      { args: ['babad'], kind: 'edge' },
      { args: ['cbbd'], kind: 'edge' },
      { args: ['aaaa'], kind: 'edge' },
      { args: ['ac'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Palindromic Subsequence',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 16, alphabet: 'abc' },
    genArgs: (rng, cfg) => [randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 16), cfg.alphabet ?? 'abc')],
    statement:
      "Given a string `s`, return the length of the longest palindromic **subsequence**.\n\nA subsequence is derived by deleting zero or more characters without changing the relative order of the remaining characters — unlike a substring, it need not be contiguous.",
    constraints: '- `1 <= s.length <= 1000`\n- `s` consists of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'A single integer: the length of the longest palindromic subsequence.',
    hints: [
      "Think about the problem recursively: if the first and last characters of a substring match, they can both be part of the palindrome; if not, one of them can be dropped.",
      'Define `dp[i][j]` as the longest palindromic subsequence within `s[i..j]`, and build it from smaller ranges upward.',
      "If `s[i] == s[j]`, `dp[i][j] = dp[i+1][j-1] + 2`; otherwise `dp[i][j] = max(dp[i+1][j], dp[i][j-1])`.",
    ],
    solutionApproach:
      "Classic interval DP. Let `dp[i][j]` be the length of the longest palindromic subsequence of `s[i..j]`. Base case `dp[i][i] = 1`. Fill in increasing order of substring length (or equivalently, `i` from n-1 down to 0, `j` from `i+1` up to `n-1`): if `s[i] == s[j]`, `dp[i][j] = dp[i+1][j-1] + 2`; otherwise `dp[i][j] = max(dp[i+1][j], dp[i][j-1])`. The answer is `dp[0][n-1]`. O(n^2) time, O(n^2) space.",
    pythonSolutionCode:
      "def longest_palindrome_subseq(s):\n    n = len(s)\n    if n == 0:\n        return 0\n    dp = [[0] * n for _ in range(n)]\n    for i in range(n - 1, -1, -1):\n        dp[i][i] = 1\n        for j in range(i + 1, n):\n            if s[i] == s[j]:\n                dp[i][j] = dp[i + 1][j - 1] + 2\n            else:\n                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])\n    return dp[0][n - 1]\n",
    solve: (s) => {
      const n = s.length;
      if (n === 0) return 0;
      const dp = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let i = n - 1; i >= 0; i -= 1) {
        dp[i][i] = 1;
        for (let j = i + 1; j < n; j += 1) {
          if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
          else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
      }
      return dp[0][n - 1];
    },
    exampleExplanation: (args, result) => `The longest palindromic subsequence hidden inside "${args[0]}" has length ${result}.`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['bb'], kind: 'edge' },
      { args: ['bbbab'], kind: 'edge' },
      { args: ['cbbd'], kind: 'edge' },
      { args: ['abcd'], kind: 'edge' },
      { args: ['aabaa'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Group Anagrams',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'stringArray', maxGroups: 4, maxLen: 6, maxCopies: 3, alphabet: 'abcde' },
    genArgs: (rng, cfg) => {
      const groupCount = randInt(rng, 1, cfg.maxGroups ?? 4);
      const strs = [];
      for (let g = 0; g < groupCount; g += 1) {
        const base = randString(rng, randInt(rng, 1, cfg.maxLen ?? 6), cfg.alphabet ?? 'abcde');
        const copies = randInt(rng, 1, cfg.maxCopies ?? 3);
        for (let c = 0; c < copies; c += 1) strs.push(shuffle(rng, base.split('')).join(''));
      }
      return [shuffle(rng, strs)];
    },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an array of strings `strs`, group the anagrams together. Two strings are anagrams of each other if one can be rearranged (using every letter exactly once) into the other.\n\nReturn the groups as one group per output line: the members of a group joined by commas, with the members themselves sorted alphabetically within the group. The groups themselves may be printed in any order.',
    constraints:
      '- `1 <= strs.length <= 10^4`\n- `0 <= strs[i].length <= 100`\n- `strs[i]` consists of lowercase English letters.\n- Within each printed group, members are sorted alphabetically so the exact grouping can be checked regardless of which order you discover the groups in.',
    inputFormat: 'Line 1: count `n`. Next `n` lines: one string each.',
    outputFormat: 'One line per anagram group, its members comma-separated in ascending alphabetical order. Line order does not matter.',
    hints: [
      'Two strings are anagrams exactly when they have the same multiset of characters — so they share some canonical "signature".',
      'Sorting the letters of a string gives a signature that is identical for every anagram of it (and different otherwise).',
      'Use a hash map from signature to the list of original strings that share it; each map bucket is one output group.',
    ],
    solutionApproach:
      "For each string, compute a canonical key by sorting its characters (e.g. `'eat'` and `'tea'` both sort to `'aet'`). Group strings by this key using a hash map. Each map bucket is one anagram group. O(n * k log k) time, where k is the max string length.",
    pythonSolutionCode:
      "def group_anagrams(strs):\n    groups = {}\n    for s in strs:\n        key = ''.join(sorted(s))\n        groups.setdefault(key, []).append(s)\n    return [','.join(sorted(g)) for g in groups.values()]\n",
    solve: (strs) => {
      const groups = new Map();
      for (const s of strs) {
        const key = s.split('').sort().join('');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
      }
      return [...groups.values()].map((g) => [...g].sort().join(','));
    },
    exampleExplanation: (args, result) => `Grouping the ${args[0].length} input string(s) by shared letter counts produces ${result.length} anagram group(s).`,
    edgeCases: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], kind: 'edge' },
      { args: [['']], kind: 'edge' },
      { args: [['a']], kind: 'edge' },
      { args: [['abc', 'bca', 'cab', 'xyz']], kind: 'edge' },
      { args: [['ab', 'ba', 'ab']], kind: 'edge' },
      { args: [['abc', 'def', 'ghi']], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Find All Anagrams in a String',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'intArray', alphabet: 'abc', maxPLen: 5, maxSegments: 6, maxNoiseLen: 4 },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet ?? 'abc';
      const p = randString(rng, randInt(rng, 1, cfg.maxPLen ?? 5), alphabet);
      const segments = randInt(rng, 2, cfg.maxSegments ?? 6);
      let s = '';
      for (let i = 0; i < segments; i += 1) {
        s += rng() < 0.5 ? shuffle(rng, p.split('')).join('') : randString(rng, randInt(rng, 1, cfg.maxNoiseLen ?? 4), alphabet);
      }
      return [s, p];
    },
    statement:
      "Given two strings `s` and `p`, return every starting index (0-indexed, ascending order) in `s` where a substring of `s` is an anagram of `p`.\n\nAn anagram of `p` is any rearrangement of exactly `p`'s characters (same length, same letter frequencies).",
    constraints: '- `1 <= s.length, p.length <= 3*10^4`\n- `s` and `p` consist of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`. Line 2: the string `p`.',
    outputFormat: 'The matching starting indices, ascending, space-separated (empty line if none).',
    hints: [
      "Checking every window of length `p.length` from scratch for being an anagram is correct but wasteful — most of a window's letter counts stay the same as you slide by one.",
      "Keep a sliding window of length `p.length` over `s`, maintaining a running letter-frequency count for the current window.",
      'When you slide the window forward by one, update the count by removing the character that fell off the left and adding the one that entered on the right, then compare the window\'s count to `p`\'s count.',
    ],
    solutionApproach:
      "Maintain two fixed-size (26-entry) letter-frequency arrays: one for `p`, and a sliding-window one for the current `p.length`-sized window of `s`. Slide the window one character at a time across `s`, updating the window's counts in O(1) per step, and compare the two frequency arrays whenever the window is full-sized. Every index where they match is an answer. O(n) time (the 26-entry comparison is a constant factor).",
    pythonSolutionCode:
      "def find_anagrams(s, p):\n    n, m = len(s), len(p)\n    if m > n:\n        return []\n    need = [0] * 26\n    window = [0] * 26\n    for ch in p:\n        need[ord(ch) - 97] += 1\n    res = []\n    for i, ch in enumerate(s):\n        window[ord(ch) - 97] += 1\n        if i >= m:\n            window[ord(s[i - m]) - 97] -= 1\n        if i >= m - 1 and window == need:\n            res.append(i - m + 1)\n    return res\n",
    solve: (s, p) => {
      const n = s.length;
      const m = p.length;
      const res = [];
      if (m > n) return res;
      const need = new Array(26).fill(0);
      const window = new Array(26).fill(0);
      const code = (ch) => ch.charCodeAt(0) - 97;
      for (const ch of p) need[code(ch)] += 1;
      for (let i = 0; i < n; i += 1) {
        window[code(s[i])] += 1;
        if (i >= m) window[code(s[i - m])] -= 1;
        if (i >= m - 1) {
          let match = true;
          for (let k = 0; k < 26; k += 1) {
            if (window[k] !== need[k]) {
              match = false;
              break;
            }
          }
          if (match) res.push(i - m + 1);
        }
      }
      return res;
    },
    exampleExplanation: (args, result) =>
      result.length
        ? `An anagram of "${args[1]}" begins at index ${result.join(', ')} in "${args[0]}".`
        : `No substring of "${args[0]}" is an anagram of "${args[1]}".`,
    edgeCases: [
      { args: ['cbaebabacd', 'abc'], kind: 'edge' },
      { args: ['abab', 'ab'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['a', 'ab'], kind: 'edge' },
      { args: ['baa', 'aa'], kind: 'edge' },
      { args: ['aaaaaa', 'aaa'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'First Unique Character in a String',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 20, alphabet: 'abcde' },
    genArgs: (rng, cfg) => [randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 20), cfg.alphabet ?? 'abcde')],
    statement:
      "Given a string `s`, find the first character that does not repeat anywhere else in `s`, and return its index. If no such character exists, return `-1`.",
    constraints: '- `1 <= s.length <= 10^5`\n- `s` consists of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'A single integer: the index of the first non-repeating character, or `-1`.',
    hints: [
      "You need to know each character's total count in the string before you can tell whether the first occurrence you see is really unique.",
      'A first pass to count every character\'s frequency sets you up for a second pass that just checks each character in order.',
      'On the second pass, return the first index whose character has a count of exactly 1.',
    ],
    solutionApproach:
      "First pass: build a frequency map of every character in `s`. Second pass: scan `s` left to right and return the index of the first character whose frequency is exactly 1. If none is found, return -1. O(n) time, O(1) space (bounded alphabet).",
    pythonSolutionCode:
      "def first_uniq_char(s):\n    from collections import Counter\n    counts = Counter(s)\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1\n",
    solve: (s) => {
      const counts = new Map();
      for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
      for (let i = 0; i < s.length; i += 1) {
        if (counts.get(s[i]) === 1) return i;
      }
      return -1;
    },
    exampleExplanation: (args, result) =>
      result === -1 ? `Every character in "${args[0]}" repeats at least once.` : `The character at index ${result} ('${args[0][result]}') is the first one that never repeats.`,
    edgeCases: [
      { args: ['leetcode'], kind: 'edge' },
      { args: ['loveleetcode'], kind: 'edge' },
      { args: ['aabb'], kind: 'edge' },
      { args: ['z'], kind: 'edge' },
      { args: ['abcabcd'], kind: 'edge' },
      { args: ['aabbcc'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'String to Integer (atoi)',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int' },
    genArgs: (rng) => {
      const kind = randInt(rng, 0, 5);
      const leadingSpaces = ' '.repeat(randInt(rng, 0, 3));
      let numStr;
      if (kind === 0) numStr = String(randInt(rng, -100000, 100000));
      else if (kind === 1) numStr = String(randInt(rng, 3000000000, 9999999999));
      else if (kind === 2) numStr = `-${randInt(rng, 3000000000, 9999999999)}`;
      else if (kind === 3) numStr = `+${randInt(rng, 0, 100000)}`;
      else if (kind === 4) numStr = `${'0'.repeat(randInt(rng, 1, 4))}${randInt(rng, 0, 10000)}`;
      else numStr = randString(rng, randInt(rng, 1, 6), 'abcxyz');
      const trailing = rng() < 0.3 ? randString(rng, randInt(rng, 1, 4), 'abc') : '';
      return [`${leadingSpaces}${numStr}${trailing}`];
    },
    statement:
      "Implement `atoi`, which converts a string to a 32-bit signed integer, following these rules applied in order:\n\n1. Skip any leading whitespace.\n2. An optional `'+'` or `'-'` sign.\n3. As many consecutive digits as possible, forming the number's magnitude.\n4. Stop reading as soon as a non-digit character is found (any remaining characters are ignored).\n5. If no digits were read at all, the result is `0`.\n6. Clamp the final result to the 32-bit signed integer range `[-2^31, 2^31 - 1]` if it would otherwise overflow.",
    constraints: '- `0 <= s.length <= 200`\n- `s` consists of English letters, digits, `\' \'`, `\'+\'`, `\'-\'`, and `\'.\'`.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'A single integer: the parsed (and clamped) 32-bit signed integer.',
    hints: [
      'Process the string strictly left to right through distinct phases: whitespace, then an optional sign, then digits — and stop the moment a character breaks the current phase.',
      "A non-digit character anywhere (including a decimal point) ends the number immediately; everything after it is irrelevant.",
      'Accumulate the digits into a normal integer as you go, then clamp the final signed value into the 32-bit range at the very end (most languages can hold the unclamped value safely before that final clamp).',
    ],
    solutionApproach:
      "Walk the string once: skip leading spaces, consume an optional sign, then consume digits into a running total (`num = num * 10 + digit`), stopping at the first non-digit. Apply the sign, then clamp the result into `[-2^31, 2^31 - 1]`. If no digits were ever consumed, the running total is naturally `0`. O(n) time, O(1) space.",
    pythonSolutionCode:
      "def my_atoi(s):\n    INT_MAX, INT_MIN = 2147483647, -2147483648\n    i, n = 0, len(s)\n    while i < n and s[i] == ' ':\n        i += 1\n    sign = 1\n    if i < n and s[i] in '+-':\n        if s[i] == '-':\n            sign = -1\n        i += 1\n    num = 0\n    while i < n and s[i].isdigit():\n        num = num * 10 + int(s[i])\n        i += 1\n    num *= sign\n    if num > INT_MAX:\n        return INT_MAX\n    if num < INT_MIN:\n        return INT_MIN\n    return num\n",
    solve: (s) => {
      const INT_MAX = 2147483647;
      const INT_MIN = -2147483648;
      const n = s.length;
      let i = 0;
      while (i < n && s[i] === ' ') i += 1;
      let sign = 1;
      if (i < n && (s[i] === '+' || s[i] === '-')) {
        if (s[i] === '-') sign = -1;
        i += 1;
      }
      let num = 0;
      while (i < n && s[i] >= '0' && s[i] <= '9') {
        num = num * 10 + (s.charCodeAt(i) - 48);
        i += 1;
        if (num > 1e18) break;
      }
      num *= sign;
      if (num > INT_MAX) return INT_MAX;
      if (num < INT_MIN) return INT_MIN;
      return num;
    },
    exampleExplanation: (args, result) => `Parsing "${args[0]}" as a 32-bit signed integer yields ${result}.`,
    edgeCases: [
      { args: ['42'], kind: 'edge' },
      { args: ['   -42'], kind: 'edge' },
      { args: ['4193 with words'], kind: 'edge' },
      { args: ['words and 987'], kind: 'edge' },
      { args: ['-91283472332'], kind: 'edge' },
      { args: ['3.14159'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Implement strStr()',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 20, alphabet: 'ab' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet ?? 'ab';
      const haystack = randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 20), alphabet);
      let needle;
      if (rng() < 0.6 && haystack.length > 0) {
        const start = randInt(rng, 0, haystack.length - 1);
        const len = randInt(rng, 1, haystack.length - start);
        needle = haystack.slice(start, start + len);
      } else {
        needle = randString(rng, randInt(rng, 1, 5), alphabet);
      }
      return [haystack, needle];
    },
    statement:
      "Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` does not occur in `haystack`.\n\nIf `needle` is the empty string, return `0`.",
    constraints: '- `0 <= haystack.length, needle.length <= 10^4`\n- `haystack` and `needle` consist of lowercase English letters.',
    inputFormat: 'Line 1: the string `haystack`. Line 2: the string `needle`.',
    outputFormat: 'A single integer: the first matching index, or `-1`.',
    hints: [
      'A straightforward approach checks every possible starting position in `haystack` for a full match against `needle`.',
      'You only need to try starting positions where the remaining part of `haystack` is at least as long as `needle`.',
      "For each candidate starting position, compare the `needle.length`-character window directly; return as soon as one matches.",
    ],
    solutionApproach:
      "Slide a window the length of `needle` across `haystack`, from index 0 up to `haystack.length - needle.length`, and compare the window's contents to `needle` directly. Return the first index where they match, or -1 if none does (treating an empty `needle` as an immediate match at index 0). This brute-force approach is O(n*m) worst case, which is fine at these constraints; KMP achieves O(n+m) if needed.",
    pythonSolutionCode:
      "def str_str(haystack, needle):\n    if needle == '':\n        return 0\n    n, m = len(haystack), len(needle)\n    for i in range(n - m + 1):\n        if haystack[i:i + m] == needle:\n            return i\n    return -1\n",
    solve: (haystack, needle) => {
      if (needle.length === 0) return 0;
      const n = haystack.length;
      const m = needle.length;
      for (let i = 0; i + m <= n; i += 1) {
        if (haystack.slice(i, i + m) === needle) return i;
      }
      return -1;
    },
    exampleExplanation: (args, result) =>
      result === -1 ? `"${args[1]}" never occurs in "${args[0]}".` : `"${args[1]}" first occurs in "${args[0]}" starting at index ${result}.`,
    edgeCases: [
      { args: ['sadbutsad', 'sad'], kind: 'edge' },
      { args: ['leetcode', 'leeto'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['mississippi', 'issip'], kind: 'edge' },
      { args: ['abc', ''], kind: 'edge' },
      { args: ['abc', 'c'], kind: 'edge' },
    ],
  },
];
