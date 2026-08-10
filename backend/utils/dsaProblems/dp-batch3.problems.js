import { randInt, randIntArray, randString, sample } from '../dsaIOShapes.js';

/** Small, mostly non-overlapping word banks so Word Break / Word Break II generate
 * sane, boundable test cases (Word Break II's search space is exponential in the
 * worst case, so we deliberately avoid heavily-overlapping short tokens like
 * 'a'/'aa'/'aaa' in its bank). */
const WORD_BREAK_BANK = [
  'leet', 'code', 'apple', 'pen', 'pie', 'sand', 'and', 'cats', 'cat', 'dog',
  'ice', 'cream', 'goal', 'special', 'car', 'ca', 'rs', 'the', 'go', 'og',
];

const WORD_BREAK_II_BANK = [
  'cat', 'cats', 'and', 'sand', 'dog', 'pine', 'apple', 'pen', 'applepen', 'pineapple',
];

function wordBreakSolve(s, dictLine) {
  const words = dictLine.split(/\s+/).filter(Boolean);
  const wordSet = new Set(words);
  const maxLen = words.reduce((m, w) => Math.max(m, w.length), 0);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i += 1) {
    for (let j = Math.max(0, i - maxLen); j < i; j += 1) {
      if (dp[j] && wordSet.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}

export default [
  {
    legacyProblemName: 'Unique Paths',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minDim: 1, maxDim: 15 },
    genArgs: (rng, cfg) => {
      const m = randInt(rng, cfg.minDim ?? 1, cfg.maxDim ?? 15);
      const n = randInt(rng, cfg.minDim ?? 1, cfg.maxDim ?? 15);
      return [[m, n]];
    },
    statement:
      'A robot sits at the top-left corner of an `m x n` grid. It can only move either **down** or **right** at any point in time, and it is trying to reach the bottom-right corner.\n\nGiven the two integers `m` and `n` (encoded as a 2-element array `[m, n]`), return the number of possible distinct paths the robot can take.',
    constraints: '- `1 <= m, n <= 100`\n- The answer is guaranteed to fit in a 32-bit signed integer for the official problem; this judge tests smaller grids so results stay exact.',
    inputFormat: 'Line 1: two space-separated integers, `m` and `n`.',
    outputFormat: 'A single integer: the number of distinct paths from top-left to bottom-right.',
    hints: [
      'The robot only ever moves right or down, so a path is really just a sequence of R/D moves — think about how many cells it takes to reach each intermediate square.',
      'The number of ways to reach cell `(i, j)` is the number of ways to reach the cell above it plus the number of ways to reach the cell to its left.',
      'You only need one row of a DP table at a time: initialize every cell to 1 (the first row/column always has exactly one path) and accumulate lefts into it row by row.',
    ],
    solutionApproach:
      'This is a classic grid DP. Let `dp[j]` be the number of ways to reach column `j` of the current row. Every cell in the first row and first column has exactly one path (straight line), so initialize a 1D array of `n` ones. Then for each subsequent row, update `dp[j] += dp[j-1]` for `j >= 1` — the new value at `j` combines "came from above" (the old `dp[j]`) with "came from the left" (`dp[j-1]`). After processing all `m` rows, `dp[n-1]` holds the answer. O(m*n) time, O(n) space. (Equivalently, the answer is the closed-form binomial coefficient `C(m+n-2, m-1)`.)',
    pythonSolutionCode:
      'def unique_paths(dims):\n    m, n = dims[0], dims[1]\n    dp = [1] * n\n    for _ in range(1, m):\n        for j in range(1, n):\n            dp[j] += dp[j - 1]\n    return dp[-1]\n',
    solve: (dims) => {
      const [m, n] = dims;
      const dp = new Array(n).fill(1);
      for (let i = 1; i < m; i += 1) {
        for (let j = 1; j < n; j += 1) {
          dp[j] += dp[j - 1];
        }
      }
      return dp[n - 1];
    },
    exampleExplanation: (args, result) => `On a ${args[0][0]}x${args[0][1]} grid, there are ${result} distinct right/down paths from the top-left to the bottom-right corner.`,
    edgeCases: [
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 10]], kind: 'edge' },
      { args: [[10, 1]], kind: 'edge' },
      { args: [[3, 7]], kind: 'edge' },
      { args: [[7, 3]], kind: 'edge' },
      { args: [[15, 15]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Unique Paths II',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: {
      outputType: 'int',
      gridMinRows: 1,
      gridMaxRows: 10,
      gridMinCols: 1,
      gridMaxCols: 10,
      obstacleChance: 0.2,
    },
    genArgs: (rng, cfg) => {
      const rows = randInt(rng, cfg.gridMinRows ?? 1, cfg.gridMaxRows ?? 10);
      const cols = randInt(rng, cfg.gridMinCols ?? 1, cfg.gridMaxCols ?? 10);
      const chance = cfg.obstacleChance ?? 0.2;
      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (rng() < chance ? 1 : 0))
      );
      return [grid];
    },
    statement:
      'A robot again starts at the top-left corner of a grid and can only move **down** or **right**, trying to reach the bottom-right corner. This time some cells contain obstacles: `grid[i][j] = 1` means that cell is blocked, `0` means it is free.\n\nReturn the number of distinct paths from the top-left to the bottom-right corner that avoid all obstacles. If the start or end cell itself is blocked, the answer is `0`.',
    constraints: '- `1 <= rows, cols <= 100`\n- `grid[i][j]` is either `0` (free) or `1` (obstacle).',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated 0/1 values each.',
    outputFormat: 'A single integer: the number of obstacle-free paths from top-left to bottom-right.',
    hints: [
      'This is Unique Paths with one extra rule: any cell that is an obstacle contributes zero paths, no matter what.',
      'Use the same row-by-row DP as the obstacle-free version, but whenever you land on an obstacle cell, force its path count to 0 instead of accumulating.',
      'Careful with the first row and first column: a single obstacle anywhere along them blocks every cell after it in that row/column.',
    ],
    solutionApproach:
      'Run the same rolling 1D DP as Unique Paths, but add an obstacle check: for cell `(i, j)`, if `grid[i][j] == 1`, set `dp[j] = 0` (blocked, no paths reach here). Otherwise, if `i == 0 && j == 0`, `dp[j] = 1` (the start, unless it is itself blocked); if `j > 0`, `dp[j] += dp[j-1]` (accumulate from the left); if `j == 0` and `i > 0`, `dp[j]` is left unchanged — it already holds the count carried down from the row above. After all rows, `dp[cols-1]` is the answer. O(rows*cols) time, O(cols) space.',
    pythonSolutionCode:
      'def unique_paths_with_obstacles(grid):\n    rows, cols = len(grid), len(grid[0])\n    dp = [0] * cols\n    for i in range(rows):\n        for j in range(cols):\n            if grid[i][j] == 1:\n                dp[j] = 0\n            elif i == 0 and j == 0:\n                dp[j] = 1\n            elif j > 0:\n                dp[j] += dp[j - 1]\n    return dp[-1]\n',
    solve: (grid) => {
      const rows = grid.length;
      const cols = grid[0].length;
      const dp = new Array(cols).fill(0);
      for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
          if (grid[i][j] === 1) {
            dp[j] = 0;
          } else if (i === 0 && j === 0) {
            dp[j] = 1;
          } else if (j > 0) {
            dp[j] += dp[j - 1];
          }
        }
      }
      return dp[cols - 1];
    },
    exampleExplanation: () => 'Paths that would step onto an obstacle cell are excluded from the count entirely.',
    edgeCases: [
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 0]]], kind: 'edge' },
      { args: [[[0, 1]]], kind: 'edge' },
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], kind: 'edge' },
      { args: [[[0, 0], [1, 1], [0, 0]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Minimum Path Sum',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'int', minRows: 1, maxRows: 8, minCols: 1, maxCols: 8, min: 0, max: 9 },
    statement:
      'Given an `m x n` grid of non-negative integers, find a path from the top-left corner to the bottom-right corner that minimizes the sum of the numbers along the path.\n\nYou may only move either **down** or **right** at any point in time. Return the minimum possible path sum.',
    constraints: '- `1 <= rows, cols <= 200`\n- `0 <= grid[i][j] <= 100`',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated integers each.',
    outputFormat: 'A single integer: the minimum path sum from top-left to bottom-right.',
    hints: [
      'The cheapest way to reach any cell only depends on the cheapest way to reach the cell above it and the cell to its left.',
      'Turn the grid itself into a DP table: replace each cell with the minimum cost to reach it so far, working row by row, left to right.',
      'The first row can only be reached by moving right, and the first column only by moving down — handle those two edges before the general case.',
    ],
    solutionApproach:
      'Do the DP in place on (a copy of) the grid: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`, taking whichever neighbor is cheaper. The first row only has a "come from the left" neighbor and the first column only has a "come from above" neighbor, so seed those by simple prefix sums first. The final answer is `dp[rows-1][cols-1]`. O(rows*cols) time, O(1) extra space if done truly in place.',
    pythonSolutionCode:
      'def min_path_sum(grid):\n    rows, cols = len(grid), len(grid[0])\n    dp = [row[:] for row in grid]\n    for i in range(rows):\n        for j in range(cols):\n            if i == 0 and j == 0:\n                continue\n            elif i == 0:\n                dp[i][j] += dp[i][j - 1]\n            elif j == 0:\n                dp[i][j] += dp[i - 1][j]\n            else:\n                dp[i][j] += min(dp[i - 1][j], dp[i][j - 1])\n    return dp[-1][-1]\n',
    solve: (grid) => {
      const rows = grid.length;
      const cols = grid[0].length;
      const dp = grid.map((row) => row.slice());
      for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
          if (i === 0 && j === 0) continue;
          else if (i === 0) dp[i][j] += dp[i][j - 1];
          else if (j === 0) dp[i][j] += dp[i - 1][j];
          else dp[i][j] += Math.min(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      return dp[rows - 1][cols - 1];
    },
    exampleExplanation: (args, result) => `The cheapest right/down route through the grid accumulates a total of ${result}.`,
    edgeCases: [
      { args: [[[5]]], kind: 'edge' },
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1, 2, 3]]], kind: 'edge' },
      { args: [[[1], [2], [3]]], kind: 'edge' },
      { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], kind: 'edge' },
      { args: [[[9, 9], [9, 9]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Word Break',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', minDict: 2, maxDict: 6, maxParts: 4, minStrLen: 1, maxStrLen: 10 },
    genArgs: (rng, cfg) => {
      const bank = cfg.bank || WORD_BREAK_BANK;
      const dictSize = randInt(rng, cfg.minDict ?? 2, cfg.maxDict ?? 6);
      const dict = sample(rng, bank, Math.min(dictSize, bank.length));
      let s;
      if (rng() < 0.6) {
        const parts = randInt(rng, 1, cfg.maxParts ?? 4);
        s = Array.from({ length: parts }, () => dict[randInt(rng, 0, dict.length - 1)]).join('');
      } else {
        s = randString(rng, randInt(rng, cfg.minStrLen ?? 1, cfg.maxStrLen ?? 10), 'abcdefg');
      }
      return [s, dict.join(' ')];
    },
    statement:
      'Given a string `s` and a dictionary of words `wordDict`, determine whether `s` can be segmented into a sequence of one or more dictionary words, separated by nothing (concatenated back-to-back). The same dictionary word may be reused as many times as needed.',
    constraints: '- `1 <= s.length <= 300`\n- `1 <= wordDict.length <= 1000`\n- All strings consist of lowercase English letters, and `wordDict` contains no duplicates.',
    inputFormat: 'Line 1: the string `s`. Line 2: the dictionary words, space-separated.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Think of it as reachability: can you "walk" from the start of the string to the end, where each step must land you exactly at the end of some dictionary word?',
      'Define `canBreak(i)` as "is the prefix `s[0..i)` fully breakable into dictionary words?" — `canBreak(0)` is trivially true (empty prefix).',
      '`canBreak(i)` is true if there is some earlier breakable point `j < i` such that `s[j..i)` is itself a dictionary word. Compute this left to right and cache the results.',
    ],
    solutionApproach:
      'Classic 1D DP. Let `dp[i]` mean "the prefix of length `i` can be fully segmented". `dp[0] = true`. For each `i` from `1` to `n`, scan back over the last `maxWordLen` positions and set `dp[i] = true` if some `dp[j]` is true and `s[j:i]` is in the dictionary (a hash set gives O(1) membership checks). The answer is `dp[n]`. O(n * maxWordLen) time with a hash set, O(n) space.',
    pythonSolutionCode:
      'def word_break(s, dict_line):\n    words = dict_line.split()\n    word_set = set(words)\n    max_len = max((len(w) for w in words), default=0)\n    n = len(s)\n    dp = [False] * (n + 1)\n    dp[0] = True\n    for i in range(1, n + 1):\n        for j in range(max(0, i - max_len), i):\n            if dp[j] and s[j:i] in word_set:\n                dp[i] = True\n                break\n    return dp[n]\n',
    solve: wordBreakSolve,
    exampleExplanation: (args, result) =>
      result ? `"${args[0]}" can be split into words from the dictionary.` : `"${args[0]}" cannot be fully segmented using only the given dictionary words.`,
    edgeCases: [
      { args: ['leetcode', 'leet code'], kind: 'edge' },
      { args: ['applepenapple', 'apple pen'], kind: 'edge' },
      { args: ['catsandog', 'cats dog sand and cat'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['aaaaaaa', 'aaaa aaa'], kind: 'edge' },
      { args: ['abcd', 'a abc b cd'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Word Break II',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'stringArray', minDict: 2, maxDict: 5, maxParts: 3, minStrLen: 1, maxStrLen: 8 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const bank = cfg.bank || WORD_BREAK_II_BANK;
      const dictSize = randInt(rng, cfg.minDict ?? 2, cfg.maxDict ?? 5);
      const dict = sample(rng, bank, Math.min(dictSize, bank.length));
      let s;
      if (rng() < 0.7) {
        const parts = randInt(rng, 1, cfg.maxParts ?? 3);
        s = Array.from({ length: parts }, () => dict[randInt(rng, 0, dict.length - 1)]).join('');
      } else {
        s = randString(rng, randInt(rng, cfg.minStrLen ?? 1, cfg.maxStrLen ?? 8), 'abc');
      }
      return [[s, ...dict]];
    },
    statement:
      'Given a string `s` and a dictionary of words `wordDict` (with no duplicates), return **every** way `s` can be segmented into a space-separated sequence of dictionary words. Dictionary words may be reused any number of times. If there is no valid way to segment `s`, return an empty list.\n\nThe input is given as a single list: the first entry is `s`, and every entry after it is one dictionary word. Sentences may be printed in any order (one per line, words separated by single spaces).',
    constraints: '- `1 <= s.length <= 20`\n- `1 <= wordDict.length <= 10`\n- All strings consist of lowercase English letters, and `wordDict` contains no duplicates.\n- The set of correct sentences is graded regardless of line order.',
    inputFormat: 'Line 1: count `N` (1 + number of dictionary words). Next `N` lines: `s`, then each dictionary word, one per line.',
    outputFormat: 'One valid sentence per line (words separated by single spaces); empty output if no segmentation exists. Order of lines does not matter.',
    hints: [
      'This is Word Break, but instead of a single true/false you need to reconstruct every valid split — so track, from each position, all the sentences that can be built from there to the end.',
      'Recurse from the end backwards (or build forward with memoization): `sentencesFrom(i)` is the list of ways to finish the string starting at index `i`, built by trying every dictionary word that matches `s[i..)`.',
      'Memoize `sentencesFrom(i)` by index so overlapping subproblems (the same suffix reached via different splits) are computed only once — this keeps the algorithm from blowing up in cases with a lot of overlap.',
    ],
    solutionApproach:
      'Use backtracking with memoization keyed on the starting index. `sentencesFrom(i)` returns the list of complete suffix-sentences reachable from index `i`: if `i` is the end of the string it returns `[""]` (one empty completion); otherwise, for every `j > i` where `s[i:j]` is a dictionary word, recursively compute `sentencesFrom(j)` and prepend `s[i:j]` (with a space) to each result. Cache each index\'s result the first time it is computed. The answer is `sentencesFrom(0)`. Runtime is bounded by the number of valid segmentations produced, which is exponential in the worst case (as it is for the real problem) but stays small for reasonably-sized inputs thanks to memoization avoiding repeated work.',
    pythonSolutionCode:
      'def word_break_ii(strs):\n    s = strs[0]\n    word_set = set(strs[1:])\n    n = len(s)\n    memo = {}\n\n    def sentences_from(i):\n        if i == n:\n            return [""]\n        if i in memo:\n            return memo[i]\n        results = []\n        for j in range(i + 1, n + 1):\n            word = s[i:j]\n            if word in word_set:\n                for rest in sentences_from(j):\n                    results.append(word if rest == "" else word + " " + rest)\n        memo[i] = results\n        return results\n\n    return sentences_from(0)\n',
    solve: (strs) => {
      const s = strs[0];
      const wordSet = new Set(strs.slice(1));
      const n = s.length;
      const memo = new Map();
      const sentencesFrom = (i) => {
        if (i === n) return [''];
        if (memo.has(i)) return memo.get(i);
        const results = [];
        for (let j = i + 1; j <= n; j += 1) {
          const word = s.slice(i, j);
          if (wordSet.has(word)) {
            for (const rest of sentencesFrom(j)) {
              results.push(rest === '' ? word : `${word} ${rest}`);
            }
          }
        }
        memo.set(i, results);
        return results;
      };
      return sentencesFrom(0);
    },
    exampleExplanation: (args, result) =>
      result.length ? `${result.length} valid sentence(s) can be built from "${args[0][0]}".` : `"${args[0][0]}" cannot be segmented into dictionary words at all.`,
    edgeCases: [
      { args: [['cat', 'cat']], kind: 'edge' },
      { args: [['a', 'a']], kind: 'edge' },
      { args: [['ab', 'a', 'b']], kind: 'edge' },
      { args: [['catsanddog', 'cat', 'cats', 'and', 'sand', 'dog']], kind: 'edge' },
      { args: [['pineapplepenapple', 'apple', 'pen', 'applepen', 'pine', 'pineapple']], kind: 'edge' },
      { args: [['catsandog', 'cats', 'dog', 'sand', 'and', 'cat']], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Combination Sum IV',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 6, max: 20, minTarget: 1, maxTarget: 20 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 6);
      const pool = Array.from({ length: cfg.max ?? 20 }, (_, i) => i + 1);
      const nums = sample(rng, pool, Math.min(n, pool.length));
      const target = randInt(rng, cfg.minTarget ?? 1, cfg.maxTarget ?? 20);
      return [nums, target];
    },
    statement:
      'Given an array of **distinct** positive integers `nums` and a target integer `target`, return the number of possible combinations that add up to `target`.\n\nUnlike Combination Sum, order matters here: two combinations that use the same numbers in a different order count as different ways. A number from `nums` may be used any number of times.',
    constraints: '- `1 <= nums.length <= 200`\n- `1 <= nums[i] <= 1000`, all distinct\n- `1 <= target <= 1000`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the number of ordered combinations summing to `target`.',
    hints: [
      "Since order matters, this is not the same counting problem as regular Combination Sum — it behaves more like counting the ways to climb a staircase where each 'step size' is one of the numbers in `nums`.",
      'Define `ways(t)` as the number of ordered sequences of numbers from `nums` that sum exactly to `t`. Think about what the *last* number in such a sequence could be.',
      'For each way to reach a smaller total `t - num` (for every `num` in `nums`), appending `num` extends it into a way to reach `t` — sum those contributions for every choice of `num`.',
    ],
    solutionApproach:
      'Bottom-up DP over sums from `0` to `target`. `dp[0] = 1` (the empty combination reaches sum 0). For each `t` from `1` to `target`, `dp[t] = sum(dp[t - num] for num in nums if num <= t)` — because the last number used in any valid ordered combination summing to `t` could be any `num`, and whatever precedes it must sum to `t - num`. The final answer is `dp[target]`. O(target * nums.length) time, O(target) space.',
    pythonSolutionCode:
      'def combination_sum_4(nums, target):\n    dp = [0] * (target + 1)\n    dp[0] = 1\n    for t in range(1, target + 1):\n        for num in nums:\n            if num <= t:\n                dp[t] += dp[t - num]\n    return dp[target]\n',
    solve: (nums, target) => {
      const dp = new Array(target + 1).fill(0);
      dp[0] = 1;
      for (let t = 1; t <= target; t += 1) {
        for (const num of nums) {
          if (num <= t) dp[t] += dp[t - num];
        }
      }
      return dp[target];
    },
    exampleExplanation: (args, result) => `There are ${result} ordered way(s) to pick numbers from [${args[0].join(',')}] (reuse allowed) that sum to ${args[1]}.`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1], 5], kind: 'edge' },
      { args: [[1, 2, 3], 4], kind: 'edge' },
      { args: [[9], 3], kind: 'edge' },
      { args: [[2, 4], 1], kind: 'edge' },
      { args: [[4, 2, 1], 32], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Partition Equal Subset Sum',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 15, min: 1, max: 50 },
    statement:
      'Given a non-empty array of **positive** integers `nums`, determine whether the array can be partitioned into two subsets such that the sum of the elements in both subsets is equal.',
    constraints: '- `1 <= nums.length <= 200`\n- `1 <= nums[i] <= 100`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: '`true` or `false`.',
    hints: [
      'If the total sum is odd, it is immediately impossible to split it into two equal halves.',
      'If the total is even, the question becomes: "does some subset of `nums` sum to exactly half the total?" — that is the classic 0/1 knapsack "subset sum" question.',
      'Build a boolean DP over achievable sums up to `total / 2`, processing each number once and updating achievable sums from high to low so no number is reused twice.',
    ],
    solutionApproach:
      'Compute the total sum; if it is odd, immediately return false. Otherwise let `target = total / 2` and run a 0/1 knapsack subset-sum DP: `dp[j]` tracks whether sum `j` is achievable using a subset of the numbers processed so far, `dp[0] = true` initially. For each number, iterate `j` from `target` down to that number, setting `dp[j] = dp[j] || dp[j - num]` (iterating downward ensures each number is only used once). The answer is `dp[target]`. O(n * target) time, O(target) space.',
    pythonSolutionCode:
      'def can_partition(nums):\n    total = sum(nums)\n    if total % 2 != 0:\n        return False\n    target = total // 2\n    dp = [False] * (target + 1)\n    dp[0] = True\n    for num in nums:\n        for j in range(target, num - 1, -1):\n            if dp[j - num]:\n                dp[j] = True\n    return dp[target]\n',
    solve: (nums) => {
      const total = nums.reduce((a, b) => a + b, 0);
      if (total % 2 !== 0) return false;
      const target = total / 2;
      const dp = new Array(target + 1).fill(false);
      dp[0] = true;
      for (const num of nums) {
        for (let j = target; j >= num; j -= 1) {
          if (dp[j - num]) dp[j] = true;
        }
      }
      return dp[target];
    },
    exampleExplanation: (args, result) =>
      result ? `[${args[0].join(',')}] can be split into two subsets with equal sums.` : `[${args[0].join(',')}] cannot be split into two equal-sum subsets.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1, 5, 11, 5]], kind: 'edge' },
      { args: [[1, 2, 3, 5]], kind: 'edge' },
      { args: [[2, 2, 2, 2]], kind: 'edge' },
      { args: [[100]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Target Sum',
    shape: 'int_array_and_target_to_pair',
    shapeConfig: { outputType: 'int', minN: 1, maxCount: 12, min: 0, max: 15 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxCount ?? 12);
      const nums = randIntArray(rng, n, cfg.min ?? 0, cfg.max ?? 15);
      const sum = nums.reduce((a, b) => a + b, 0);
      const target = randInt(rng, -sum, sum);
      return [nums, target];
    },
    statement:
      'You are given an integer array `nums` and an integer `target`. You want to build an expression by adding a `+` or a `-` sign in front of each number in `nums`, then concatenating all the numbers.\n\nFor example, for `nums = [2, 1]`, you can build the expressions `"+2+1"`, `"+2-1"`, `"-2+1"`, or `"-2-1"`. Return the number of different sign assignments that make the resulting expression evaluate to `target`.',
    constraints: '- `1 <= nums.length <= 20`\n- `0 <= nums[i] <= 1000`\n- `0 <= sum(nums) <= 1000`\n- `-sum(nums) <= target <= sum(nums)`',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `target`.',
    outputFormat: 'A single integer: the number of sign assignments that reach `target`.',
    hints: [
      'Split `nums` conceptually into a "positive" group `P` (numbers assigned `+`) and a "negative" group `N` (numbers assigned `-`). Then `sum(P) - sum(N) = target` and `sum(P) + sum(N) = total`.',
      'Adding those two equations gives `sum(P) = (total + target) / 2` — so the problem reduces to counting subsets of `nums` whose sum equals that fixed value.',
      'If `(total + target)` is odd, or its half is negative or larger than the total, no assignment works — otherwise it is exactly the subset-sum **counting** DP (not just yes/no).',
    ],
    solutionApproach:
      'Let `total` be the sum of all numbers. From `sum(P) - sum(N) = target` and `sum(P) + sum(N) = total`, we get `sum(P) = (total + target) / 2`. If this is not a non-negative integer no bounded by `total`, the answer is `0`. Otherwise, count the number of subsets of `nums` summing exactly to `s = (total + target) / 2` using a counting knapsack DP: `dp[0] = 1`, and for each number, update `dp[j] += dp[j - num]` for `j` from `s` down to `num` (this also correctly handles zeros in `nums`, each of which doubles the count since it can freely take either sign). The answer is `dp[s]`. O(n * total) time, O(total) space.',
    pythonSolutionCode:
      'def find_target_sum_ways(nums, target):\n    total = sum(nums)\n    if abs(target) > total or (total + target) % 2 != 0:\n        return 0\n    s = (total + target) // 2\n    dp = [0] * (s + 1)\n    dp[0] = 1\n    for num in nums:\n        for j in range(s, num - 1, -1):\n            dp[j] += dp[j - num]\n    return dp[s]\n',
    solve: (nums, target) => {
      const total = nums.reduce((a, b) => a + b, 0);
      if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
      const s = (total + target) / 2;
      const dp = new Array(s + 1).fill(0);
      dp[0] = 1;
      for (const num of nums) {
        for (let j = s; j >= num; j -= 1) {
          dp[j] += dp[j - num];
        }
      }
      return dp[s];
    },
    exampleExplanation: (args, result) => `Exactly ${result} way(s) of assigning +/- signs to [${args[0].join(',')}] evaluate to ${args[1]}.`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 1, 1, 1, 1], 3], kind: 'edge' },
      { args: [[0, 0, 0, 0, 0, 1], 1], kind: 'edge' },
      { args: [[1, 2], 10], kind: 'edge' },
      { args: [[100], 100], kind: 'edge' },
      { args: [[1, 1], 0], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Palindromic Substrings',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, alphabet: 'aabbc' },
    statement:
      'Given a string `s`, return the number of palindromic substrings it contains.\n\nA substring is a contiguous, non-empty sequence of characters, and different substrings are counted separately even if they consist of the same characters (i.e. substrings are distinguished by their position, not just their content).',
    constraints: '- `1 <= s.length <= 1000`\n- `s` consists of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'A single integer: the total count of palindromic substrings.',
    hints: [
      'Every single character is trivially a palindrome of length 1 — those alone already contribute `n` to the answer.',
      "Instead of checking every substring for being a palindrome (O(n^2) substrings, each O(n) to check), try growing outward from a center: a palindrome is determined entirely by its center point(s).",
      'There are `2n - 1` possible centers (one per character for odd-length palindromes, one between each pair of adjacent characters for even-length ones) — expand outward from each while the characters match, counting one palindrome per successful expansion step.',
    ],
    solutionApproach:
      'Use the expand-around-center technique: for every possible center (each index, for odd-length palindromes, and each gap between two indices, for even-length ones), expand outward symmetrically while the two sides keep matching, incrementing a counter on every successful expansion. Since there are `2n - 1` centers and each expansion takes O(n) in the worst case, this runs in O(n^2) time and O(1) extra space — much better than the naive O(n^3) "check every substring" approach.',
    pythonSolutionCode:
      'def count_substrings(s):\n    n = len(s)\n    count = 0\n\n    def expand(l, r):\n        nonlocal count\n        while l >= 0 and r < n and s[l] == s[r]:\n            count += 1\n            l -= 1\n            r += 1\n\n    for i in range(n):\n        expand(i, i)\n        expand(i, i + 1)\n    return count\n',
    solve: (s) => {
      const n = s.length;
      let count = 0;
      const expand = (l, r) => {
        while (l >= 0 && r < n && s[l] === s[r]) {
          count += 1;
          l -= 1;
          r += 1;
        }
      };
      for (let i = 0; i < n; i += 1) {
        expand(i, i);
        expand(i, i + 1);
      }
      return count;
    },
    exampleExplanation: (args, result) => `"${args[0]}" contains ${result} palindromic substring(s), counting overlapping and repeated ones separately.`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['aa'], kind: 'edge' },
      { args: ['aaa'], kind: 'edge' },
      { args: ['abc'], kind: 'edge' },
      { args: ['aba'], kind: 'edge' },
      { args: ['abcba'], kind: 'edge' },
    ],
  },
];
