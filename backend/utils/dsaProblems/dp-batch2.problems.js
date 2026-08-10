import { randInt, randIntArray } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'House Robber',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 400 },
    statement:
      "You are a professional robber planning to rob houses along a street. Each house's stash is given by an integer array `nums`, where `nums[i]` is the amount of money in house `i`. Every house is wired to the security system of its immediate neighbors, so robbing two adjacent houses on the same night trips the alarm. Return the maximum amount of money you can rob without ever robbing two adjacent houses.",
    constraints: '- `1 <= nums.length <= 100`\n- `0 <= nums[i] <= 400`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the maximum amount that can be robbed.',
    hints: [
      'Checking every subset of non-adjacent houses is exponential — think about the decision you make one house at a time, left to right.',
      'At house `i` you have exactly two choices: skip it (carry forward the best total through house `i-1`), or rob it (its value plus the best total through house `i-2`).',
      'Since each step only needs the previous two results, you can collapse the whole DP into two rolling variables instead of an array.',
    ],
    solutionApproach:
      'Let `dp[i]` be the best amount obtainable using only the first `i` houses. Then `dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])` — either skip house `i` or rob it and add the best solution from two houses back (since house `i-1` is now off-limits). Because the recurrence only reaches back two steps, it collapses to two rolling variables, giving O(n) time and O(1) space.',
    pythonSolutionCode:
      'def rob(nums):\n    prev, curr = 0, 0\n    for n in nums:\n        prev, curr = curr, max(curr, prev + n)\n    return curr\n',
    solve: (nums) => {
      let prev = 0;
      let curr = 0;
      for (const n of nums) {
        const next = Math.max(curr, prev + n);
        prev = curr;
        curr = next;
      }
      return curr;
    },
    exampleExplanation: (args, result) =>
      `The best non-adjacent selection of houses from [${args[0].join(',')}] totals ${result}.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[2, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 1]], kind: 'edge' },
      { args: [[2, 7, 9, 3, 1]], kind: 'edge' },
      { args: [[0, 0, 0, 0]], kind: 'edge' },
      { args: [[5, 5, 10, 100, 10, 5]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'House Robber II',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 400 },
    statement:
      "This is the circular-street variant of House Robber: the houses in `nums` are arranged in a circle, so house `0` and the last house are now adjacent to each other as well as to their other neighbor. Return the maximum amount of money you can rob without ever robbing two adjacent houses, keeping in mind that house `0` and house `n-1` count as adjacent.",
    constraints: '- `1 <= nums.length <= 100`\n- `0 <= nums[i] <= 400`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the maximum amount that can be robbed.',
    hints: [
      'The circle adds exactly one new restriction versus the original problem: house 0 and the last house cannot both be robbed.',
      'That means any optimal plan either never robs house 0, or never robs the last house — split the problem into those two linear cases.',
      'Run the classic (non-circular) House Robber DP once on `nums` with the last house removed, and once with the first house removed, then take the better of the two results. Handle a single house as its own base case.',
    ],
    solutionApproach:
      "Because the street wraps around, houses 0 and n-1 are adjacent, so no valid plan can include both. Run the standard linear House Robber DP on `nums[0..n-2]` (excluding the last house) and again on `nums[1..n-1]` (excluding the first house), and return the larger of the two answers. A single-house input is handled directly since removing either end would leave nothing to rob. O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def rob_line(nums):\n    prev, curr = 0, 0\n    for n in nums:\n        prev, curr = curr, max(curr, prev + n)\n    return curr\n\n\ndef rob(nums):\n    if len(nums) == 1:\n        return nums[0]\n    return max(rob_line(nums[:-1]), rob_line(nums[1:]))\n',
    solve: (nums) => {
      const robLine = (arr) => {
        let prev = 0;
        let curr = 0;
        for (const n of arr) {
          const next = Math.max(curr, prev + n);
          prev = curr;
          curr = next;
        }
        return curr;
      };
      if (nums.length === 1) return nums[0];
      return Math.max(robLine(nums.slice(0, -1)), robLine(nums.slice(1)));
    },
    exampleExplanation: (args, result) =>
      `Because house 0 and house ${args[0].length - 1} are adjacent on this circular street, the best achievable total from [${args[0].join(',')}] is ${result}.`,
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[1, 2, 3, 1]], kind: 'edge' },
      { args: [[200, 3, 140, 20, 10]], kind: 'edge' },
      { args: [[0, 0, 0, 0]], kind: 'edge' },
      { args: [[5, 5]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'House Robber III',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'int', maxNodes: 12, maxDepth: 4, min: 0, max: 100 },
    statement:
      "In this neighborhood the houses form a binary tree instead of a line or a circle: a house's only neighbors are its direct children in the tree (there is never a direct connection between siblings or between a house and its grandchildren). Given the `root` of the tree, where each node's value is the money stored in that house, return the maximum amount of money you can rob such that no two directly-connected houses (a node and its parent, or a node and either of its children) are both robbed.",
    constraints: '- The number of nodes is in the range `[0, 10^4]`.\n- `0 <= Node.val <= 10^4`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children, e.g. `3 2 3 null 3 null 1`.',
    outputFormat: 'A single integer: the maximum amount that can be robbed.',
    hints: [
      'For every node you actually need two different answers depending on context: the best total if this node IS robbed, and the best total if it is NOT.',
      "If a node is robbed, neither of its children may be robbed — so add each child's 'not robbed' value, not its overall best.",
      "If a node is left unrobbed, each child is free to be robbed or not, so add whichever of the child's two values is larger.",
    ],
    solutionApproach:
      "Do a post-order DFS that returns a pair `(withNode, withoutNode)` for every subtree. `withNode = node.val + withoutNode(left) + withoutNode(right)`, since robbing this node forbids robbing either child. `withoutNode = max(withNode(left), withoutNode(left)) + max(withNode(right), withoutNode(right))`, since skipping this node leaves each child free to be robbed or not. The final answer is the larger of the two values returned at the root. O(n) time, O(h) recursion stack.",
    pythonSolutionCode:
      'def rob(root):\n    def dfs(node):\n        if not node:\n            return (0, 0)\n        left_with, left_without = dfs(node.left)\n        right_with, right_without = dfs(node.right)\n        with_node = node.val + left_without + right_without\n        without_node = max(left_with, left_without) + max(right_with, right_without)\n        return (with_node, without_node)\n\n    return max(dfs(root))\n',
    solve: function solve(root) {
      function dfs(node) {
        if (!node) return [0, 0];
        const [lw, lwo] = dfs(node.left);
        const [rw, rwo] = dfs(node.right);
        const withNode = node.val + lwo + rwo;
        const withoutNode = Math.max(lw, lwo) + Math.max(rw, rwo);
        return [withNode, withoutNode];
      }
      const [w, wo] = dfs(root);
      return Math.max(w, wo);
    },
    exampleExplanation: () =>
      'Robbing a maximal set of houses with no node robbed alongside its parent or child yields the shown total.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[3, 2, 3, null, 3, null, 1]], kind: 'edge' },
      { args: [[3, 4, 5, 1, 3, null, 1]], kind: 'edge' },
      { args: [[2, 1, 3, null, 4]], kind: 'edge' },
      { args: [[4, 1, null, 2, null, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Coin Change',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 5, min: 1, max: 25, amountMax: 250 },
    genArgs: (rng, cfg) => {
      const n = Math.min(randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 5), 10);
      const coins = randIntArray(rng, n, cfg.min ?? 1, cfg.max ?? 25);
      const amount = randInt(rng, 0, cfg.amountMax ?? 250);
      return [coins, amount];
    },
    statement:
      'You are given an array `coins` representing coin denominations (each denomination has an unlimited supply) and an integer `amount` representing a target sum of money. Return the fewest number of coins needed to make up exactly `amount`. If no combination of the given coins can make that amount exactly, return `-1`.',
    constraints: '- `1 <= coins.length <= 12`\n- `1 <= coins[i] <= 2^31 - 1`\n- `0 <= amount <= 10^4`',
    inputFormat: 'Line 1: the array `coins`, space-separated. Line 2: the integer `amount`.',
    outputFormat: 'A single integer: the minimum number of coins needed, or `-1` if `amount` cannot be formed exactly.',
    hints: [
      'This is unbounded-knapsack territory — each coin denomination may be reused as many times as you like, so this is not a simple greedy "always take the biggest coin" problem.',
      'Build a table `dp[a]` = fewest coins needed to make exactly amount `a`, with the base case `dp[0] = 0`.',
      'For every amount `a` from 1 up to the target, try every coin `c <= a` and consider `1 + dp[a - c]`; amounts that never become reachable should be treated as infinity, and finally reported as `-1`.',
    ],
    solutionApproach:
      "Bottom-up DP over every amount from 0 to the target. `dp[0] = 0`, and for each amount `a`, `dp[a] = min over coins c<=a of (1 + dp[a-c])`, skipping any `c` whose `dp[a-c]` was never reached. The answer is `dp[amount]` if it was reached, otherwise `-1`. O(amount * coins.length) time, O(amount) space.",
    pythonSolutionCode:
      'def coin_change(coins, amount):\n    INF = float("inf")\n    dp = [0] + [INF] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a and dp[a - c] + 1 < dp[a]:\n                dp[a] = dp[a - c] + 1\n    return dp[amount] if dp[amount] != INF else -1\n',
    solve: (coins, amount) => {
      const dp = new Array(amount + 1).fill(Infinity);
      dp[0] = 0;
      for (let a = 1; a <= amount; a += 1) {
        for (const c of coins) {
          if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
        }
      }
      return Number.isFinite(dp[amount]) ? dp[amount] : -1;
    },
    exampleExplanation: (args, result) =>
      result === -1
        ? `No combination of [${args[0].join(',')}] sums to exactly ${args[1]}.`
        : `${result} coin(s) from [${args[0].join(',')}] combine to make exactly ${args[1]}.`,
    edgeCases: [
      { args: [[1], 0], kind: 'edge' },
      { args: [[2], 3], kind: 'edge' },
      { args: [[1, 2, 5], 11], kind: 'edge' },
      { args: [[1], 2], kind: 'edge' },
      { args: [[186, 419, 83, 408], 6249], kind: 'edge' },
      { args: [[3, 7, 405, 436], 8839], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Coin Change II',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 5, min: 1, max: 15, amountMax: 60 },
    genArgs: (rng, cfg) => {
      const n = Math.min(randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 5), 6);
      const coins = randIntArray(rng, n, cfg.min ?? 1, cfg.max ?? 15);
      const amount = randInt(rng, 0, cfg.amountMax ?? 60);
      return [coins, amount];
    },
    statement:
      'You are given an integer `amount` and an array `coins` of coin denominations, each available in unlimited supply. Return the number of distinct combinations of coins that add up exactly to `amount`. Combinations are order-independent — using one coin of value 1 then one of value 2 is the same combination as one of value 2 then one of value 1, and should only be counted once. Return `0` if `amount` cannot be made up by any combination.',
    constraints:
      '- `1 <= coins.length <= 12`\n- `1 <= coins[i] <= 1000`\n- `0 <= amount <= 5000`\n- Each coin denomination has unlimited supply.',
    inputFormat: 'Line 1: the array `coins`, space-separated. Line 2: the integer `amount`.',
    outputFormat: 'A single integer: the number of distinct combinations that sum to `amount` (order does not matter).',
    hints: [
      'If order mattered, this would collapse to a simple 1-D "count sequences" DP — since it does not, the order in which you loop over coins versus amounts matters a great deal.',
      'Fully process one coin denomination (across all amounts) before moving on to the next, so every combination only ever gets built in one fixed coin order.',
      "That gives the classic unbounded-knapsack 'count ways' update: `dp[a] += dp[a - coin]`, with coins as the outer loop and amounts as the inner loop.",
    ],
    solutionApproach:
      'Use a 1-D array `dp` of size `amount + 1` with `dp[0] = 1` (one way to make amount 0: use nothing). Iterate coins in the OUTER loop and amounts in the INNER loop, updating `dp[a] += dp[a - coin]` for `a` from `coin` up to `amount`. Looping coins outermost guarantees each combination is only ever counted once, in one canonical coin order, rather than once per permutation of the same coins. O(amount * coins.length) time, O(amount) space.',
    pythonSolutionCode:
      'def change(coins, amount):\n    dp = [0] * (amount + 1)\n    dp[0] = 1\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] += dp[a - c]\n    return dp[amount]\n',
    solve: (coins, amount) => {
      const dp = new Array(amount + 1).fill(0);
      dp[0] = 1;
      for (const c of coins) {
        for (let a = c; a <= amount; a += 1) dp[a] += dp[a - c];
      }
      return dp[amount];
    },
    exampleExplanation: (args, result) =>
      `There are ${result} way(s) to combine coins from [${args[0].join(',')}] to total exactly ${args[1]}.`,
    edgeCases: [
      { args: [[1, 2, 5], 5], kind: 'edge' },
      { args: [[2], 3], kind: 'edge' },
      { args: [[1], 0], kind: 'edge' },
      { args: [[10], 10], kind: 'edge' },
      { args: [[1, 2, 3], 4], kind: 'edge' },
      { args: [[5], 3], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Increasing Subsequence',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: -100, max: 100 },
    statement:
      'Given an integer array `nums`, return the length of the longest strictly increasing subsequence. A subsequence keeps the original relative order of the chosen elements but need not be contiguous, and "strictly increasing" means each chosen element must be larger than the one chosen before it.',
    constraints: '- `1 <= nums.length <= 2500`\n- `-10^4 <= nums[i] <= 10^4`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'A single integer: the length of the longest strictly increasing subsequence.',
    hints: [
      'A straightforward O(n^2) DP — where `dp[i]` is the LIS length ending exactly at index `i` — works, but there is a much faster O(n log n) approach worth knowing.',
      'Maintain an array `tails` where `tails[k]` is the smallest possible ending value among all increasing subsequences of length `k+1` found so far.',
      'For each new number, binary-search `tails` for the leftmost entry that is `>=` it and overwrite that slot (or append if the number is larger than every entry); the final length of `tails` is the answer.',
    ],
    solutionApproach:
      "Maintain a `tails` array: `tails[k]` holds the smallest ending value among all increasing subsequences of length `k+1` discovered so far. For each number, binary search `tails` for the leftmost position whose value is `>=` the number and overwrite it there (or append if the number exceeds every current entry). `tails` never shrinks, and its final length equals the LIS length — even though `tails` itself is not always an actual subsequence of the input. O(n log n) time, O(n) space.",
    pythonSolutionCode:
      'import bisect\n\n\ndef length_of_lis(nums):\n    tails = []\n    for n in nums:\n        i = bisect.bisect_left(tails, n)\n        if i == len(tails):\n            tails.append(n)\n        else:\n            tails[i] = n\n    return len(tails)\n',
    solve: (nums) => {
      const tails = [];
      for (const num of nums) {
        let lo = 0;
        let hi = tails.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (tails[mid] < num) lo = mid + 1;
          else hi = mid;
        }
        tails[lo] = num;
      }
      return tails.length;
    },
    exampleExplanation: (args, result) =>
      `The longest strictly increasing subsequence of [${args[0].join(',')}] has length ${result}.`,
    edgeCases: [
      { args: [[7]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[10, 9, 2, 5, 3, 7, 101, 18]], kind: 'edge' },
      { args: [[7, 7, 7, 7, 7]], kind: 'edge' },
      { args: [[0, 1, 0, 3, 2, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Common Subsequence',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 12, alphabet: 'abcde' },
    statement:
      'Given two strings `a` and `b`, return the length of their longest common subsequence — the longest sequence of characters that appears, in order but not necessarily contiguously, in both strings. If the two strings share no characters in a common relative order, return `0`.',
    constraints: '- `1 <= a.length, b.length <= 1000`\n- Both strings consist of lowercase English letters.',
    inputFormat: 'Line 1: string `a`. Line 2: string `b`.',
    outputFormat: 'A single integer: the length of the longest common subsequence.',
    hints: [
      'Compare the last characters of the two strings first: either they match and can be "consumed" together, or at least one of them is not part of the optimal common subsequence.',
      'Define `dp[i][j]` as the LCS length between the first `i` characters of `a` and the first `j` characters of `b`, and write the recurrence for both of the cases above.',
      "If `a[i-1] == b[j-1]`, then `dp[i][j] = dp[i-1][j-1] + 1`; otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.",
    ],
    solutionApproach:
      'Classic 2-D DP: `dp[i][j]` is the LCS length between `a[0..i)` and `b[0..j)`. When the current characters match, extend the diagonal LCS by 1. Otherwise, take the best result from dropping the last character of either string. The first row and column are 0, since an empty string shares no subsequence with anything. O(n*m) time and space.',
    pythonSolutionCode:
      'def longest_common_subsequence(a, b):\n    n, m = len(a), len(b)\n    dp = [[0] * (m + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for j in range(1, m + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[n][m]\n',
    solve: (a, b) => {
      const n = a.length;
      const m = b.length;
      const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = 1; i <= n; i += 1) {
        for (let j = 1; j <= m; j += 1) {
          if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
          else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      return dp[n][m];
    },
    exampleExplanation: (args, result) => `The longest common subsequence of "${args[0]}" and "${args[1]}" has length ${result}.`,
    edgeCases: [
      { args: ['abcde', 'ace'], kind: 'edge' },
      { args: ['abc', 'abc'], kind: 'edge' },
      { args: ['abc', 'def'], kind: 'edge' },
      { args: ['', 'abc'], kind: 'edge' },
      { args: ['aaaa', 'aa'], kind: 'edge' },
      { args: ['bsbininm', 'jmjkbkjkv'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Edit Distance',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 12, alphabet: 'abcde' },
    statement:
      'Given two strings `word1` and `word2`, return the minimum number of single-character edits required to transform `word1` into `word2`. In one edit you may insert a character, delete a character, or replace one character with another.',
    constraints: '- `0 <= word1.length, word2.length <= 500`\n- Both strings consist of lowercase English letters.',
    inputFormat: 'Line 1: string `word1`. Line 2: string `word2`.',
    outputFormat: 'A single integer: the minimum edit distance between `word1` and `word2`.',
    hints: [
      'Compare the last characters of both strings: if they already match, no edit is spent there and you can recurse on the two shorter prefixes.',
      "If they don't match, you must spend exactly one edit — try all three operations (insert, delete, replace) and keep whichever leaves the cheapest remaining subproblem.",
      'Build a 2-D table `dp[i][j]` = edit distance between the first `i` characters of `word1` and the first `j` characters of `word2`; the borders (`i=0` or `j=0`) equal the length of the other prefix, since that many pure insertions or deletions are needed.',
    ],
    solutionApproach:
      "Classic Levenshtein DP: `dp[i][j]` is the edit distance between `word1[0..i)` and `word2[0..j)`. `dp[i][0] = i` and `dp[0][j] = j` (converting to/from an empty string is pure insertion/deletion). When the current characters match, `dp[i][j] = dp[i-1][j-1]` (free). Otherwise `dp[i][j] = 1 + min(dp[i-1][j-1]` (replace), `dp[i-1][j]` (delete from word1), `dp[i][j-1]` (insert into word1)`)`. O(n*m) time and space.",
    pythonSolutionCode:
      'def min_distance(word1, word2):\n    n, m = len(word1), len(word2)\n    dp = [[0] * (m + 1) for _ in range(n + 1)]\n    for i in range(n + 1):\n        dp[i][0] = i\n    for j in range(m + 1):\n        dp[0][j] = j\n    for i in range(1, n + 1):\n        for j in range(1, m + 1):\n            if word1[i - 1] == word2[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1]\n            else:\n                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])\n    return dp[n][m]\n',
    solve: (word1, word2) => {
      const n = word1.length;
      const m = word2.length;
      const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = 0; i <= n; i += 1) dp[i][0] = i;
      for (let j = 0; j <= m; j += 1) dp[0][j] = j;
      for (let i = 1; i <= n; i += 1) {
        for (let j = 1; j <= m; j += 1) {
          if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
          else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
      return dp[n][m];
    },
    exampleExplanation: (args, result) => `Transforming "${args[0]}" into "${args[1]}" takes a minimum of ${result} edit(s).`,
    edgeCases: [
      { args: ['horse', 'ros'], kind: 'edge' },
      { args: ['intention', 'execution'], kind: 'edge' },
      { args: ['', 'abc'], kind: 'edge' },
      { args: ['abc', ''], kind: 'edge' },
      { args: ['', ''], kind: 'edge' },
      { args: ['abc', 'abc'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Decode Ways',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 12, alphabet: '0123456789' },
    statement:
      'A message made only of uppercase English letters `A`-`Z` can be encoded into digits using the mapping `A -> "1"`, `B -> "2"`, ..., `Z -> "26"`. Given a string `s` of digit characters representing such an already-encoded message (with no separators between groups), return the number of distinct ways it can be decoded back into letters. A digit group that starts with `0` is never valid (e.g. `"06"` cannot be read as `F`), so some digit strings have zero valid decodings.',
    constraints: '- `1 <= s.length <= 100`\n- `s` consists only of digit characters `0`-`9`.',
    inputFormat: 'Line 1: the digit string `s`.',
    outputFormat: 'A single integer: the number of ways `s` can be decoded (`0` if there are none).',
    hints: [
      "At each position you're choosing whether the current digit stands alone as a letter, or pairs up with the previous digit to form a two-digit letter — and neither choice is always legal.",
      "A lone digit only decodes validly if it isn't `0`; a two-digit group only decodes validly if the number it forms is between 10 and 26 inclusive.",
      'Let `dp[i]` be the number of ways to decode the first `i` characters of `s`. `dp[i]` adds `dp[i-1]` when the single last digit is a valid letter, and separately adds `dp[i-2]` when the last two digits together form a valid letter.',
    ],
    solutionApproach:
      "Bottom-up DP where `dp[i]` counts the decodings of the first `i` characters, with `dp[0] = 1` (the empty prefix has exactly one, trivial, decoding). For each position `i`, add `dp[i-1]` if `s[i-1] != '0'` (the last digit is a valid standalone letter), and add `dp[i-2]` if the two-digit number formed by `s[i-2..i)` falls between 10 and 26 inclusive (a valid two-digit letter). The answer is `dp[n]`. O(n) time, and O(1) space if only the last two values are kept.",
    pythonSolutionCode:
      'def num_decodings(s):\n    n = len(s)\n    dp = [0] * (n + 1)\n    dp[0] = 1\n    dp[1] = 1 if s[0] != "0" else 0\n    for i in range(2, n + 1):\n        if s[i - 1] != "0":\n            dp[i] += dp[i - 1]\n        two = int(s[i - 2:i])\n        if 10 <= two <= 26:\n            dp[i] += dp[i - 2]\n    return dp[n]\n',
    solve: (s) => {
      const n = s.length;
      const dp = new Array(n + 1).fill(0);
      dp[0] = 1;
      dp[1] = s[0] !== '0' ? 1 : 0;
      for (let i = 2; i <= n; i += 1) {
        if (s[i - 1] !== '0') dp[i] += dp[i - 1];
        const two = Number(s.slice(i - 2, i));
        if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
      }
      return dp[n];
    },
    exampleExplanation: (args, result) => `The digit string "${args[0]}" can be decoded back into letters in ${result} distinct way(s).`,
    edgeCases: [
      { args: ['12'], kind: 'edge' },
      { args: ['226'], kind: 'edge' },
      { args: ['0'], kind: 'edge' },
      { args: ['06'], kind: 'edge' },
      { args: ['10'], kind: 'edge' },
      { args: ['2101'], kind: 'edge' },
    ],
  },
];
