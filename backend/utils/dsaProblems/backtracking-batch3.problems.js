import { randInt, randString, shuffle, formatByType, linesOf, tokInts, SHAPES } from '../dsaIOShapes.js';

/*
 * "Word Search" needs a board (2D grid of letters) *and* a target word as two
 * independent inputs, which no shape in the shared catalog provides (the closest,
 * `matrix_to_value_or_matrix`, only carries a single matrix). Per the guide's
 * "bespoke: you own everything" allowance — and following the precedent set in
 * `linkedlist-batch2.problems.js` for `ll_*` shapes — we register one small,
 * self-contained shape onto the shared registry (`SHAPES` is a plain exported
 * object, not frozen). It's namespaced `bt_board_and_word` so it can't collide
 * with the shared catalog or any other authoring batch's shapes. This is a
 * runtime side effect of importing this module only; it edits no file on disk,
 * and only matters at authoring/seed time (grading later reads pre-computed
 * stdin/expectedStdout from the DB and never calls getShape() again).
 */
SHAPES.bt_board_and_word = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const [rows] = tokInts(L[0]);
    const board = [];
    for (let r = 0; r < rows; r += 1) board.push(String(L[1 + r] ?? '').split(''));
    const word = L[1 + rows] ?? '';
    return [board, word];
  },
  encode: (board, word) => `${board.length} ${board[0]?.length || 0}\n${board.map((row) => row.join('')).join('\n')}\n${word}`,
  gen: (rng, cfg = {}) => {
    // Clamp defensively regardless of what stress-scaling does to maxRows/maxCols/maxWordLen
    // upstream (dsaProblemBuilder.js multiplies those keys by 6 for non-unordered_listing
    // shapes) -- a 4x4 letter board and a short word keep backtracking fast no matter what.
    const rows = randInt(rng, cfg.minRows ?? 2, Math.min(cfg.maxRows ?? 4, 6));
    const cols = randInt(rng, cfg.minCols ?? 2, Math.min(cfg.maxCols ?? 4, 6));
    const alphabet = cfg.alphabet || 'ABC';
    const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => alphabet[randInt(rng, 0, alphabet.length - 1)]));
    const maxWordLen = Math.min(cfg.maxWordLen ?? 4, rows * cols);
    const embedReal = rng() < 0.6;
    let word = null;
    if (embedReal) {
      const len = randInt(rng, 1, maxWordLen);
      word = extractPathWord(rng, board, len);
    }
    if (!word) word = randString(rng, randInt(rng, 1, maxWordLen), alphabet);
    return [board, word];
  },
  format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'bool'),
  pretty: (args) => `board = [${args[0].map((row) => `"${row.join('')}"`).join(', ')}], word = "${args[1]}"`,
  starter: (title) =>
    genericStarterFor(title, 'Line 1 is "rows cols"; next `rows` lines are the board rows (letters, no separators); the final line is the target word.'),
};

/** Local copy of dsaIOShapes.js's genericStarter (not exported there) — same shape, own name to avoid import churn. */
function genericStarterFor(title, formatNote) {
  const langs = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'csharp', 'ruby'];
  const out = {};
  for (const lang of langs) {
    const commentStyle = lang === 'python' || lang === 'ruby' ? '#' : lang === 'c' ? '/*' : '//';
    const line = commentStyle === '/*' ? `/* TODO: Implement ${title}. ${formatNote} */` : `${commentStyle} TODO: Implement ${title}. ${formatNote}`;
    out[lang] = `${line}\n`;
  }
  return out;
}

/** Walks a random simple path of `len` cells from a random start, returning the letters
 * along that path as a string -- guarantees the word genuinely exists on the board. */
function extractPathWord(rng, board, len) {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  if (!rows || !cols) return null;
  const startR = randInt(rng, 0, rows - 1);
  const startC = randInt(rng, 0, cols - 1);
  const visited = new Set();
  const path = [];
  const dfs = (r, c, remaining) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const key = `${r},${c}`;
    if (visited.has(key)) return false;
    visited.add(key);
    path.push(board[r][c]);
    if (remaining === 1) return true;
    const dirs = shuffle(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc, remaining - 1)) return true;
    }
    path.pop();
    visited.delete(key);
    return false;
  };
  return dfs(startR, startC, len) ? path.join('') : null;
}

function wordExists(board, word) {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  if (!word.length) return true;
  if (!rows || !cols) return false;
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const dfs = (r, c, idx) => {
    if (idx === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || board[r][c] !== word[idx]) return false;
    visited[r][c] = true;
    const found = dfs(r + 1, c, idx + 1) || dfs(r - 1, c, idx + 1) || dfs(r, c + 1, idx + 1) || dfs(r, c - 1, idx + 1);
    visited[r][c] = false;
    return found;
  };
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (board[r][c] === word[0] && dfs(r, c, 0)) return true;
    }
  }
  return false;
}

/* ---------------------------- Sudoku Solver generation helpers ---------------------------- */

function isSafe(grid, r, c, val) {
  for (let i = 0; i < 9; i += 1) {
    if (grid[r][i] === val) return false;
    if (grid[i][c] === val) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      if (grid[br + i][bc + j] === val) return false;
    }
  }
  return true;
}

/** Fills a full 9x9 grid with a valid random completed Sudoku via randomized backtracking. */
function fillSolvedGrid(rng) {
  const grid = Array.from({ length: 9 }, () => new Array(9).fill(0));
  const backtrack = (pos) => {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const candidates = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const v of candidates) {
      if (isSafe(grid, r, c, v)) {
        grid[r][c] = v;
        if (backtrack(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };
  backtrack(0);
  return grid;
}

/** Counts solutions of a partially-filled grid, stopping early once `limit` is reached. */
function countSolutions(grid, limit) {
  const g = grid.map((row) => row.slice());
  let count = 0;
  const backtrack = (pos) => {
    if (count >= limit || pos === 81) {
      if (pos === 81) count += 1;
      return;
    }
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (g[r][c] !== 0) {
      backtrack(pos + 1);
      return;
    }
    for (let v = 1; v <= 9 && count < limit; v += 1) {
      if (isSafe(g, r, c, v)) {
        g[r][c] = v;
        backtrack(pos + 1);
        g[r][c] = 0;
      }
    }
  };
  backtrack(0);
  return count;
}

/** Removes cells from a solved grid one at a time, keeping a removal only if the puzzle
 * remains uniquely solvable -- guarantees every generated puzzle has exactly one answer. */
function carvePuzzle(rng, solved, targetBlanks) {
  const puzzle = solved.map((row) => row.slice());
  const order = shuffle(rng, Array.from({ length: 81 }, (_, i) => i));
  let removed = 0;
  for (const idx of order) {
    if (removed >= targetBlanks) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    if (puzzle[r][c] === 0) continue;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle, 2) === 1) {
      removed += 1;
    } else {
      puzzle[r][c] = backup;
    }
  }
  return puzzle;
}

function solveSudoku(board) {
  const grid = board.map((row) => row.slice());
  const backtrack = (pos) => {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (grid[r][c] !== 0) return backtrack(pos + 1);
    for (let v = 1; v <= 9; v += 1) {
      if (isSafe(grid, r, c, v)) {
        grid[r][c] = v;
        if (backtrack(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };
  backtrack(0);
  return grid;
}

export default [
  {
    legacyProblemName: 'Letter Combinations of a Phone Number',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'string', leafKind: 'scalar', maxN: 4 },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const digits = '23456789';
      const n = randInt(rng, 0, cfg.maxN ?? 4);
      let s = '';
      for (let i = 0; i < n; i += 1) s += digits[randInt(rng, 0, digits.length - 1)];
      return [s];
    },
    statement:
      'Given a string `digits` containing digits from `2` to `9` inclusive (as on an old phone keypad), return all possible letter combinations that the number could represent, in any order.\n\nThe digit-to-letter mapping is the classic telephone keypad: `2`->"abc", `3`->"def", `4`->"ghi", `5`->"jkl", `6`->"mno", `7`->"pqrs", `8`->"tuv", `9`->"wxyz". If `digits` is empty, return no combinations at all.',
    constraints: '- `0 <= digits.length <= 4`\n- `digits[i]` is one of `2`-`9`.',
    inputFormat: 'Line 1: the string `digits` (may be an empty line).',
    outputFormat: 'One combination per line. No line at all if `digits` is empty. Order of lines does not matter.',
    hints: [
      "Each digit independently contributes one of 2-4 letters -- think of it as choosing one letter per digit, across all digits.",
      'Backtracking is natural here: build a partial combination one digit at a time, and once it covers every digit, record it.',
      'At each recursive step, look up the current digit\'s letters and branch once per letter, appending it to the in-progress string before recursing into the next digit.',
    ],
    solutionApproach:
      "Map each digit to its letters. Recurse with an index into `digits` and a partially-built string: at the base case (index equals `digits.length`), record the string; otherwise, for every letter mapped to the current digit, append it and recurse on the next index, then remove it (backtrack) before trying the next letter. There are at most 4^4 = 256 combinations, so this comfortably finishes in time.",
    pythonSolutionCode:
      'def letter_combinations(digits):\n    if not digits:\n        return []\n    mapping = {\n        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",\n        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",\n    }\n    res = []\n\n    def backtrack(i, path):\n        if i == len(digits):\n            res.append("".join(path))\n            return\n        for ch in mapping[digits[i]]:\n            path.append(ch)\n            backtrack(i + 1, path)\n            path.pop()\n\n    backtrack(0, [])\n    return res\n',
    solve: (digits) => {
      if (!digits.length) return [];
      const mapping = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
      const res = [];
      const backtrack = (i, path) => {
        if (i === digits.length) {
          res.push(path.join(''));
          return;
        }
        for (const ch of mapping[digits[i]]) {
          path.push(ch);
          backtrack(i + 1, path);
          path.pop();
        }
      };
      backtrack(0, []);
      return res;
    },
    exampleExplanation: (args, result) =>
      args[0].length
        ? `The ${args[0].length}-digit input "${args[0]}" produces ${result.length} letter combination(s).`
        : 'An empty digit string produces no combinations at all.',
    edgeCases: [
      { args: [''], kind: 'edge' },
      { args: ['2'], kind: 'edge' },
      { args: ['23'], kind: 'edge' },
      { args: ['7'], kind: 'edge' },
      { args: ['79'], kind: 'edge' },
      { args: ['9999'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Palindrome Partitioning',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'string', leafKind: 'array', maxN: 6, alphabet: 'aab' },
    comparisonMode: 'canonical-sort-lines',
    genArgs: (rng, cfg) => {
      const n = randInt(rng, 1, cfg.maxN ?? 6);
      return [randString(rng, n, cfg.alphabet || 'aab')];
    },
    statement:
      'Given a string `s`, split it into one or more substrings such that every substring is a palindrome. Return every such partitioning.\n\nEach partitioning is printed as its substrings in left-to-right order, comma-separated; the set of partitionings may be printed in any order.',
    constraints: '- `1 <= s.length <= 16`\n- `s` consists only of lowercase English letters.',
    inputFormat: 'Line 1: the string `s`.',
    outputFormat: 'One partitioning per line, its substrings comma-separated in left-to-right order. Order of lines does not matter.',
    hints: [
      'At any position in the string, you have to choose how long the *next* palindromic piece is -- try every possible length.',
      'Backtrack: at each start index, try every end index, and only recurse further if the substring between them is a palindrome.',
      'A partitioning is complete once your start index reaches the end of the string -- that is when you record the current path.',
    ],
    solutionApproach:
      'Backtrack over the string with a start index. At each step, try every possible next cut point; if the substring from the start index up to that cut is a palindrome, recurse from the cut point with that substring appended to the current path. When the start index reaches the end of the string, the path is a complete valid partitioning -- record a copy of it. Checking each candidate substring for palindrome-ness is O(n), and there are up to 2^(n-1) partitionings in the worst case (all-identical characters).',
    pythonSolutionCode:
      'def partition(s):\n    res = []\n\n    def is_pal(sub):\n        return sub == sub[::-1]\n\n    def backtrack(start, path):\n        if start == len(s):\n            res.append(list(path))\n            return\n        for end in range(start + 1, len(s) + 1):\n            sub = s[start:end]\n            if is_pal(sub):\n                path.append(sub)\n                backtrack(end, path)\n                path.pop()\n\n    backtrack(0, [])\n    return res\n',
    solve: (s) => {
      const isPal = (sub) => sub === [...sub].reverse().join('');
      const res = [];
      const backtrack = (start, path) => {
        if (start === s.length) {
          res.push([...path]);
          return;
        }
        for (let end = start + 1; end <= s.length; end += 1) {
          const sub = s.slice(start, end);
          if (isPal(sub)) {
            path.push(sub);
            backtrack(end, path);
            path.pop();
          }
        }
      };
      backtrack(0, []);
      return res;
    },
    exampleExplanation: (args, result) => `The string "${args[0]}" has ${result.length} way(s) to be split into all-palindrome substrings.`,
    edgeCases: [
      { args: ['a'], kind: 'edge' },
      { args: ['aa'], kind: 'edge' },
      { args: ['ab'], kind: 'edge' },
      { args: ['aab'], kind: 'edge' },
      { args: ['racecar'], kind: 'edge' },
      { args: ['abcba'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'N-Queens',
    shape: 'unordered_listing',
    shapeConfig: { inputKind: 'int', leafKind: 'board', min: 1, max: 8 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'The n-queens puzzle asks you to place `n` chess queens on an `n x n` board so that no two queens attack each other (no two share a row, column, or diagonal).\n\nGiven an integer `n`, return every distinct solution. Each solution is a board where `Q` marks a queen and `.` marks an empty square.',
    constraints: '- `1 <= n <= 9`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat:
      'Each solution is printed as `n` rows joined with `|` (e.g. `.Q..|...Q|Q...|..Q.` for one 4x4 solution), one solution per line. If there is no solution, no lines are printed. Order of lines does not matter.',
    hints: [
      'Since no two queens can share a row, you can place exactly one queen per row and only decide which column it goes in.',
      'Track which columns and which two diagonals are already occupied so you can reject an illegal column placement in O(1).',
      'Backtrack row by row: place a queen in a free column, recurse to the next row, and undo the placement if that branch fails to reach a full board.',
    ],
    solutionApproach:
      'Place queens one row at a time. For row `r`, try every column `c` not already blocked by a used column, or by either diagonal (`r - c` and `r + c` uniquely identify the two diagonal families). If `c` is free, mark the column/diagonals used, recurse to row `r + 1`, then undo the marks (backtrack) before trying the next column. When all `n` rows are placed, render the board and record it. This explores far fewer than the naive `n^n` placements thanks to the early column/diagonal pruning.',
    pythonSolutionCode:
      'def solve_n_queens(n):\n    res = []\n    cols, diag1, diag2 = set(), set(), set()\n    board = []\n\n    def backtrack(row):\n        if row == n:\n            res.append(["".join("Q" if c == col else "." for c in range(n)) for col in board])\n            return\n        for col in range(n):\n            if col in cols or (row - col) in diag1 or (row + col) in diag2:\n                continue\n            cols.add(col); diag1.add(row - col); diag2.add(row + col)\n            board.append(col)\n            backtrack(row + 1)\n            board.pop()\n            cols.discard(col); diag1.discard(row - col); diag2.discard(row + col)\n\n    backtrack(0)\n    return res\n',
    solve: (n) => {
      const res = [];
      const cols = new Set();
      const diag1 = new Set();
      const diag2 = new Set();
      const board = [];
      const backtrack = (row) => {
        if (row === n) {
          res.push(board.map((col) => '.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1)));
          return;
        }
        for (let col = 0; col < n; col += 1) {
          if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
          cols.add(col);
          diag1.add(row - col);
          diag2.add(row + col);
          board.push(col);
          backtrack(row + 1);
          board.pop();
          cols.delete(col);
          diag1.delete(row - col);
          diag2.delete(row + col);
        }
      };
      backtrack(0);
      return res;
    },
    exampleExplanation: (args, result) =>
      result.length
        ? `Placing ${args[0]} non-attacking queens on a ${args[0]}x${args[0]} board has ${result.length} distinct solution(s).`
        : `There is no way to place ${args[0]} non-attacking queens on a ${args[0]}x${args[0]} board.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [5], kind: 'edge' },
      { args: [8], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'N-Queens II',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 1, max: 9 },
    statement:
      'The n-queens puzzle asks you to place `n` chess queens on an `n x n` board so that no two queens attack each other (no two share a row, column, or diagonal).\n\nGiven an integer `n`, return the number of distinct solutions -- you do not need to construct the boards themselves, just count them.',
    constraints: '- `1 <= n <= 9`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: the number of distinct solutions.',
    hints: [
      'This is the same search as constructing N-Queens boards, except you never need to materialize a board -- just count completed placements.',
      'Track used columns and both diagonal families (`row - col` and `row + col`) to reject illegal placements in O(1), same as the board-producing version.',
      'Increment a counter whenever a placement reaches row `n` (a full, valid board), instead of storing anything.',
    ],
    solutionApproach:
      'Identical backtracking to N-Queens: place one queen per row, tracking used columns and both diagonals to prune illegal columns in O(1). Instead of rendering and storing a board when all `n` rows are filled, simply increment a running counter. This avoids the (comparatively expensive) string-building work entirely.',
    pythonSolutionCode:
      'def total_n_queens(n):\n    count = 0\n    cols, diag1, diag2 = set(), set(), set()\n\n    def backtrack(row):\n        nonlocal count\n        if row == n:\n            count += 1\n            return\n        for col in range(n):\n            if col in cols or (row - col) in diag1 or (row + col) in diag2:\n                continue\n            cols.add(col); diag1.add(row - col); diag2.add(row + col)\n            backtrack(row + 1)\n            cols.discard(col); diag1.discard(row - col); diag2.discard(row + col)\n\n    backtrack(0)\n    return count\n',
    solve: (n) => {
      let count = 0;
      const cols = new Set();
      const diag1 = new Set();
      const diag2 = new Set();
      const backtrack = (row) => {
        if (row === n) {
          count += 1;
          return;
        }
        for (let col = 0; col < n; col += 1) {
          if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
          cols.add(col);
          diag1.add(row - col);
          diag2.add(row + col);
          backtrack(row + 1);
          cols.delete(col);
          diag1.delete(row - col);
          diag2.delete(row + col);
        }
      };
      backtrack(0);
      return count;
    },
    exampleExplanation: (args, result) => `There are ${result} distinct way(s) to place ${args[0]} non-attacking queens on a ${args[0]}x${args[0]} board.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [6], kind: 'edge' },
      { args: [8], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Word Search',
    shape: 'bt_board_and_word',
    shapeConfig: { outputType: 'bool', minRows: 2, maxRows: 4, minCols: 2, maxCols: 4, alphabet: 'ABC', maxWordLen: 4 },
    statement:
      'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` can be formed by a path that starts at some cell and moves to horizontally or vertically adjacent cells, never reusing the same cell twice within one path.',
    constraints: '- `1 <= board.length, board[0].length <= 6`\n- `board[i][j]` is an uppercase English letter.\n- `1 <= word.length <= 15`',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: each row of the board as a single string of letters (no separators). Final line: the target `word`.',
    outputFormat: '`true` or `false`.',
    hints: [
      'Try starting the search from every cell whose letter matches the first character of `word`.',
      'From a matching cell, explore all four neighbors looking for the next character -- but you must not revisit a cell already used earlier in this same path.',
      'Mark a cell as "in use" before recursing into its neighbors, and un-mark it on the way back out (backtracking) so other paths can still use that cell.',
    ],
    solutionApproach:
      "Depth-first search from every cell matching `word[0]`. At each step, given the board position and how much of `word` has been matched so far, check bounds, that the cell hasn't been used earlier in this path, and that its letter matches the next required character; if all pass, mark the cell visited, recurse into all four neighbors for the next character, then unmark it before returning (classic backtracking). If any starting cell's search reaches the full length of `word`, the answer is true. Worst case is O(rows * cols * 4^L) for a word of length L, but the visited-cell pruning keeps it fast in practice.",
    pythonSolutionCode:
      'def exist(board, word):\n    if not word:\n        return True\n    rows, cols = len(board), len(board[0]) if board else 0\n    visited = [[False] * cols for _ in range(rows)]\n\n    def dfs(r, c, i):\n        if i == len(word):\n            return True\n        if r < 0 or r >= rows or c < 0 or c >= cols or visited[r][c] or board[r][c] != word[i]:\n            return False\n        visited[r][c] = True\n        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)\n                 or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))\n        visited[r][c] = False\n        return found\n\n    for r in range(rows):\n        for c in range(cols):\n            if dfs(r, c, 0):\n                return True\n    return False\n',
    solve: (board, word) => wordExists(board, word),
    exampleExplanation: (args, result) =>
      result ? `"${args[1]}" can be traced through adjacent cells of the board.` : `"${args[1]}" cannot be traced through adjacent cells of the board.`,
    edgeCases: [
      { args: [[['A']], 'A'], kind: 'edge' },
      { args: [[['A']], 'B'], kind: 'edge' },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], kind: 'edge' },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], kind: 'edge' },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], kind: 'edge' },
      { args: [[['A', 'A'], ['A', 'A']], 'AAAAA'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sudoku Solver',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'matrix', minRows: 9, maxRows: 9, minCols: 9, maxCols: 9, blanks: 30 },
    genArgs: (rng, cfg) => {
      const solved = fillSolvedGrid(rng);
      const puzzle = carvePuzzle(rng, solved, cfg.blanks ?? 30);
      return [puzzle];
    },
    statement:
      'Write a program to solve a `9 x 9` Sudoku puzzle by filling in the empty cells.\n\nA valid Sudoku solution must satisfy all of the following rules:\n- Each of the digits `1`-`9` must appear exactly once in each row.\n- Each of the digits `1`-`9` must appear exactly once in each column.\n- Each of the digits `1`-`9` must appear exactly once in each of the nine `3x3` sub-boxes of the grid.\n\nEmpty cells are given as `0`. Every puzzle in this problem is guaranteed to have exactly one valid solution -- return the fully solved grid.',
    constraints: '- The board is always `9 x 9`.\n- `board[i][j]` is a digit `1`-`9`, or `0` for an empty cell.\n- The puzzle is guaranteed to have exactly one solution.',
    inputFormat: 'Line 1: `9 9`. Next 9 lines: 9 space-separated digits each (`0` marks an empty cell).',
    outputFormat: '9 lines of 9 space-separated digits: the fully solved grid.',
    hints: [
      'Since the puzzle is guaranteed to have exactly one solution, you never need to worry about picking "the right" one among several -- any digit that passes the row/column/box checks and leads to a full solve is correct.',
      'At each empty cell, try digits 1-9 in order, but only "commit" to one if it currently violates no row, column, or 3x3-box constraint.',
      'Recurse to the next empty cell after committing a digit; if every later cell fails for all nine digits, undo (backtrack) the current cell and try the next candidate digit instead.',
    ],
    solutionApproach:
      'Scan cells in row-major order. At each empty cell, try digits 1 through 9; a digit is legal if it does not already appear in the same row, column, or 3x3 sub-box. Place a legal digit and recurse to the next cell; if the recursive call eventually fails for every candidate, remove the digit (backtrack) and try the next one. Because the puzzle is guaranteed uniquely solvable, the first complete assignment found by this search is guaranteed to be *the* solution. Checking each candidate digit against its row/column/box is O(1) with fixed-size 9-element scans, so the search is fast in practice despite exponential worst-case behavior.',
    pythonSolutionCode:
      'def solve_sudoku(board):\n    grid = [row[:] for row in board]\n\n    def is_safe(r, c, v):\n        for i in range(9):\n            if grid[r][i] == v or grid[i][c] == v:\n                return False\n        br, bc = (r // 3) * 3, (c // 3) * 3\n        for i in range(3):\n            for j in range(3):\n                if grid[br + i][bc + j] == v:\n                    return False\n        return True\n\n    def backtrack(pos):\n        if pos == 81:\n            return True\n        r, c = divmod(pos, 9)\n        if grid[r][c] != 0:\n            return backtrack(pos + 1)\n        for v in range(1, 10):\n            if is_safe(r, c, v):\n                grid[r][c] = v\n                if backtrack(pos + 1):\n                    return True\n                grid[r][c] = 0\n        return False\n\n    backtrack(0)\n    return grid\n',
    solve: (board) => solveSudoku(board),
    exampleExplanation: () => 'Every empty (0) cell is filled in so each row, column, and 3x3 box contains the digits 1-9 exactly once.',
    edgeCases: [
      {
        // Generated from a full valid grid via the same uniqueness-preserving carve used by
        // genArgs() above -- guaranteed exactly one solution.
        args: [
          [
            [0, 0, 2, 3, 6, 0, 0, 9, 0],
            [0, 6, 0, 0, 0, 7, 8, 1, 5],
            [8, 7, 9, 0, 0, 4, 3, 0, 2],
            [4, 0, 3, 8, 0, 6, 0, 2, 7],
            [2, 8, 7, 0, 0, 9, 5, 3, 6],
            [5, 9, 0, 0, 3, 2, 4, 8, 1],
            [9, 0, 0, 0, 2, 5, 6, 7, 8],
            [6, 0, 8, 0, 7, 1, 2, 0, 0],
            [0, 0, 5, 6, 8, 0, 1, 4, 0],
          ],
        ],
        kind: 'edge',
      },
      {
        // Exactly one blank cell -- trivially the fastest possible non-noop case.
        args: [
          [
            [1, 5, 2, 3, 6, 8, 7, 9, 4],
            [3, 6, 4, 2, 9, 7, 8, 1, 5],
            [8, 7, 9, 5, 1, 4, 3, 6, 2],
            [4, 1, 3, 8, 5, 6, 9, 2, 7],
            [2, 8, 7, 1, 4, 9, 5, 3, 6],
            [5, 9, 6, 7, 3, 2, 4, 8, 1],
            [9, 3, 1, 4, 2, 5, 6, 7, 8],
            [6, 4, 8, 9, 7, 1, 2, 5, 3],
            [7, 2, 5, 6, 8, 3, 1, 4, 0],
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [3, 0, 2, 9, 4, 6, 5, 1, 0],
            [0, 6, 0, 2, 1, 0, 3, 7, 4],
            [1, 5, 0, 0, 8, 7, 6, 2, 9],
            [0, 4, 3, 1, 0, 8, 7, 5, 6],
            [0, 9, 0, 0, 0, 2, 1, 0, 3],
            [0, 1, 6, 4, 7, 3, 0, 9, 0],
            [4, 0, 0, 0, 0, 1, 0, 8, 0],
            [7, 3, 0, 0, 2, 9, 4, 6, 0],
            [0, 8, 0, 7, 5, 0, 2, 3, 0],
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [7, 5, 4, 0, 3, 1, 6, 8, 0],
            [9, 0, 1, 4, 5, 6, 3, 7, 0],
            [2, 3, 0, 8, 0, 0, 0, 5, 0],
            [0, 2, 7, 6, 4, 5, 8, 9, 0],
            [8, 4, 0, 0, 7, 2, 5, 1, 0],
            [5, 6, 9, 1, 0, 0, 2, 0, 0],
            [3, 0, 8, 0, 0, 4, 9, 2, 5],
            [0, 9, 2, 5, 1, 8, 0, 0, 4],
            [0, 7, 5, 0, 0, 0, 0, 0, 8],
          ],
        ],
        kind: 'edge',
      },
    ],
  },
];
