import { randInt, shuffle, linesOf, SHAPES } from '../dsaIOShapes.js';

/**
 * "Spiral Matrix II" takes a single integer `n` and produces an `n x n`
 * matrix — no shape in the shared catalog covers "int in, matrix out" (the
 * closest, `matrix_to_value_or_matrix`, only ever *reads* a matrix). Per the
 * guide's "bespoke: you own everything" allowance, and following the
 * precedent set in `binarysearch-batch1.problems.js` (`bs_matrix_and_target`)
 * and `backtracking-batch3.problems.js` (`bt_board_and_word`), we register
 * one small, self-contained shape onto the shared registry (`SHAPES` is a
 * plain exported object, not frozen). It's namespaced `mtx_n_to_matrix` so it
 * can't collide with the shared catalog or any other authoring batch's
 * shapes. This is a runtime side effect of importing this module only; it
 * edits no file on disk, and only matters at authoring/seed time (grading
 * later reads pre-computed stdin/expectedStdout from the DB and never calls
 * getShape() again).
 */
SHAPES.mtx_n_to_matrix = {
  decode: (stdin) => [Number(linesOf(stdin)[0] || 0)],
  encode: (n) => `${n}`,
  gen: (rng, cfg = {}) => [randInt(rng, cfg.min ?? 1, cfg.max ?? 8)],
  format: (result) => result.map((row) => row.join(' ')).join('\n'),
  pretty: (args) => `n = ${args[0]}`,
  starter: (title) =>
    genericStarterFor(title, 'Line 1 is the integer n. Print the resulting n x n matrix, one row per line, space-separated ints.'),
};

/** Local copy of dsaIOShapes.js's internal genericStarter (not exported there) — same shape, own name. */
function genericStarterFor(title, formatNote) {
  const langs = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'csharp', 'ruby'];
  const out = {};
  for (const lang of langs) {
    const commentStyle = lang === 'python' || lang === 'ruby' ? '#' : lang === 'c' ? '/*' : '//';
    const line =
      commentStyle === '/*' ? `/* TODO: Implement ${title}. ${formatNote} */` : `${commentStyle} TODO: Implement ${title}. ${formatNote}`;
    out[lang] = `${line}\n`;
  }
  return out;
}

/** Standard "band/stack shuffle + digit relabel" algorithm for generating a random, guaranteed-valid, fully-filled 9x9 Sudoku grid. */
function randomFullSudoku(rng) {
  const base = 3;
  const side = 9;
  const patternVal = (r, c) => (base * (r % base) + Math.floor(r / base) + c) % side;
  const rows = [];
  for (const band of shuffle(rng, [0, 1, 2])) {
    for (const r of shuffle(rng, [0, 1, 2])) rows.push(band * base + r);
  }
  const cols = [];
  for (const stack of shuffle(rng, [0, 1, 2])) {
    for (const c of shuffle(rng, [0, 1, 2])) cols.push(stack * base + c);
  }
  const nums = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return rows.map((r) => cols.map((c) => nums[patternVal(r, c)]));
}

/** Blanks cells (sets to 0, the "empty" marker) independently with probability `p`. Never introduces a conflict. */
function blankCells(rng, board, p) {
  return board.map((row) => row.map((v) => (rng() < p ? 0 : v)));
}

/** Deliberately forces a duplicate digit inside one random unit (row/col/3x3 box) so the board becomes invalid. */
function corruptSudoku(rng, board) {
  const p = board.map((row) => row.slice());
  const unit = ['row', 'col', 'box'][randInt(rng, 0, 2)];
  const digit = randInt(rng, 1, 9);
  const idx = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  if (unit === 'row') {
    const r = randInt(rng, 0, 8);
    const [c1, c2] = shuffle(rng, idx).slice(0, 2);
    p[r][c1] = digit;
    p[r][c2] = digit;
  } else if (unit === 'col') {
    const c = randInt(rng, 0, 8);
    const [r1, r2] = shuffle(rng, idx).slice(0, 2);
    p[r1][c] = digit;
    p[r2][c] = digit;
  } else {
    const br = randInt(rng, 0, 2) * 3;
    const bc = randInt(rng, 0, 2) * 3;
    const cells = [];
    for (let dr = 0; dr < 3; dr += 1) for (let dc = 0; dc < 3; dc += 1) cells.push([br + dr, bc + dc]);
    const [cellA, cellB] = shuffle(rng, cells).slice(0, 2);
    p[cellA[0]][cellA[1]] = digit;
    p[cellB[0]][cellB[1]] = digit;
  }
  return p;
}

const VALID_SUDOKU_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export default [
  {
    legacyProblemName: 'Spiral Matrix',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'intArray', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: -100, max: 100 },
    statement:
      'Given an `m x n` integer `matrix`, return all elements of the matrix visiting them in spiral order: starting at the top-left corner, walk right across the top row, down the right column, left across the bottom row, up the left column, then spiral inward and repeat until every element has been visited exactly once.',
    constraints: '- `1 <= m, n <= 10`\n- `-100 <= matrix[i][j] <= 100`',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated integers, one matrix row per line.',
    outputFormat: 'All matrix elements in spiral visiting order, space-separated on one line.',
    hints: [
      'Think of the traversal as shrinking a rectangle: you consume the top row, then the right column, then the bottom row, then the left column, and repeat on what remains.',
      'Track four boundaries — `top`, `bottom`, `left`, `right` — and after walking each side, move that boundary inward by one.',
      'A single-row or single-column matrix is the classic trap: after walking the top row and right column, check that `top <= bottom` (and `left <= right`) before walking the bottom row / left column again, or you will revisit or double-count cells.',
    ],
    solutionApproach:
      'Maintain four shrinking boundaries `top`, `bottom`, `left`, `right`. Repeatedly: walk left→right across row `top` and increment `top`; walk top→bottom down column `right` and decrement `right`; if `top <= bottom`, walk right→left across row `bottom` and decrement `bottom`; if `left <= right`, walk bottom→top up column `left` and increment `left`. Stop once the boundaries cross. This visits every cell exactly once in O(m*n) time and O(1) extra space (excluding the output).',
    pythonSolutionCode:
      'def spiral_order(matrix):\n    res = []\n    if not matrix or not matrix[0]:\n        return res\n    top, bottom = 0, len(matrix) - 1\n    left, right = 0, len(matrix[0]) - 1\n    while top <= bottom and left <= right:\n        for c in range(left, right + 1):\n            res.append(matrix[top][c])\n        top += 1\n        for r in range(top, bottom + 1):\n            res.append(matrix[r][right])\n        right -= 1\n        if top <= bottom:\n            for c in range(right, left - 1, -1):\n                res.append(matrix[bottom][c])\n            bottom -= 1\n        if left <= right:\n            for r in range(bottom, top - 1, -1):\n                res.append(matrix[r][left])\n            left += 1\n    return res\n',
    solve: (matrix) => {
      const res = [];
      if (!matrix.length || !matrix[0].length) return res;
      let top = 0;
      let bottom = matrix.length - 1;
      let left = 0;
      let right = matrix[0].length - 1;
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c += 1) res.push(matrix[top][c]);
        top += 1;
        for (let r = top; r <= bottom; r += 1) res.push(matrix[r][right]);
        right -= 1;
        if (top <= bottom) {
          for (let c = right; c >= left; c -= 1) res.push(matrix[bottom][c]);
          bottom -= 1;
        }
        if (left <= right) {
          for (let r = bottom; r >= top; r -= 1) res.push(matrix[r][left]);
          left += 1;
        }
      }
      return res;
    },
    exampleExplanation: (args, result) =>
      `Walking the ${args[0].length}x${args[0][0].length} matrix clockwise from the outside in visits the elements in the order [${result.join(', ')}].`,
    edgeCases: [
      { args: [[[7]]], kind: 'edge' },
      { args: [[[1, 2, 3, 4]]], kind: 'edge' },
      { args: [[[1], [2], [3]]], kind: 'edge' },
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], kind: 'edge' },
      { args: [[[1, 2, 3], [4, 5, 6]]], kind: 'edge' },
      { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Spiral Matrix II',
    shape: 'mtx_n_to_matrix',
    shapeConfig: { min: 1, max: 8 },
    statement:
      'Given a positive integer `n`, generate an `n x n` matrix filled with the integers `1` to `n^2`, placed in spiral order: starting at the top-left corner and spiraling clockwise inward, exactly the same traversal pattern as Spiral Matrix, but here you are writing increasing numbers into the cells instead of reading them out.',
    constraints: '- `1 <= n <= 20`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'The `n x n` matrix, one row per line, space-separated integers.',
    hints: [
      'This is the inverse of Spiral Matrix: instead of reading values off a fixed grid in spiral order, you are writing an increasing counter into an empty grid in that same order.',
      'Reuse the four-boundary (`top`, `bottom`, `left`, `right`) shrinking-rectangle technique, but assign `matrix[r][c] = val++` at each step instead of reading.',
      'Allocate the `n x n` grid up front (e.g. filled with zeros) so you can freely assign into it as you spiral inward.',
    ],
    solutionApproach:
      'Allocate an `n x n` grid. Walk the same shrinking-rectangle spiral used for Spiral Matrix — top row left→right, right column top→bottom, bottom row right→left (only while `top <= bottom`), left column bottom→top (only while `left <= right`) — but instead of reading, assign an increasing counter starting at 1 into each visited cell. O(n^2) time and space.',
    pythonSolutionCode:
      'def generate_matrix(n):\n    matrix = [[0] * n for _ in range(n)]\n    top, bottom, left, right = 0, n - 1, 0, n - 1\n    val = 1\n    while top <= bottom and left <= right:\n        for c in range(left, right + 1):\n            matrix[top][c] = val\n            val += 1\n        top += 1\n        for r in range(top, bottom + 1):\n            matrix[r][right] = val\n            val += 1\n        right -= 1\n        if top <= bottom:\n            for c in range(right, left - 1, -1):\n                matrix[bottom][c] = val\n                val += 1\n            bottom -= 1\n        if left <= right:\n            for r in range(bottom, top - 1, -1):\n                matrix[r][left] = val\n                val += 1\n            left += 1\n    return matrix\n',
    solve: (n) => {
      const matrix = Array.from({ length: n }, () => Array(n).fill(0));
      let top = 0;
      let bottom = n - 1;
      let left = 0;
      let right = n - 1;
      let val = 1;
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c += 1) matrix[top][c] = val++;
        top += 1;
        for (let r = top; r <= bottom; r += 1) matrix[r][right] = val++;
        right -= 1;
        if (top <= bottom) {
          for (let c = right; c >= left; c -= 1) matrix[bottom][c] = val++;
          bottom -= 1;
        }
        if (left <= right) {
          for (let r = bottom; r >= top; r -= 1) matrix[r][left] = val++;
          left += 1;
        }
      }
      return matrix;
    },
    exampleExplanation: (args) => `For n = ${args[0]}, the numbers 1..${args[0] * args[0]} are laid out in a clockwise inward spiral.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [4], kind: 'edge' },
      { args: [5], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Set Matrix Zeroes',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'matrix', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: 1, max: 99 },
    genArgs: (rng, cfg = {}) => {
      const rows = randInt(rng, cfg.minRows ?? 1, cfg.maxRows ?? 6);
      const cols = randInt(rng, cfg.minCols ?? 1, cfg.maxCols ?? 6);
      const matrix = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (rng() < 0.2 ? 0 : randInt(rng, cfg.min ?? 1, cfg.max ?? 99)))
      );
      return [matrix];
    },
    statement:
      'Given an `m x n` integer `matrix`, if any cell contains `0`, set its entire row and its entire column to `0`. Return the resulting matrix.\n\nThe zeroing decisions must be based only on where the zeroes appeared in the *original* matrix, not on zeroes you introduced while processing it.',
    constraints: '- `1 <= m, n <= 10`\n- `-99 <= matrix[i][j] <= 99`',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated integers, one matrix row per line.',
    outputFormat: 'The modified matrix, one row per line, space-separated integers.',
    hints: [
      'If you zero out cells as soon as you find a zero, you will accidentally create new zeroes that then trigger more zeroing — you need to remember the original zero *positions* before mutating anything.',
      'A simple approach: first do a full pass to record which rows and which columns contain at least one original zero (e.g. in two boolean sets), then do a second pass that zeroes any cell whose row or column was marked.',
      'You can do this with O(1) extra space by reusing the first row and first column of the matrix itself as the marker sets, handling the top-left cell carefully — but the two-set approach is easier to reason about first.',
    ],
    solutionApproach:
      'Two-pass approach: first scan the whole matrix and record every row index and column index that contains at least one zero (two sets). Then scan again and set `matrix[r][c] = 0` for any cell whose row or column was recorded. This correctly separates "reading the original zero positions" from "writing the result", avoiding the cascade bug. O(m*n) time, O(m+n) extra space (O(1) is possible using the first row/column as markers).',
    pythonSolutionCode:
      'def set_zeroes(matrix):\n    rows, cols = len(matrix), len(matrix[0])\n    zero_rows, zero_cols = set(), set()\n    for r in range(rows):\n        for c in range(cols):\n            if matrix[r][c] == 0:\n                zero_rows.add(r)\n                zero_cols.add(c)\n    res = [row[:] for row in matrix]\n    for r in range(rows):\n        for c in range(cols):\n            if r in zero_rows or c in zero_cols:\n                res[r][c] = 0\n    return res\n',
    solve: (matrix) => {
      const rows = matrix.length;
      const cols = matrix[0].length;
      const zeroRows = new Set();
      const zeroCols = new Set();
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (matrix[r][c] === 0) {
            zeroRows.add(r);
            zeroCols.add(c);
          }
        }
      }
      const res = matrix.map((row) => row.slice());
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (zeroRows.has(r) || zeroCols.has(c)) res[r][c] = 0;
        }
      }
      return res;
    },
    exampleExplanation: () => 'Every row and every column that contained an original zero is fully zeroed out in the result.',
    edgeCases: [
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], kind: 'edge' },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], kind: 'edge' },
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], kind: 'edge' },
      { args: [[[1, 0, 3]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Valid Sudoku',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'bool', minRows: 9, maxRows: 9, minCols: 9, maxCols: 9, min: 0, max: 9 },
    genArgs: (rng) => {
      const board = randomFullSudoku(rng);
      const blankProb = 0.35 + rng() * 0.35;
      let puzzle = blankCells(rng, board, blankProb);
      if (rng() < 0.45) puzzle = corruptSudoku(rng, puzzle);
      return [puzzle];
    },
    statement:
      'Determine if a `9 x 9` Sudoku board is valid, checking only the cells that are already filled in — the board does not need to be completely filled, and it does not need to be solvable, just internally consistent so far.\n\nA board is valid when, considering only the filled cells:\n- Each row contains no repeated digit `1`-`9`.\n- Each column contains no repeated digit `1`-`9`.\n- Each of the nine non-overlapping `3 x 3` sub-boxes contains no repeated digit `1`-`9`.\n\nEmpty cells (represented here as `0`, equivalent to `.` in the classic pencil-and-paper notation) never conflict with anything.',
    constraints: '- The board always has exactly `9` rows and `9` columns.\n- Each cell is a digit `0`-`9`, where `0` means empty.',
    inputFormat: 'Line 1: `9 9`. Next 9 lines: 9 space-separated integers per row (`0` = empty cell, `1`-`9` = filled digit).',
    outputFormat: '`true` if the board is valid, `false` otherwise.',
    hints: [
      "You need three independent kinds of \"have I seen this digit before\" checks at once — per row, per column, and per 3x3 box — and a single conflict in any one of them makes the whole board invalid.",
      'A single pass over all 81 cells is enough: for each filled cell, check (and then record) its digit against a set for its row, a set for its column, and a set for its box.',
      'The box index for cell `(r, c)` is `(r / 3) * 3 + (c / 3)` using integer division — this maps each cell to one of the 9 boxes numbered 0-8.',
    ],
    solutionApproach:
      'Keep 9 sets for rows, 9 for columns, and 9 for the 3x3 boxes. Scan every cell once; skip empty (`0`) cells. For a filled cell with digit `v` at `(r, c)`, compute its box index `b = Math.floor(r/3)*3 + Math.floor(c/3)`. If `v` is already in `rows[r]`, `cols[c]`, or `boxes[b]`, the board is invalid — return false immediately. Otherwise add `v` to all three sets and continue. If the scan completes with no conflict, the board is valid. O(81) = O(1) time and space for a fixed 9x9 board.',
    pythonSolutionCode:
      'def is_valid_sudoku(board):\n    rows = [set() for _ in range(9)]\n    cols = [set() for _ in range(9)]\n    boxes = [set() for _ in range(9)]\n    for r in range(9):\n        for c in range(9):\n            v = board[r][c]\n            if v == 0:\n                continue\n            b = (r // 3) * 3 + (c // 3)\n            if v in rows[r] or v in cols[c] or v in boxes[b]:\n                return False\n            rows[r].add(v)\n            cols[c].add(v)\n            boxes[b].add(v)\n    return True\n',
    solve: (board) => {
      const rows = Array.from({ length: 9 }, () => new Set());
      const cols = Array.from({ length: 9 }, () => new Set());
      const boxes = Array.from({ length: 9 }, () => new Set());
      for (let r = 0; r < 9; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          const v = board[r][c];
          if (v === 0) continue;
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
          rows[r].add(v);
          cols[c].add(v);
          boxes[b].add(v);
        }
      }
      return true;
    },
    exampleExplanation: (args, result) =>
      result
        ? 'No row, column, or 3x3 box has a repeated digit among the filled cells, so the board is valid.'
        : 'At least one row, column, or 3x3 box has the same digit filled in twice, so the board is invalid.',
    edgeCases: [
      { args: [VALID_SUDOKU_GRID], kind: 'edge' },
      {
        args: [VALID_SUDOKU_GRID.map((row, r) => (r === 0 ? [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[0]] : row))],
        kind: 'edge',
      },
      { args: [Array.from({ length: 9 }, () => Array(9).fill(0))], kind: 'edge' },
      {
        args: [
          VALID_SUDOKU_GRID.map((row, r) => (r < 3 || r > 5 ? row.map((v, c) => (c < 3 || c > 5 ? v : 0)) : Array(9).fill(0))),
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [7, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [7, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            [5, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Game of Life',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'matrix', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: 0, max: 1 },
    statement:
      "Given an `m x n` binary grid `board` representing Conway's Game of Life — `1` for a live cell, `0` for a dead cell — compute the next generation of the board, applying these rules to every cell **simultaneously** based on its 8 neighbors (horizontal, vertical, and diagonal):\n\n1. A live cell with fewer than two live neighbors dies (underpopulation).\n2. A live cell with two or three live neighbors survives.\n3. A live cell with more than three live neighbors dies (overpopulation).\n4. A dead cell with exactly three live neighbors becomes alive (reproduction).\n\nReturn the resulting board after one step.",
    constraints: '- `1 <= m, n <= 10`\n- `board[i][j]` is `0` or `1`.',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated `0`/`1` values, one board row per line.',
    outputFormat: 'The next-generation board, one row per line, space-separated `0`/`1` values.',
    hints: [
      "All 81 cells (or however many) update at the same instant based on the *current* state — if you overwrite cells in place while still reading their old values for later neighbor checks, you will corrupt the result. Build (or reason about) the next state from the original board only.",
      'For each cell, just count how many of its up-to-8 neighbors are currently alive, being careful to stay in bounds near the edges.',
      'Once you have the live-neighbor count for a cell, the four rules collapse to two cases: a currently-live cell survives only on a count of 2 or 3; a currently-dead cell becomes alive only on a count of exactly 3.',
    ],
    solutionApproach:
      "Allocate a fresh output grid the same size as the input. For every cell `(r, c)`, count live neighbors among the up to 8 surrounding cells (checking bounds), reading only from the original `board`. If `board[r][c]` is alive, it survives in the output iff the live-neighbor count is 2 or 3; if it's dead, it becomes alive in the output iff the count is exactly 3 — otherwise the output cell is 0. Reading exclusively from the untouched original board (rather than mutating in place) guarantees every cell's update reflects the same simultaneous snapshot. O(m*n) time.",
    pythonSolutionCode:
      'def game_of_life(board):\n    rows, cols = len(board), len(board[0])\n    next_board = [[0] * cols for _ in range(rows)]\n    for r in range(rows):\n        for c in range(cols):\n            live = 0\n            for dr in (-1, 0, 1):\n                for dc in (-1, 0, 1):\n                    if dr == 0 and dc == 0:\n                        continue\n                    nr, nc = r + dr, c + dc\n                    if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == 1:\n                        live += 1\n            if board[r][c] == 1:\n                next_board[r][c] = 1 if live in (2, 3) else 0\n            else:\n                next_board[r][c] = 1 if live == 3 else 0\n    return next_board\n',
    solve: (board) => {
      const rows = board.length;
      const cols = board[0].length;
      const next = Array.from({ length: rows }, () => Array(cols).fill(0));
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          let live = 0;
          for (let dr = -1; dr <= 1; dr += 1) {
            for (let dc = -1; dc <= 1; dc += 1) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === 1) live += 1;
            }
          }
          if (board[r][c] === 1) next[r][c] = live === 2 || live === 3 ? 1 : 0;
          else next[r][c] = live === 3 ? 1 : 0;
        }
      }
      return next;
    },
    exampleExplanation: () => 'Every cell in the next generation is decided purely from the live-neighbor counts in the original board.',
    edgeCases: [
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 1], [1, 1]]], kind: 'edge' },
      { args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], kind: 'edge' },
      { args: [[[0, 1, 0], [0, 1, 0], [0, 1, 0]]], kind: 'edge' },
      { args: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], kind: 'edge' },
    ],
  },
];
