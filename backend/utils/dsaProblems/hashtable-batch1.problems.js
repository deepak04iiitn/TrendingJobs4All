import { randInt, randIntArray, randString, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Two Sum using HashMap',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'indexPair', minN: 4, maxN: 14, min: -1000, max: 1000 },
    statement:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`, using a hash map so the whole scan runs in a single pass.\n\nYou may assume each input has **exactly one** valid answer, and you may not use the same element twice. Return the answer as the two indices, smaller index first.",
    constraints: '- `2 <= nums.length <= 10^4`\n- `-10^9 <= nums[i], target <= 10^9`\n- Exactly one valid answer exists.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'The two 0-indexed indices whose values sum to target, smaller index first, space-separated.',
    hints: [
      'Checking every pair is O(n^2) — the hash map trick gets this down to a single O(n) pass.',
      'As you scan left to right, the only question that matters is: "have I already seen the number that would complete a pair with this one?"',
      'Build a hash map of value -> index as you go; before inserting the current number, look up `target - nums[i]` in it.',
    ],
    solutionApproach:
      'Walk the array once, maintaining a hash map from value to index of everything seen so far. For each `nums[i]`, compute the complement `target - nums[i]` and check the map first — if it is present, its stored index paired with `i` is the answer. Otherwise insert `nums[i] -> i` and continue. O(n) time, O(n) space, single pass.',
    pythonSolutionCode:
      'def two_sum_hashmap(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i]\n        seen[n] = i\n    return [-1, -1]\n',
    solve: (nums, target) => {
      const seen = new Map();
      for (let i = 0; i < nums.length; i += 1) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
      }
      return [-1, -1];
    },
    exampleExplanation: (args, result) =>
      `nums[${result[0]}] + nums[${result[1]}] = ${args[0][result[0]]} + ${args[0][result[1]]} = ${args[1]}, found via a single hash-map pass.`,
    edgeCases: [
      { args: [[1, 2], 3], kind: 'edge' },
      { args: [[3, 3], 6], kind: 'edge' },
      { args: [[0, 4, 3, 0], 0], kind: 'edge' },
      { args: [[-3, 4, 3, 90], 0], kind: 'edge' },
      { args: [[1, 5, 1, 5], 10], kind: 'edge' },
      { args: [[-1, -2, -3, -4, -5], -8], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Anagram using HashMap',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 14, alphabet: 'abcde' },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 14);
      const alphabet = cfg.alphabet ?? 'abcde';
      const s = randString(rng, n, alphabet);
      if (rng() < 0.5) {
        // Guaranteed anagram: t is a shuffled permutation of s's characters.
        const t = shuffle(rng, s.split('')).join('');
        return [s, t];
      }
      // Not necessarily an anagram: independent string, sometimes a different length entirely.
      const tn = rng() < 0.7 ? n : randInt(rng, 1, cfg.maxN ?? 14);
      const t = randString(rng, tn, alphabet);
      return [s, t];
    },
    statement:
      'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s` — that is, `t` uses exactly the same letters as `s`, the same number of times each, just possibly reordered — and `false` otherwise.',
    constraints: '- `1 <= s.length, t.length <= 5*10^4`\n- `s` and `t` consist of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`. Line 2: the string `t`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'If the two strings have different lengths, they cannot possibly be anagrams — check that first.',
      'Sorting both strings and comparing works, but a hash map of character counts avoids the sort entirely.',
      'Count every character of `s` into a hash map, then walk `t` decrementing counts — if any count ever goes negative, or a character in `t` never appeared in `s`, they are not anagrams.',
    ],
    solutionApproach:
      "Build a hash map of character -> count for `s`. Walk `t`, decrementing the count for each character; if a character is missing from the map or its count would drop below zero, `t` is not an anagram of `s`. Finally, every count must return to zero (equivalently, just check the two length-matched frequency maps are equal). O(n) time, O(1) space since the alphabet is fixed.",
    pythonSolutionCode:
      'def valid_anagram(s, t):\n    if len(s) != len(t):\n        return False\n    counts = {}\n    for ch in s:\n        counts[ch] = counts.get(ch, 0) + 1\n    for ch in t:\n        if counts.get(ch, 0) == 0:\n            return False\n        counts[ch] -= 1\n    return True\n',
    solve: (s, t) => {
      if (s.length !== t.length) return false;
      const counts = new Map();
      for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
      for (const ch of t) {
        const c = counts.get(ch) || 0;
        if (c === 0) return false;
        counts.set(ch, c - 1);
      }
      return true;
    },
    exampleExplanation: (args, result) =>
      result ? `"${args[1]}" uses exactly the same letters as "${args[0]}", so they are anagrams.` : `"${args[1]}" is not an anagram of "${args[0]}".`,
    edgeCases: [
      { args: ['anagram', 'nagaram'], kind: 'edge' },
      { args: ['rat', 'car'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['ab', 'a'], kind: 'edge' },
      { args: ['aacc', 'ccac'], kind: 'edge' },
      { args: ['aab', 'aba'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Group Anagrams using HashMap',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'stringArray', minN: 1, maxN: 8, maxLen: 5, alphabet: 'abc' },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'Given an array of strings `strs`, group the anagrams together. Two strings belong in the same group if one can be rearranged into the other.\n\nEach group is printed as its member strings joined by commas; within a group, members are printed in ascending alphabetical order so the output is deterministic. Groups themselves may be printed in any order.',
    constraints:
      '- `1 <= strs.length <= 10^4`\n- `0 <= strs[i].length <= 100`\n- `strs[i]` consists of lowercase English letters.\n- Within a printed group, members are sorted ascending; the order of the groups themselves does not matter.',
    inputFormat: 'Line 1: count `n`. Next `n` lines: one string each.',
    outputFormat: 'One group per line, its members comma-separated in ascending order. Line order does not matter.',
    hints: [
      'Two strings are anagrams exactly when they have the same multiset of characters — you need a key that is identical for anagrams and different otherwise.',
      "Sorting a string's characters gives exactly that key: any two anagrams sort to the same string.",
      'Use a hash map from sorted-string -> list of original strings; each map entry, once collected, is one output group.',
    ],
    solutionApproach:
      "For each string, compute its canonical key by sorting its characters (e.g. \"eat\" -> \"aet\"). Use a hash map from that key to the list of original strings sharing it — every string with the same key is an anagram of the others. The map's values are the groups; sort each group's members for a deterministic printout. O(n * k log k) time where `k` is the max string length.",
    pythonSolutionCode:
      'def group_anagrams(strs):\n    groups = {}\n    for s in strs:\n        key = "".join(sorted(s))\n        groups.setdefault(key, []).append(s)\n    return [sorted(g) for g in groups.values()]\n',
    solve: (strs) => {
      const groups = new Map();
      for (const s of strs) {
        const key = s.split('').sort().join('');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
      }
      return [...groups.values()].map((g) => [...g].sort());
    },
    exampleExplanation: (args, result) => `The ${args[0].length} input string(s) fall into ${result.length} anagram group(s).`,
    edgeCases: [
      { args: [['']], kind: 'edge' },
      { args: [['a']], kind: 'edge' },
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], kind: 'edge' },
      { args: [['', '']], kind: 'edge' },
      { args: [['abc', 'bca', 'cab', 'xyz']], kind: 'edge' },
      { args: [['ab', 'ab', 'ab']], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Consecutive Sequence',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 0, maxN: 20, min: -50, max: 50 },
    statement:
      'Given an unsorted array of integers `nums`, return the length of the longest run of consecutive integers (values that differ by exactly 1, in some order, not necessarily contiguous positions in the array).\n\nYour algorithm should run in O(n) time — sorting first would be O(n log n) and misses the point of the exercise.',
    constraints: '- `0 <= nums.length <= 10^5`\n- `-10^9 <= nums[i] <= 10^9`',
    inputFormat: 'Line 1: the array `nums`, space-separated (may be empty).',
    outputFormat: 'A single integer: the length of the longest consecutive run (0 if the array is empty).',
    hints: [
      'Sorting works but costs O(n log n); a hash set gets you O(n) instead.',
      'Put every number in a hash set. A number can only be the *start* of a run if `number - 1` is not in the set.',
      'From each run-start, keep checking `number + 1`, `number + 2`, ... in the set to measure how far that run extends, and track the best length seen.',
    ],
    solutionApproach:
      'Insert every value into a hash set for O(1) membership checks. For each value that is the start of a run (i.e. `value - 1` is absent from the set), walk forward counting how many consecutive values are present, and keep the maximum length found. Every element is only ever extended from its run\'s start, so the total work across all runs is O(n) despite the nested-looking loop.',
    pythonSolutionCode:
      'def longest_consecutive(nums):\n    num_set = set(nums)\n    best = 0\n    for n in num_set:\n        if n - 1 in num_set:\n            continue\n        length = 1\n        cur = n\n        while cur + 1 in num_set:\n            cur += 1\n            length += 1\n        best = max(best, length)\n    return best\n',
    solve: (nums) => {
      const set = new Set(nums);
      let best = 0;
      for (const n of set) {
        if (set.has(n - 1)) continue;
        let length = 1;
        let cur = n;
        while (set.has(cur + 1)) {
          cur += 1;
          length += 1;
        }
        if (length > best) best = length;
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      result > 0 ? `The longest run of consecutive integers in the array has length ${result}.` : 'The array is empty, so the longest run has length 0.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[7]], kind: 'edge' },
      { args: [[100, 4, 200, 1, 3, 2]], kind: 'edge' },
      { args: [[1, 2, 2, 3]], kind: 'edge' },
      { args: [[-3, -2, -1, 0]], kind: 'edge' },
      { args: [[5, 5, 5, 5]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Subarray Sum Equals K',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 16, min: -10, max: 10 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 16);
      const min = cfg.min ?? -10;
      const max = cfg.max ?? 10;
      const arr = randIntArray(rng, n, min, max);
      let k;
      if (rng() < 0.7) {
        // Guarantee at least one matching subarray exists by targeting a real subarray's sum.
        const i = randInt(rng, 0, n - 1);
        const j = randInt(rng, i, n - 1);
        let sum = 0;
        for (let x = i; x <= j; x += 1) sum += arr[x];
        k = sum;
      } else {
        k = randInt(rng, min, max);
      }
      return [arr, k];
    },
    statement:
      'Given an integer array `nums` and an integer `k`, return the total number of contiguous subarrays whose elements sum to exactly `k`.\n\nThe array may contain negative numbers, zero, and repeated values.',
    constraints: '- `1 <= nums.length <= 2*10^4`\n- `-1000 <= nums[i] <= 1000`\n- `-10^7 <= k <= 10^7`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: 'A single integer: the count of contiguous subarrays summing to `k`.',
    hints: [
      'A brute-force check of every (start, end) pair is O(n^2) — a running prefix sum plus a hash map gets this to O(n).',
      'If `prefixSum[j] - prefixSum[i] = k`, then the subarray between `i+1` and `j` sums to `k`. Rearranged, you\'re looking for how many earlier prefix sums equal `prefixSum[j] - k`.',
      'Keep a hash map of prefix-sum -> how many times it has occurred so far (seeded with `{0: 1}` for the empty prefix), and add to the answer as you scan.',
    ],
    solutionApproach:
      'Track a running prefix sum while scanning left to right, and a hash map counting how many times each prefix-sum value has occurred (starting with `{0: 1}` to account for subarrays beginning at index 0). At each position, the number of prior prefix sums equal to `currentSum - k` is exactly the number of subarrays ending here that sum to `k` — add that count to the answer, then record the current prefix sum in the map. O(n) time, O(n) space.',
    pythonSolutionCode:
      'def subarray_sum_equals_k(nums, k):\n    prefix_counts = {0: 1}\n    total = 0\n    running = 0\n    for n in nums:\n        running += n\n        total += prefix_counts.get(running - k, 0)\n        prefix_counts[running] = prefix_counts.get(running, 0) + 1\n    return total\n',
    solve: (nums, k) => {
      const prefixCounts = new Map([[0, 1]]);
      let running = 0;
      let total = 0;
      for (const n of nums) {
        running += n;
        total += prefixCounts.get(running - k) || 0;
        prefixCounts.set(running, (prefixCounts.get(running) || 0) + 1);
      }
      return total;
    },
    exampleExplanation: (args, result) =>
      `${result} contiguous subarray(s) of [${args[0].join(',')}] sum to ${args[1]}.`,
    edgeCases: [
      { args: [[1, 1, 1], 2], kind: 'edge' },
      { args: [[1, 2, 3], 3], kind: 'edge' },
      { args: [[1], 0], kind: 'edge' },
      { args: [[0, 0, 0], 0], kind: 'edge' },
      { args: [[-1, -1, 1], -2], kind: 'edge' },
      { args: [[1, -1, 0], 0], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Happy Number',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'bool', min: 1, max: 100000 },
    statement:
      'A number `n` is "happy" if, repeatedly replacing it with the sum of the squares of its digits, you eventually reach `1`. If instead this process loops forever in a cycle that never includes `1`, the number is not happy.\n\nGiven a positive integer `n`, return `true` if it is happy, and `false` otherwise.',
    constraints: '- `1 <= n <= 2^31 - 1`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Simulate the process directly: repeatedly replace the number with the sum of the squares of its digits.',
      'The hard part is knowing when to stop if it never reaches 1 — but the sequence of values must eventually repeat a number it has seen before (a cycle), since each step is deterministic and bounded.',
      'Keep a hash set of every value you have produced; if you ever produce a value already in the set (and it is not 1), you are in a cycle and the number is not happy.',
    ],
    solutionApproach:
      "Repeatedly transform `n` into the sum of the squares of its digits, tracking every value seen so far in a hash set. If the value ever becomes `1`, the number is happy. If a value repeats (is already in the set) before reaching `1`, the process has entered a cycle that will never reach `1`, so the number is not happy. Each transformation reduces large numbers quickly, so this terminates fast in practice.",
    pythonSolutionCode:
      'def is_happy(n):\n    seen = set()\n    cur = n\n    while cur != 1 and cur not in seen:\n        seen.add(cur)\n        total = 0\n        while cur > 0:\n            cur, digit = divmod(cur, 10)\n            total += digit * digit\n        cur = total\n    return cur == 1\n',
    solve: (n) => {
      const seen = new Set();
      let cur = n;
      while (cur !== 1 && !seen.has(cur)) {
        seen.add(cur);
        let total = 0;
        while (cur > 0) {
          const digit = cur % 10;
          total += digit * digit;
          cur = Math.floor(cur / 10);
        }
        cur = total;
      }
      return cur === 1;
    },
    exampleExplanation: (args, result) => (result ? `${args[0]} eventually reaches 1, so it is a happy number.` : `${args[0]} falls into a repeating cycle that never reaches 1, so it is not happy.`),
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [19], kind: 'edge' },
      { args: [7], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [100], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Isomorphic Strings',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 12 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12);
      const sourceAlphabet = 'abcd';
      const s = randString(rng, n, sourceAlphabet);
      if (rng() < 0.5) {
        // Build t via a consistent, injective per-character mapping -> guaranteed isomorphic.
        const targetAlphabet = 'ABCDEFGHIJ';
        const mapping = new Map();
        const used = new Set();
        let t = '';
        for (const ch of s) {
          if (!mapping.has(ch)) {
            let target = targetAlphabet[randInt(rng, 0, targetAlphabet.length - 1)];
            while (used.has(target)) target = targetAlphabet[randInt(rng, 0, targetAlphabet.length - 1)];
            mapping.set(ch, target);
            used.add(target);
          }
          t += mapping.get(ch);
        }
        return [s, t];
      }
      // Independent same-length string from a different alphabet -- may or may not be isomorphic by chance.
      const t = randString(rng, n, 'ABCD');
      return [s, t];
    },
    statement:
      'Given two strings `s` and `t` of the same length, return `true` if `s` is isomorphic to `t`.\n\nTwo strings are isomorphic if the characters in `s` can be replaced to get `t`, following one rule: every occurrence of a character in `s` must map to the same character in `t`, and no two different characters in `s` may map to the same character in `t` (the mapping must be one-to-one in both directions).',
    constraints: '- `1 <= s.length <= 5*10^4`\n- `t.length == s.length`\n- `s` and `t` consist of any ASCII characters.',
    inputFormat: 'Line 1: the string `s`. Line 2: the string `t`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'A single mapping from `s`-characters to `t`-characters is necessary, but not sufficient on its own.',
      'You also need the reverse to hold: no two different `s`-characters can map to the same `t`-character, or the mapping is not one-to-one.',
      'Keep two hash maps, one in each direction, and update them together at every position — reject as soon as either one would be violated.',
    ],
    solutionApproach:
      'Walk `s` and `t` in lockstep, maintaining two hash maps: one from `s`-char to `t`-char, and one from `t`-char to `s`-char. At each position, if the forward map already has an entry for `s[i]` that disagrees with `t[i]`, or the backward map already has an entry for `t[i]` that disagrees with `s[i]`, the strings are not isomorphic. Otherwise record both mappings and continue. O(n) time, O(1) space (bounded alphabet).',
    pythonSolutionCode:
      'def is_isomorphic(s, t):\n    if len(s) != len(t):\n        return False\n    map_st, map_ts = {}, {}\n    for a, b in zip(s, t):\n        if map_st.get(a, b) != b or map_ts.get(b, a) != a:\n            return False\n        map_st[a] = b\n        map_ts[b] = a\n    return True\n',
    solve: (s, t) => {
      if (s.length !== t.length) return false;
      const mapST = new Map();
      const mapTS = new Map();
      for (let i = 0; i < s.length; i += 1) {
        const a = s[i];
        const b = t[i];
        if (mapST.has(a) && mapST.get(a) !== b) return false;
        if (mapTS.has(b) && mapTS.get(b) !== a) return false;
        mapST.set(a, b);
        mapTS.set(b, a);
      }
      return true;
    },
    exampleExplanation: (args, result) =>
      result ? `Each character of "${args[0]}" maps consistently and uniquely to a character of "${args[1]}".` : `"${args[0]}" and "${args[1]}" cannot be mapped character-for-character without a conflict.`,
    edgeCases: [
      { args: ['egg', 'add'], kind: 'edge' },
      { args: ['foo', 'bar'], kind: 'edge' },
      { args: ['paper', 'title'], kind: 'edge' },
      { args: ['badc', 'baba'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['ab', 'aa'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Word Pattern',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 8 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      const patternAlphabet = 'abcd';
      const pattern = randString(rng, n, patternAlphabet);
      const wordBank = ['dog', 'cat', 'fish', 'bird', 'cow', 'pig', 'rat', 'ant'];
      if (rng() < 0.5) {
        // Build words via a consistent, injective letter -> word mapping -> guaranteed match.
        const mapping = new Map();
        const used = new Set();
        const words = [];
        for (const ch of pattern) {
          if (!mapping.has(ch)) {
            let w = wordBank[randInt(rng, 0, wordBank.length - 1)];
            while (used.has(w)) w = wordBank[randInt(rng, 0, wordBank.length - 1)];
            mapping.set(ch, w);
            used.add(w);
          }
          words.push(mapping.get(ch));
        }
        return [pattern, words.join(' ')];
      }
      // Independent random words, same count as the pattern length -- may or may not follow the pattern.
      const words = Array.from({ length: n }, () => wordBank[randInt(rng, 0, wordBank.length - 1)]);
      return [pattern, words.join(' ')];
    },
    statement:
      'Given a `pattern` (a string of letters) and a string `s` of space-separated words, return `true` if `s` follows the same pattern.\n\n"Follows" means there is a one-to-one correspondence between each letter of `pattern` and each word of `s`: every occurrence of a given letter always lines up with the same word, and every occurrence of a given word always lines up with the same letter.',
    constraints:
      '- `1 <= pattern.length <= 300`\n- `pattern` consists of lowercase English letters.\n- `1 <= s.length <= 3000`\n- `s` consists of lowercase English words separated by single spaces, with no leading/trailing spaces.',
    inputFormat: 'Line 1: the string `pattern`. Line 2: the string `s` (space-separated words).',
    outputFormat: '`true` or `false`.',
    hints: [
      'First check the word count: if `s` does not split into exactly as many words as `pattern` has letters, it can never match.',
      'This is a bijection problem just like isomorphic strings, except one side is single characters and the other is whole words.',
      'Keep a hash map from letter -> word and another from word -> letter, updating both together and rejecting on the first mismatch in either direction.',
    ],
    solutionApproach:
      'Split `s` on spaces into a list of words. If the word count does not equal `pattern.length`, return `false` immediately. Otherwise walk both in lockstep, maintaining a hash map from letter to word and a reverse hash map from word to letter; if either map already has a conflicting entry at any position, the pattern does not hold. O(n) time.',
    pythonSolutionCode:
      'def word_pattern(pattern, s):\n    words = s.split()\n    if len(words) != len(pattern):\n        return False\n    char_to_word, word_to_char = {}, {}\n    for c, w in zip(pattern, words):\n        if char_to_word.get(c, w) != w or word_to_char.get(w, c) != c:\n            return False\n        char_to_word[c] = w\n        word_to_char[w] = c\n    return True\n',
    solve: (pattern, s) => {
      const words = s.length ? s.trim().split(/\s+/) : [];
      if (words.length !== pattern.length) return false;
      const charToWord = new Map();
      const wordToChar = new Map();
      for (let i = 0; i < pattern.length; i += 1) {
        const c = pattern[i];
        const w = words[i];
        if (charToWord.has(c) && charToWord.get(c) !== w) return false;
        if (wordToChar.has(w) && wordToChar.get(w) !== c) return false;
        charToWord.set(c, w);
        wordToChar.set(w, c);
      }
      return true;
    },
    exampleExplanation: (args, result) =>
      result ? `Each letter of "${args[0]}" lines up with exactly one word of "${args[1]}", and vice versa.` : `"${args[1]}" does not follow the pattern "${args[0]}" — some letter or word is used inconsistently.`,
    edgeCases: [
      { args: ['abba', 'dog cat cat dog'], kind: 'edge' },
      { args: ['abba', 'dog cat cat fish'], kind: 'edge' },
      { args: ['aaaa', 'dog cat cat dog'], kind: 'edge' },
      { args: ['abba', 'dog dog dog dog'], kind: 'edge' },
      { args: ['a', 'dog'], kind: 'edge' },
      { args: ['ab', 'dog dog'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'LRU Cache',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'int',
      queryOps: ['get'],
      genOps: (rng) => {
        const capacity = randInt(rng, 1, 3);
        const ops = [{ name: 'LRUCache', args: [capacity] }];
        const keys = Array.from({ length: capacity + 2 }, (_, i) => i + 1);
        const count = randInt(rng, 6, 12);
        let getsSoFar = 0;
        for (let i = 0; i < count; i += 1) {
          const key = keys[randInt(rng, 0, keys.length - 1)];
          const doGet = i > 0 && rng() < 0.4;
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
      'Design a fixed-capacity cache that supports two operations in O(1) average time each, evicting the **least recently used** entry whenever it is full:\n\n- `LRUCache(capacity)` — initializes the cache with a positive size limit.\n- `get(key)` — returns the value for `key` if present (marking it as just used), otherwise returns `-1`.\n- `put(key, value)` — inserts or updates the value for `key` (marking it as just used); if this causes the cache to exceed `capacity`, evict the least recently used entry first.\n\nBoth `get` and `put` count as "using" a key for recency purposes.',
    constraints:
      '- `1 <= capacity <= 3000`\n- `1 <= key, value <= 10^4`\n- The first operation in every sequence is always `LRUCache capacity`.\n- At most `2*10^4` calls total.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName` followed by its arguments, e.g. `LRUCache 2`, `put 1 1`, `get 1` — the very first operation is always `LRUCache capacity`.',
    outputFormat: 'One line per `get` call, in order, with that call\'s result (`-1` if the key is not present). `LRUCache` and `put` produce no output.',
    hints: [
      'You need O(1) average time for both operations — a plain array scanned for "least recently used" would be O(n).',
      'A hash map from key to value gives O(1) lookups, but on its own it has no idea which key was used least recently.',
      "Combine the hash map with a structure that preserves usage order (a doubly linked list in a from-scratch design, or a language-provided ordered map like Python's OrderedDict / JS's Map): every time a key is touched by get or put, move it to the \"most recently used\" end.",
    ],
    solutionApproach:
      "Keep the cache as an insertion-ordered map (key -> value). On `get`, if the key is missing return -1; otherwise delete and re-insert it so it becomes the most-recently-used entry, then return its value. On `put`, if the key already exists delete it first (so re-inserting refreshes its recency), insert the new value, and if the map now exceeds `capacity`, remove the very first (least-recently-used) entry. Because both a JS `Map` and Python's `OrderedDict` preserve insertion order and support O(1) delete/re-insert, both operations stay O(1) average.",
    pythonSolutionCode:
      'from collections import OrderedDict\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key, value):\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)\n',
    solve: (ops) => {
      let capacity = 1;
      let cache = new Map();
      const results = [];
      for (const op of ops) {
        if (op.name === 'LRUCache') {
          capacity = op.args[0];
          cache = new Map();
        } else if (op.name === 'put') {
          const [key, value] = op.args;
          if (cache.has(key)) cache.delete(key);
          cache.set(key, value);
          if (cache.size > capacity) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
          }
        } else if (op.name === 'get') {
          const key = op.args[0];
          if (!cache.has(key)) {
            results.push(-1);
            continue;
          }
          const val = cache.get(key);
          cache.delete(key);
          cache.set(key, val);
          results.push(val);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each `get` reflects the cache\'s contents at that point, after any evictions caused by earlier `put` calls.',
    edgeCases: [
      {
        args: [
          [
            { name: 'LRUCache', args: [2] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [2, 2] },
            { name: 'get', args: [1] },
            { name: 'put', args: [3, 3] },
            { name: 'get', args: [2] },
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
            { name: 'LRUCache', args: [1] },
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
            { name: 'LRUCache', args: [2] },
            { name: 'put', args: [1, 1] },
            { name: 'put', args: [1, 2] },
            { name: 'get', args: [1] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'LRUCache', args: [2] },
            { name: 'get', args: [1] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'LRUCache', args: [3] },
            { name: 'put', args: [1, 10] },
            { name: 'put', args: [2, 20] },
            { name: 'get', args: [1] },
            { name: 'get', args: [2] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },
];
