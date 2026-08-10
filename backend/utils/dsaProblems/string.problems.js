import { randInt, randString } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Valid Palindrome',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15 },
    genArgs: (rng, cfg) => {
      const alphabet = 'abcdefg';
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      if (rng() < 0.5) {
        // Force a genuine (possibly noisy) palindrome half the time.
        const half = randString(rng, Math.ceil(n / 2), alphabet);
        const core = half + (n % 2 ? half.slice(0, -1).split('').reverse().join('') : half.split('').reverse().join(''));
        return [core];
      }
      return [randString(rng, n, alphabet)];
    },
    statement:
      "A phrase is a **palindrome** if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    constraints: '- `1 <= s.length <= 2*10^5`\n- `s` consists only of printable ASCII characters.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'First strip out anything that is not a letter or digit, and lowercase everything.',
      'Two pointers, one from each end, moving inward and comparing characters, is enough — no need to build the reversed string explicitly (though it also works).',
      'An empty string after cleaning counts as a palindrome.',
    ],
    solutionApproach:
      'Lowercase the string and strip non-alphanumeric characters. Then use two pointers starting at each end, moving inward, returning false the moment they disagree. O(n) time, O(n) space for the cleaned string (O(1) extra if done in place with two pointers over the original).',
    pythonSolutionCode:
      'import re\n\ndef is_palindrome(s):\n    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())\n    return cleaned == cleaned[::-1]\n',
    solve: (s) => {
      const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleaned === cleaned.split('').reverse().join('');
    },
    exampleExplanation: (args, result) =>
      result ? 'Ignoring case and punctuation, the string reads the same forward and backward.' : 'Ignoring case and punctuation, the string does not read the same in reverse.',
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: [' '], kind: 'edge' },
      { args: ['a'], kind: 'edge' },
      { args: ['A man, a plan, a canal: Panama'], kind: 'edge' },
      { args: ['race a car'], kind: 'edge' },
      { args: ['0P'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Reverse a String',
    shape: 'string_to_string',
    shapeConfig: { minN: 1, maxN: 20 },
    statement: 'Given a string `s`, return the string reversed.',
    constraints: '- `1 <= s.length <= 10^5`',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'The reversed string.',
    hints: [
      'Two pointers swapping from both ends toward the middle solve this in place.',
      'Most languages let you reverse a sequence directly, but implementing the two-pointer swap yourself is the point of the exercise.',
    ],
    solutionApproach: 'Two pointers start at each end of the string/character array and swap inward until they meet. O(n) time, O(1) extra space.',
    pythonSolutionCode: 'def reverse_string(s):\n    return s[::-1]\n',
    solve: (s) => s.split('').reverse().join(''),
    exampleExplanation: () => 'Characters are read from the end to the beginning.',
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['ab'], kind: 'edge' },
      { args: ['aaaa'], kind: 'edge' },
      { args: ['Route2Hire'], kind: 'edge' },
      { args: ['racecar'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Anagram',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 12, alphabet: 'abcde' },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12);
      const a = randString(rng, n, cfg.alphabet);
      if (rng() < 0.5) {
        const b = a.split('').sort(() => rng() - 0.5).join('');
        return [a, b];
      }
      return [a, randString(rng, n, cfg.alphabet)];
    },
    statement: 'Given two strings `a` and `b`, return `true` if `b` is an anagram of `a`, and `false` otherwise.',
    constraints: '- `1 <= a.length, b.length <= 5*10^4`\n- `a` and `b` consist of lowercase English letters.',
    inputFormat: 'Line 1: string `a`. Line 2: string `b`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Different lengths immediately rule out an anagram.',
      'Counting character frequencies and comparing the two counts is a clean O(n) approach.',
      'Sorting both strings and comparing also works, at O(n log n).',
    ],
    solutionApproach: 'If lengths differ, return false immediately. Otherwise build a character-frequency count for each string and compare them (or sort both strings and compare). O(n) time with counting.',
    pythonSolutionCode:
      'from collections import Counter\n\ndef is_anagram(a, b):\n    return Counter(a) == Counter(b)\n',
    solve: (a, b) => {
      if (a.length !== b.length) return false;
      return a.split('').sort().join('') === b.split('').sort().join('');
    },
    exampleExplanation: (args, result) => (result ? 'Both strings contain exactly the same letters with the same frequency.' : 'The letter counts of the two strings differ.'),
    edgeCases: [
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['a', 'b'], kind: 'edge' },
      { args: ['anagram', 'nagaram'], kind: 'edge' },
      { args: ['rat', 'car'], kind: 'edge' },
      { args: ['aacc', 'ccac'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Common Prefix',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'string', minN: 1, maxN: 8 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      const prefix = randString(rng, randInt(rng, 0, 4));
      const strs = Array.from({ length: n }, () => prefix + randString(rng, randInt(rng, 0, 6)));
      return [strs];
    },
    statement: 'Given an array of strings `strs`, return the longest common prefix string amongst all of them. If there is no common prefix, return an empty string.',
    constraints: '- `1 <= strs.length <= 200`\n- `0 <= strs[i].length <= 200`',
    inputFormat: 'Line 1: count `n`. Next `n` lines: one string each.',
    outputFormat: 'The longest common prefix (may be an empty line).',
    hints: [
      'Start by assuming the whole first string is the answer, then shrink it.',
      'Compare your current candidate prefix against each remaining string, trimming from the end whenever it fails to match.',
      'If the candidate ever becomes empty, you can stop immediately — the answer is "".',
    ],
    solutionApproach:
      "Take the first string as an initial candidate prefix. For each subsequent string, shrink the candidate from the end until the string starts with it. If the candidate becomes empty, return \"\" immediately. O(S) time where S is the total character count.",
    pythonSolutionCode:
      'def longest_common_prefix(strs):\n    if not strs:\n        return ""\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix:\n                return ""\n    return prefix\n',
    solve: (strs) => {
      if (!strs.length) return '';
      let prefix = strs[0];
      for (let i = 1; i < strs.length; i += 1) {
        while (!strs[i].startsWith(prefix)) {
          prefix = prefix.slice(0, -1);
          if (!prefix) return '';
        }
      }
      return prefix;
    },
    exampleExplanation: (args, result) => (result ? `Every string begins with "${result}".` : 'No character is shared by every string at the same starting position.'),
    edgeCases: [
      { args: [['flower', 'flow', 'flight']], kind: 'edge' },
      { args: [['dog', 'racecar', 'car']], kind: 'edge' },
      { args: [['a']], kind: 'edge' },
      { args: [['', 'b']], kind: 'edge' },
      { args: [['same', 'same', 'same']], kind: 'edge' },
    ],
  },
];
