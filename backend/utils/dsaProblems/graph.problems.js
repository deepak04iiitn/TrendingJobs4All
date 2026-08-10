import { randInt } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Number of Islands',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'int', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: 0, max: 1 },
    statement:
      "Given an `m x n` binary grid `grid` where `1` represents land and `0` represents water, return the number of islands. An island is a group of `1`s connected 4-directionally (horizontal or vertical), surrounded by water.",
    constraints: '- `1 <= m, n <= 300`\n- `grid[i][j]` is `0` or `1`.',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated `0`/`1` values.',
    outputFormat: 'A single integer: the number of islands.',
    hints: [
      'Think of each unvisited land cell as the start of a potential new island.',
      'From a land cell, flood-fill (DFS/BFS) into all 4-directionally connected land cells, marking them visited so you never count them again.',
      'The answer is simply how many times you started a fresh flood-fill.',
    ],
    solutionApproach:
      'Scan every cell; whenever an unvisited `1` is found, increment the island count and flood-fill (DFS or BFS) outward in all 4 directions, marking visited cells as `0` so they are never revisited. O(rows × cols) time.',
    pythonSolutionCode:
      'def num_islands(grid):\n    rows, cols = len(grid), len(grid[0]) if grid else 0\n    grid = [row[:] for row in grid]\n    count = 0\n\n    def sink(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != 1:\n            return\n        grid[r][c] = 0\n        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)\n\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 1:\n                count += 1\n                sink(r, c)\n    return count\n',
    solve: (grid) => {
      const rows = grid.length;
      const cols = grid[0]?.length || 0;
      const g = grid.map((r) => r.slice());
      let count = 0;
      function sink(r, c) {
        if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] !== 1) return;
        g[r][c] = 0;
        sink(r + 1, c);
        sink(r - 1, c);
        sink(r, c + 1);
        sink(r, c - 1);
      }
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (g[r][c] === 1) {
            count += 1;
            sink(r, c);
          }
        }
      }
      return count;
    },
    exampleExplanation: (args, result) => `The grid contains ${result} separate group(s) of connected land cells.`,
    edgeCases: [
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 1, 0], [0, 1, 0], [0, 0, 1]]], kind: 'edge' },
      { args: [[[1, 1, 1], [1, 1, 1]]], kind: 'edge' },
      { args: [[[0, 0], [0, 0]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Course Schedule',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'bool', minN: 2, maxN: 8 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 8);
      const maxEdges = cfg.maxEdges ?? n * 2;
      const m = randInt(rng, 1, maxEdges);
      const edgeSet = new Set();
      const edges = [];
      let guard = 0;
      while (edges.length < m && guard < m * 10) {
        guard += 1;
        const a = randInt(rng, 0, n - 1);
        const b = randInt(rng, 0, n - 1);
        if (a === b) continue; // no self-loops
        const key = `${a}-${b}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push([a, b]);
      }
      return [n, edges, []];
    },
    statement:
      'There are `n` courses labeled `0` to `n - 1`. You are given `prerequisites` where `prerequisites[i] = [a, b]` means you must take course `b` before course `a`. Return `true` if it is possible to finish all courses, `false` if there is a cycle of dependencies making it impossible.',
    constraints: '- `1 <= n <= 2000`\n- Each prerequisite pair is valid and there are no self-loops.',
    inputFormat: 'Line 1: `n m` (courses, prerequisite pairs). Next `m` lines: `a b` meaning "a requires b".',
    outputFormat: '`true` if all courses can be finished, `false` if there is a cycle.',
    hints: [
      'This is really a cycle-detection question on a directed graph of prerequisites.',
      "Kahn's algorithm: repeatedly remove courses with no remaining prerequisites; if you can remove every course, there's no cycle.",
      'If courses remain that never reach zero remaining prerequisites, a cycle exists among them.',
    ],
    solutionApproach:
      "Build a dependency graph and compute in-degree (number of unmet prerequisites) for each course. Repeatedly dequeue courses with in-degree 0, decrementing the in-degree of courses that depended on them (Kahn's algorithm). If every course is eventually processed, there's no cycle; otherwise a cycle blocks the rest. O(n + m) time.",
    pythonSolutionCode:
      'from collections import deque\n\ndef can_finish(n, prerequisites):\n    indeg = [0] * n\n    adj = [[] for _ in range(n)]\n    for a, b in prerequisites:\n        adj[b].append(a)\n        indeg[a] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    visited = 0\n    while q:\n        u = q.popleft()\n        visited += 1\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return visited == n\n',
    solve: (n, edges) => {
      const indeg = new Array(n).fill(0);
      const adj = Array.from({ length: n }, () => []);
      for (const [a, b] of edges) {
        adj[b].push(a);
        indeg[a] += 1;
      }
      const queue = [];
      for (let i = 0; i < n; i += 1) if (indeg[i] === 0) queue.push(i);
      let visited = 0;
      while (queue.length) {
        const u = queue.shift();
        visited += 1;
        for (const v of adj[u]) {
          indeg[v] -= 1;
          if (indeg[v] === 0) queue.push(v);
        }
      }
      return visited === n;
    },
    exampleExplanation: (args, result) => (result ? 'The prerequisites form no cycle, so every course can eventually be taken.' : 'The prerequisites form a cycle, so some courses can never be unlocked.'),
    edgeCases: [
      { args: [1, []], kind: 'edge' },
      { args: [2, [[1, 0]]], kind: 'edge' },
      { args: [2, [[1, 0], [0, 1]]], kind: 'edge' },
      { args: [3, [[1, 0], [2, 1], [0, 2]]], kind: 'edge' },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], kind: 'edge' },
    ],
  },
];
