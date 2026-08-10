import { randInt, randString } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Clone Graph',
    shape: 'graph_to_graph',
    shapeConfig: { minN: 1, maxN: 6 },
    genArgs: (rng, cfg) => {
      // Build a random spanning tree first so the graph is always connected (LeetCode's
      // Clone Graph is defined on a connected graph reachable from a single reference node),
      // then sprinkle in a few extra edges for cycles. No self-loops, no duplicate edges.
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 6);
      const edgeSet = new Set();
      const edges = [];
      for (let v = 1; v < n; v += 1) {
        const u = randInt(rng, 0, v - 1);
        edges.push([u, v]);
        edgeSet.add(`${u}-${v}`);
      }
      const extra = randInt(rng, 0, n);
      for (let i = 0; i < extra; i += 1) {
        const a = randInt(rng, 0, n - 1);
        const b = randInt(rng, 0, n - 1);
        if (a === b) continue;
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push([a, b]);
      }
      return [n, edges];
    },
    statement:
      "Given a reference to a node in a **connected** undirected graph, return a deep copy (clone) of the graph. Nodes are labeled `0` to `n - 1`; each node stores its value and a list of neighbor references.\n\nYour clone must be a completely separate set of node objects with the same values and the same connections as the original — mutating the clone must never affect the original graph.",
    constraints:
      '- `0 <= n <= 100` nodes.\n- The graph has no self-loops and no repeated edges between the same pair of nodes.\n- The graph is connected (every node is reachable from every other node) whenever `n > 0`.\n- Output is graded as the cloned graph\'s edge set, canonicalized (sorted), so any structurally-correct clone (regardless of internal traversal order) is accepted.',
    inputFormat: 'Line 1: `n m` (node count, edge count). Next `m` lines: `u v` — an undirected edge between node `u` and node `v`.',
    outputFormat: 'The cloned graph, re-emitted as `n m` followed by `m` edges `u v` (canonical form).',
    hints: [
      "A naive copy that just copies each node's value misses the hard part: neighbor references form cycles, so a plain recursive copy can loop forever without care.",
      'Keep a hash map from original node → its clone. Before creating a new clone for a node, check whether you already made one.',
      "DFS (or BFS) from the given node: for each original node, look up or create its clone, then recursively do the same for its neighbors, wiring the clone's neighbor list as you go.",
    ],
    solutionApproach:
      "Do a DFS (or BFS) over the original graph. Maintain a `Map` from original node → cloned node. When visiting a node for the first time, create its clone and store it in the map immediately (before recursing) — this is what breaks infinite recursion on cycles. Then for every neighbor of the original node, recursively clone it (or reuse the existing clone from the map) and append it to the current clone's neighbor list. Every node and edge is visited once, so this runs in O(n + m) time and space.",
    pythonSolutionCode:
      "def clone_graph(n, adj):\n    if n == 0:\n        return []\n    nodes = [{'val': i, 'neighbors': []} for i in range(n)]\n    for u in range(n):\n        for v in adj[u]:\n            nodes[u]['neighbors'].append(nodes[v])\n\n    clone_map = {}\n\n    def clone(node):\n        key = id(node)\n        if key in clone_map:\n            return clone_map[key]\n        copy = {'val': node['val'], 'neighbors': []}\n        clone_map[key] = copy\n        for nb in node['neighbors']:\n            copy['neighbors'].append(clone(nb))\n        return copy\n\n    for i in range(n):\n        clone(nodes[i])\n\n    result = [None] * n\n    for i in range(n):\n        copy = clone_map[id(nodes[i])]\n        result[i] = [nb['val'] for nb in copy['neighbors']]\n    return result\n",
    solve: (n, adj) => {
      if (n === 0) return [];
      const nodes = Array.from({ length: n }, (_, i) => ({ val: i, neighbors: [] }));
      for (let u = 0; u < n; u += 1) {
        for (const v of adj[u]) nodes[u].neighbors.push(nodes[v]);
      }
      const cloneMap = new Map();
      function cloneNode(node) {
        if (cloneMap.has(node)) return cloneMap.get(node);
        const copy = { val: node.val, neighbors: [] };
        cloneMap.set(node, copy);
        for (const nb of node.neighbors) copy.neighbors.push(cloneNode(nb));
        return copy;
      }
      for (let i = 0; i < n; i += 1) cloneNode(nodes[i]);
      const result = new Array(n);
      for (let i = 0; i < n; i += 1) {
        const copy = cloneMap.get(nodes[i]);
        result[i] = copy.neighbors.map((nb) => nb.val);
      }
      return result;
    },
    exampleExplanation: (rawArgs) =>
      rawArgs[1].length
        ? `The clone reproduces all ${rawArgs[1].length} edge(s) of the original ${rawArgs[0]}-node graph, as a fresh set of node objects.`
        : `A single isolated node (no edges) is cloned as-is.`,
    edgeCases: [
      { args: [0, []], kind: 'edge' },
      { args: [1, []], kind: 'edge' },
      { args: [2, [[0, 1]]], kind: 'edge' },
      { args: [3, [[0, 1], [1, 2], [0, 2]]], kind: 'edge' },
      { args: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], kind: 'edge' },
      { args: [5, [[0, 1], [0, 2], [0, 3], [0, 4]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Course Schedule II',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'intArray', minN: 2, maxN: 8 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 8);
      const maxEdges = cfg.maxEdges ?? n * 2;
      const m = randInt(rng, 0, maxEdges);
      const edgeSet = new Set();
      const edges = [];
      let guard = 0;
      while (edges.length < m && guard < m * 10 + 10) {
        guard += 1;
        const a = randInt(rng, 0, n - 1);
        const b = randInt(rng, 0, n - 1);
        if (a === b) continue; // no self-loops: a course never requires itself
        const key = `${a}-${b}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push([a, b]);
      }
      return [n, edges, []];
    },
    statement:
      'There are `n` courses labeled `0` to `n - 1`. You are given `prerequisites` where `prerequisites[i] = [a, b]` means course `b` must be completed before course `a`. Return **one** valid ordering in which you could take all the courses. If it is impossible to finish all courses (a cycle of dependencies exists), return an empty result instead.',
    constraints:
      '- `1 <= n <= 2000`, no self-loop prerequisites.\n- If a valid order exists, this problem is graded against **one canonical order**: at every step, among all courses whose prerequisites are currently satisfied, always take the lowest-indexed one next (this is exactly what Kahn\'s algorithm produces if you always pop the smallest ready index). Any other valid-but-differently-ordered answer is marked incorrect.\n- If no valid order exists, the expected output is an empty line.',
    inputFormat: 'Line 1: `n m` (courses, prerequisite pairs). Next `m` lines: `a b` meaning "a requires b".',
    outputFormat: 'The course order as space-separated indices (empty line if no valid order exists).',
    hints: [
      'This is Course Schedule with a twist: instead of just detecting a cycle, you need to reconstruct an actual valid order.',
      "Kahn's algorithm naturally builds the order for free: every time you remove a course with zero remaining prerequisites, append it to your answer.",
      'Because several courses can become "ready" at the same time, you need a tie-break rule to get one deterministic answer — always advance the lowest-indexed ready course next.',
    ],
    solutionApproach:
      "Build the dependency graph and each course's in-degree (number of unmet prerequisites). Maintain the set of currently-ready courses (in-degree 0); repeatedly take the smallest-indexed ready course, append it to the answer, and decrement the in-degree of everything that depended on it, adding any that drop to zero back into the ready set. If every course gets appended, the answer is a valid order; if some remain stuck (a cycle exists), return an empty result instead. O(n log n + m) time using a sorted ready set (a min-heap would be the production choice for large n).",
    pythonSolutionCode:
      "def find_order(n, prerequisites):\n    indeg = [0] * n\n    adj = [[] for _ in range(n)]\n    for a, b in prerequisites:\n        adj[b].append(a)\n        indeg[a] += 1\n    ready = [i for i in range(n) if indeg[i] == 0]\n    order = []\n    while ready:\n        ready.sort()\n        u = ready.pop(0)\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                ready.append(v)\n    return order if len(order) == n else []\n",
    solve: (n, edges) => {
      const indeg = new Array(n).fill(0);
      const adj = Array.from({ length: n }, () => []);
      for (const [a, b] of edges) {
        adj[b].push(a);
        indeg[a] += 1;
      }
      const ready = [];
      for (let i = 0; i < n; i += 1) if (indeg[i] === 0) ready.push(i);
      const order = [];
      while (ready.length) {
        ready.sort((x, y) => x - y);
        const u = ready.shift();
        order.push(u);
        for (const v of adj[u]) {
          indeg[v] -= 1;
          if (indeg[v] === 0) ready.push(v);
        }
      }
      return order.length === n ? order : [];
    },
    exampleExplanation: (rawArgs, result) =>
      result.length
        ? `Taking courses in the order [${result.join(', ')}] satisfies every prerequisite.`
        : `The prerequisites among these ${rawArgs[0]} courses form a cycle, so no valid order exists.`,
    edgeCases: [
      { args: [1, []], kind: 'edge' },
      { args: [3, []], kind: 'edge' },
      { args: [2, [[1, 0]]], kind: 'edge' },
      { args: [2, [[1, 0], [0, 1]]], kind: 'edge' },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], kind: 'edge' },
      { args: [5, [[1, 0], [2, 1], [3, 2], [4, 3], [0, 4]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Pacific Atlantic Water Flow',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'matrix', minRows: 1, maxRows: 5, minCols: 1, maxCols: 5, min: 0, max: 9 },
    comparisonMode: 'canonical-sort-lines',
    statement:
      'You are given an `m x n` integer matrix `heights` representing a continent, where `heights[r][c]` is the height of the cell at `(r, c)`. The Pacific Ocean touches the entire left column and top row; the Atlantic Ocean touches the entire right column and bottom row.\n\nWater can flow from a cell to any of its 4-directionally adjacent neighbors if the neighbor\'s height is **less than or equal to** the current cell\'s height (water flows downhill or across flat ground). Return the coordinates `(r, c)` of every cell from which water can reach **both** oceans.',
    constraints:
      '- `1 <= m, n <= 200`\n- `0 <= heights[r][c] <= 10^5`\n- Each output coordinate is printed once, in any order (order does not affect grading).',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated heights.',
    outputFormat: 'One line per qualifying cell, as `row col`. Order of lines does not matter.',
    hints: [
      "Checking, for every cell, whether water flowing downhill from it eventually reaches both borders is expensive to do forward from every cell — try thinking backwards from the oceans instead.",
      'Reverse the flow rule: starting from every border cell touching an ocean, "flow" into a neighbor whenever the neighbor is greater than or equal to the current cell (i.e. water could have flowed the other way).',
      'Run one multi-source BFS/DFS from all Pacific-adjacent border cells, and a separate one from all Atlantic-adjacent border cells. A cell qualifies exactly when both searches reached it.',
    ],
    solutionApproach:
      "Run two multi-source BFS (or DFS) traversals. The first starts from every cell in the top row and left column (the Pacific border) and expands into a neighbor whenever that neighbor's height is >= the current cell's height — i.e. simulating water flowing backwards, uphill, from the ocean. The second does the same starting from the bottom row and right column (the Atlantic border). A cell that gets visited by both traversals can genuinely drain to both oceans. O(rows * cols) time and space.",
    pythonSolutionCode:
      "from collections import deque\n\ndef pacific_atlantic(heights):\n    rows = len(heights)\n    cols = len(heights[0]) if rows else 0\n    if rows == 0 or cols == 0:\n        return []\n\n    def bfs(starts):\n        visited = [[False] * cols for _ in range(rows)]\n        q = deque(starts)\n        for r, c in starts:\n            visited[r][c] = True\n        while q:\n            r, c = q.popleft()\n            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc] and heights[nr][nc] >= heights[r][c]:\n                    visited[nr][nc] = True\n                    q.append((nr, nc))\n        return visited\n\n    pac_starts = [(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)]\n    atl_starts = [(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)]\n    pac = bfs(pac_starts)\n    atl = bfs(atl_starts)\n    return [[r, c] for r in range(rows) for c in range(cols) if pac[r][c] and atl[r][c]]\n",
    solve: (matrix) => {
      const rows = matrix.length;
      const cols = matrix[0]?.length || 0;
      if (rows === 0 || cols === 0) return [];
      function bfs(starts) {
        const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
        const queue = [...starts];
        for (const [r, c] of starts) visited[r][c] = true;
        let head = 0;
        while (head < queue.length) {
          const [r, c] = queue[head];
          head += 1;
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || visited[nr][nc]) continue;
            if (matrix[nr][nc] < matrix[r][c]) continue;
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
        return visited;
      }
      const pacificStarts = [];
      const atlanticStarts = [];
      for (let c = 0; c < cols; c += 1) {
        pacificStarts.push([0, c]);
        atlanticStarts.push([rows - 1, c]);
      }
      for (let r = 0; r < rows; r += 1) {
        pacificStarts.push([r, 0]);
        atlanticStarts.push([r, cols - 1]);
      }
      const pacific = bfs(pacificStarts);
      const atlantic = bfs(atlanticStarts);
      const result = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
        }
      }
      return result;
    },
    exampleExplanation: (rawArgs, result) =>
      `${result.length} cell(s) in this ${rawArgs[0].length}x${rawArgs[0][0].length} grid can drain to both oceans.`,
    edgeCases: [
      { args: [[[1]]], kind: 'edge' },
      { args: [[[5, 5], [5, 5]]], kind: 'edge' },
      { args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], kind: 'edge' },
      { args: [[[1, 1], [1, 1]]], kind: 'edge' },
      { args: [[[0, 1, 2], [3, 4, 5]]], kind: 'edge' },
      { args: [[[9, 8, 7], [6, 5, 4], [3, 2, 1]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Graph Valid Tree',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'bool', minN: 1, maxN: 8 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      const edgeSet = new Set();
      const edges = [];
      const addEdge = (a, b) => {
        if (a === b) return false; // no self-loops
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (edgeSet.has(key)) return false;
        edgeSet.add(key);
        edges.push([a, b]);
        return true;
      };
      if (rng() < 0.5) {
        // Build a genuine random spanning tree (always a valid tree).
        for (let v = 1; v < n; v += 1) addEdge(randInt(rng, 0, v - 1), v);
      } else {
        // Build a random (possibly invalid) undirected edge set.
        const edgeCount = randInt(rng, 0, n + 1);
        let guard = 0;
        while (edges.length < edgeCount && guard < edgeCount * 10 + 10) {
          guard += 1;
          addEdge(randInt(rng, 0, n - 1), randInt(rng, 0, n - 1));
        }
      }
      return [n, edges, []];
    },
    statement:
      'You are given `n` nodes labeled `0` to `n - 1` and a list of undirected `edges` (each `[a, b]` connects `a` and `b`). Return `true` if these edges form a **valid tree** — meaning every node is connected and there are no cycles — and `false` otherwise.',
    constraints:
      '- `1 <= n <= 2000`\n- Each edge `[a, b]` satisfies `a != b` (no self-loops), and no edge is repeated.\n- A valid tree on `n` nodes always has exactly `n - 1` edges; that alone rules out many inputs instantly, but it is not sufficient on its own.',
    inputFormat: 'Line 1: `n m` (nodes, edges). Next `m` lines: `a b` — an undirected edge.',
    outputFormat: '`true` if the edges form a valid tree, `false` otherwise.',
    hints: [
      'A tree on `n` nodes has an exact edge-count signature — check that first, it eliminates most invalid cases for free.',
      "That count check alone isn't enough: `n - 1` edges could still form a cycle somewhere while leaving a different component disconnected.",
      'Union-Find (disjoint set union) is a clean way to confirm both properties at once: process each edge, and if the two endpoints are already in the same set, you just found a cycle.',
    ],
    solutionApproach:
      "First, an `n`-node tree must have exactly `n - 1` edges — if it doesn't, return false immediately. Otherwise, run Union-Find over the edges: for each edge, if its two endpoints already share a root, a cycle exists, so return false. If no edge ever triggers that, exactly `n - 1` edges with no cycle guarantees a single connected acyclic component — i.e. a valid tree. O(n * α(n)) time with path compression.",
    pythonSolutionCode:
      "def valid_tree(n, edges):\n    if len(edges) != n - 1:\n        return False\n    parent = list(range(n))\n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    for a, b in edges:\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return False\n        parent[ra] = rb\n    return True\n",
    solve: (n, edges) => {
      if (edges.length !== n - 1) return false;
      const parent = Array.from({ length: n }, (_, i) => i);
      function find(x) {
        while (parent[x] !== x) {
          parent[x] = parent[parent[x]];
          x = parent[x];
        }
        return x;
      }
      for (const [a, b] of edges) {
        const ra = find(a);
        const rb = find(b);
        if (ra === rb) return false;
        parent[ra] = rb;
      }
      return true;
    },
    exampleExplanation: (rawArgs, result) =>
      result
        ? `These ${rawArgs[1].length} edge(s) connect all ${rawArgs[0]} nodes with no cycle — a valid tree.`
        : `These edges either leave some node disconnected or contain a cycle, so this is not a valid tree.`,
    edgeCases: [
      { args: [1, []], kind: 'edge' },
      { args: [2, [[0, 1]]], kind: 'edge' },
      { args: [4, [[0, 1], [2, 3]]], kind: 'edge' },
      { args: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], kind: 'edge' },
      { args: [4, [[0, 1], [1, 2], [1, 3]]], kind: 'edge' },
      { args: [3, [[0, 1], [1, 2], [0, 2]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Number of Connected Components',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 10 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
      const maxEdges = cfg.maxEdges ?? n;
      const m = randInt(rng, 0, maxEdges);
      const edges = [];
      let guard = 0;
      while (edges.length < m && guard < m * 10 + 10) {
        guard += 1;
        const a = randInt(rng, 0, n - 1);
        const b = randInt(rng, 0, n - 1);
        if (a === b) continue; // no self-loops
        edges.push([a, b]);
      }
      return [n, edges, []];
    },
    statement:
      'You are given `n` nodes labeled `0` to `n - 1` and a list of undirected `edges` where `edges[i] = [a, b]` connects node `a` and node `b`. Return the number of connected components in the graph.',
    constraints: '- `1 <= n <= 2000`\n- Each edge satisfies `a != b` (no self-loops); the same pair may appear more than once (parallel edges are harmless).',
    inputFormat: 'Line 1: `n m` (nodes, edges). Next `m` lines: `a b` — an undirected edge.',
    outputFormat: 'A single integer: the number of connected components.',
    hints: [
      'Two nodes are in the same component if there is any path of edges between them, direct or indirect.',
      'Union-Find (disjoint set union) merges the two endpoints of every edge into one group as you scan the edge list.',
      'After processing every edge, count how many distinct group representatives (roots) remain among all `n` nodes.',
    ],
    solutionApproach:
      "Use Union-Find: start with every node in its own singleton set, then for each edge union its two endpoints' sets (with path compression for speed). After processing all edges, count the number of distinct roots across all `n` nodes — that count is the number of connected components. O(n + m * α(n)) time.",
    pythonSolutionCode:
      "def count_components(n, edges):\n    parent = list(range(n))\n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    for a, b in edges:\n        ra, rb = find(a), find(b)\n        if ra != rb:\n            parent[ra] = rb\n    return len({find(i) for i in range(n)})\n",
    solve: (n, edges) => {
      const parent = Array.from({ length: n }, (_, i) => i);
      function find(x) {
        while (parent[x] !== x) {
          parent[x] = parent[parent[x]];
          x = parent[x];
        }
        return x;
      }
      for (const [a, b] of edges) {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[ra] = rb;
      }
      const roots = new Set();
      for (let i = 0; i < n; i += 1) roots.add(find(i));
      return roots.size;
    },
    exampleExplanation: (rawArgs, result) => `The ${rawArgs[0]} nodes and ${rawArgs[1].length} edge(s) form ${result} connected component(s).`,
    edgeCases: [
      { args: [1, []], kind: 'edge' },
      { args: [5, []], kind: 'edge' },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], kind: 'edge' },
      { args: [4, [[0, 1], [2, 3]]], kind: 'edge' },
      { args: [6, [[0, 1], [1, 2], [3, 4]]], kind: 'edge' },
      { args: [3, [[0, 1], [0, 1]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Word Ladder',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'int', minN: 3, maxN: 8, minLen: 3, maxLen: 4, alphabet: 'abcd' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet ?? 'abcd';
      const wordLen = randInt(rng, cfg.minLen ?? 3, cfg.maxLen ?? 4);
      const maxPossible = alphabet.length ** wordLen - 1;
      const listSize = Math.min(randInt(rng, cfg.minN ?? 3, cfg.maxN ?? 8), maxPossible);

      const beginWord = randString(rng, wordLen, alphabet);
      let endWord = randString(rng, wordLen, alphabet);
      let guard = 0;
      while (endWord === beginWord && guard < 20) {
        endWord = randString(rng, wordLen, alphabet);
        guard += 1;
      }

      const wordSet = new Set();
      const wordList = [];

      // Bias most cases toward being solvable: lay down a one-letter-at-a-time chain
      // from beginWord to endWord, so a real transformation path usually exists.
      if (rng() < 0.6) {
        const cur = beginWord.split('');
        const target = endWord.split('');
        for (let i = 0; i < wordLen; i += 1) {
          if (cur[i] === target[i]) continue;
          cur[i] = target[i];
          const w = cur.join('');
          if (w !== beginWord && !wordSet.has(w) && wordList.length < listSize) {
            wordSet.add(w);
            wordList.push(w);
          }
        }
      }

      let fillGuard = 0;
      while (wordList.length < listSize && fillGuard < 10000) {
        fillGuard += 1;
        const w = randString(rng, wordLen, alphabet);
        if (w === beginWord || wordSet.has(w)) continue;
        wordSet.add(w);
        wordList.push(w);
      }

      return [[beginWord, endWord, ...wordList]];
    },
    statement:
      'You are given a `beginWord`, an `endWord`, and a `wordList` of same-length lowercase words. A transformation sequence changes exactly one letter at a time, and every intermediate word (including the final one) must exist in `wordList`.\n\nReturn the number of words in the **shortest** transformation sequence from `beginWord` to `endWord` (counting both endpoints), or `0` if no such sequence exists. Note that `endWord` must itself appear in `wordList`, or no sequence can reach it.',
    constraints:
      '- All words (`beginWord`, `endWord`, and every word in `wordList`) have the same length.\n- `1 <= wordList.length <= 5000`, words use lowercase letters only.\n- `beginWord != endWord`, and `beginWord` may or may not appear in `wordList` (it does not need to, since it is the given starting point).\n- If `endWord` is not present in `wordList`, the answer is `0`.',
    inputFormat: 'Line 1: total word count `N` (2 + size of wordList). Next `N` lines, one word each: line 1 is `beginWord`, line 2 is `endWord`, and the remaining `N - 2` lines are `wordList`.',
    outputFormat: 'A single integer: the length of the shortest transformation sequence (word count), or `0` if none exists.',
    hints: [
      'Think of every word as a node; two words are connected if they differ in exactly one letter. The question becomes "shortest path from beginWord to endWord" in this implicit graph.',
      'Shortest path in an unweighted graph is a textbook BFS — you never need to explore the whole graph, just level by level.',
      "To find a word's neighbors without comparing it against every other word, try every position and every possible replacement letter, and check whether the resulting word is in the (hash-set) word list.",
    ],
    solutionApproach:
      "Treat this as BFS over an implicit graph. Put `wordList` in a hash set for O(1) membership checks, and immediately return 0 if `endWord` isn't in it. Starting from `beginWord` at distance 1, expand level by level: for each word in the current frontier, try changing every position to every other letter of the alphabet, and if the resulting word is in the word set and hasn't been visited, add it to the next frontier. The first time `endWord` is dequeued, its level is the answer. If the frontier empties out first, return 0. With word length L and |Σ| letters, generating neighbors costs O(L * |Σ|) per word, so this runs in O(N * L * |Σ|) time where N is the word list size.",
    pythonSolutionCode:
      "from collections import deque\nfrom string import ascii_lowercase\n\ndef word_ladder(strs):\n    begin_word, end_word = strs[0], strs[1]\n    word_set = set(strs[2:])\n    if end_word not in word_set:\n        return 0\n    queue = deque([begin_word])\n    visited = {begin_word}\n    steps = 1\n    while queue:\n        for _ in range(len(queue)):\n            word = queue.popleft()\n            if word == end_word:\n                return steps\n            for i in range(len(word)):\n                for ch in ascii_lowercase:\n                    if ch == word[i]:\n                        continue\n                    candidate = word[:i] + ch + word[i + 1:]\n                    if candidate in word_set and candidate not in visited:\n                        visited.add(candidate)\n                        queue.append(candidate)\n        steps += 1\n    return 0\n",
    solve: (strs) => {
      const [beginWord, endWord, ...wordListRaw] = strs;
      const wordSet = new Set(wordListRaw);
      if (!wordSet.has(endWord)) return 0;
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      let queue = [beginWord];
      const visited = new Set([beginWord]);
      let steps = 1;
      while (queue.length) {
        const next = [];
        for (const word of queue) {
          if (word === endWord) return steps;
          for (let i = 0; i < word.length; i += 1) {
            for (const ch of alphabet) {
              if (ch === word[i]) continue;
              const candidate = word.slice(0, i) + ch + word.slice(i + 1);
              if (wordSet.has(candidate) && !visited.has(candidate)) {
                visited.add(candidate);
                next.push(candidate);
              }
            }
          }
        }
        queue = next;
        steps += 1;
      }
      return 0;
    },
    exampleExplanation: (rawArgs, result) =>
      result > 0
        ? `A shortest transformation sequence from "${rawArgs[0][0]}" to "${rawArgs[0][1]}" uses ${result} word(s).`
        : `No valid transformation sequence from "${rawArgs[0][0]}" to "${rawArgs[0][1]}" exists with this word list.`,
    edgeCases: [
      { args: [['hit', 'cog', 'hot', 'dot', 'dog', 'lot', 'log', 'cog']], kind: 'edge' },
      { args: [['hit', 'cog', 'hot', 'dot', 'dog', 'lot', 'log']], kind: 'edge' },
      { args: [['hot', 'dog', 'dot', 'dog']], kind: 'edge' },
      { args: [['a', 'c', 'a', 'b', 'c']], kind: 'edge' },
      { args: [['abc', 'xyz', 'abd', 'abe']], kind: 'edge' },
      { args: [['aaa', 'aab', 'aab']], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Network Delay Time',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'int', minN: 2, maxN: 8, maxWeight: 20, extraParams: [{}] },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 8);
      const maxEdges = cfg.maxEdges ?? n * 2;
      const m = randInt(rng, 1, maxEdges);
      const edgeSet = new Set();
      const edges = [];
      let guard = 0;
      while (edges.length < m && guard < m * 10 + 10) {
        guard += 1;
        const u = randInt(rng, 0, n - 1);
        const v = randInt(rng, 0, n - 1);
        if (u === v) continue; // no self-loops
        const key = `${u}-${v}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        const w = randInt(rng, 1, cfg.maxWeight ?? 20);
        edges.push([u, v, w]);
      }
      const k = randInt(rng, 0, n - 1);
      return [n, edges, [k]];
    },
    statement:
      'You are given `n` network nodes labeled `0` to `n - 1`, and a list of directed, weighted edges `times[i] = [u, v, w]` meaning it takes `w` time units for a signal to travel from node `u` to node `v`. A signal is sent from node `k`. Return the minimum time for **all** `n` nodes to receive the signal, or `-1` if some node can never receive it.',
    constraints:
      '- `1 <= n <= 200`\n- `1 <= w <= 100` for every edge, and edges have no self-loops.\n- `0 <= k <= n - 1`\n- Multiple edges between the same ordered pair may exist; the shortest one effectively "wins".',
    inputFormat: 'Line 1: `n m` (nodes, edges). Next `m` lines: `u v w` — a directed edge from `u` to `v` with travel time `w`. Final line: the source node `k`.',
    outputFormat: 'A single integer: the time for the signal to reach every node, or `-1` if that never happens.',
    hints: [
      'This is single-source shortest paths on a directed, positively-weighted graph — a classic use case for one specific algorithm.',
      "Dijkstra's algorithm: repeatedly pick the closest unvisited node, and relax (try to shorten) the distance to each of its neighbors.",
      "Once you have the shortest distance from `k` to every node, the answer is simply the largest of those distances — the last node to hear the signal is what sets the total delay. If any node is still unreachable (infinite distance), the answer is -1.",
    ],
    solutionApproach:
      "Run Dijkstra's algorithm from source `k`: initialize `dist[k] = 0` and everything else to infinity, then repeatedly select the unvisited node with the smallest tentative distance and relax its outgoing edges (`dist[v] = min(dist[v], dist[u] + w)`). Once every node has been finalized, the answer is `max(dist)` — the time for the last, farthest node to receive the signal — unless that maximum is still infinity, in which case some node is unreachable and the answer is `-1`. A simple O(n^2) array-scan Dijkstra is plenty fast for small graphs; a binary heap gets this to O((n + m) log n) for larger ones.",
    pythonSolutionCode:
      "def network_delay_time(n, times, k):\n    INF = float('inf')\n    dist = [INF] * n\n    dist[k] = 0\n    adj = [[] for _ in range(n)]\n    for u, v, w in times:\n        adj[u].append((v, w))\n    visited = [False] * n\n    for _ in range(n):\n        u = -1\n        for i in range(n):\n            if not visited[i] and (u == -1 or dist[i] < dist[u]):\n                u = i\n        if u == -1 or dist[u] == INF:\n            break\n        visited[u] = True\n        for v, w in adj[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    best = max(dist)\n    return -1 if best == INF else best\n",
    solve: (n, edges, k) => {
      const INF = Infinity;
      const dist = new Array(n).fill(INF);
      dist[k] = 0;
      const adj = Array.from({ length: n }, () => []);
      for (const [u, v, w] of edges) adj[u].push([v, w]);
      const visited = new Array(n).fill(false);
      for (let iter = 0; iter < n; iter += 1) {
        let u = -1;
        for (let i = 0; i < n; i += 1) {
          if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
        }
        if (u === -1 || dist[u] === INF) break;
        visited[u] = true;
        for (const [v, w] of adj[u]) {
          if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
      }
      const maxDist = Math.max(...dist);
      return maxDist === INF ? -1 : maxDist;
    },
    exampleExplanation: (rawArgs, result) =>
      result === -1
        ? `Starting from node ${rawArgs[2][0]}, at least one node can never receive the signal.`
        : `Starting from node ${rawArgs[2][0]}, every node has received the signal by time ${result}.`,
    edgeCases: [
      { args: [1, [], [0]], kind: 'edge' },
      { args: [2, [[0, 1, 1]], [0]], kind: 'edge' },
      { args: [2, [[0, 1, 1]], [1]], kind: 'edge' },
      { args: [4, [[1, 0, 1], [1, 2, 1], [2, 3, 1]], [1]], kind: 'edge' },
      { args: [3, [[0, 1, 5]], [0]], kind: 'edge' },
      { args: [2, [[0, 1, 5], [0, 1, 1]], [0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Cheapest Flights Within K Stops',
    shape: 'graph_edge_list_to_value',
    shapeConfig: { outputType: 'int', minN: 3, maxN: 8, maxPrice: 100, extraParams: [{}, {}, {}] },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 3, cfg.maxN ?? 8);
      const maxEdges = cfg.maxEdges ?? n * 2;
      const m = randInt(rng, 1, maxEdges);
      const edgeSet = new Set();
      const edges = [];
      let guard = 0;
      while (edges.length < m && guard < m * 10 + 10) {
        guard += 1;
        const u = randInt(rng, 0, n - 1);
        const v = randInt(rng, 0, n - 1);
        if (u === v) continue; // no self-loops
        const key = `${u}-${v}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        const price = randInt(rng, 1, cfg.maxPrice ?? 100);
        edges.push([u, v, price]);
      }
      let src = randInt(rng, 0, n - 1);
      let dst = randInt(rng, 0, n - 1);
      let guard2 = 0;
      while (dst === src && guard2 < 20) {
        dst = randInt(rng, 0, n - 1);
        guard2 += 1;
      }
      const k = randInt(rng, 0, n - 1);
      return [n, edges, [src, dst, k]];
    },
    statement:
      'There are `n` cities labeled `0` to `n - 1` connected by directed `flights[i] = [from, to, price]` routes. Given a source city `src`, a destination city `dst`, and an integer `k`, return the cheapest total price to travel from `src` to `dst` with **at most `k` stops** (i.e. at most `k + 1` flights). Return `-1` if no such route exists.',
    constraints:
      '- `1 <= n <= 100`\n- `1 <= price <= 10^4` per flight, no self-loop routes.\n- `0 <= k <= n - 1`\n- `src != dst`, unless a curated test explicitly checks the trivial `src == dst` case (cost `0`).',
    inputFormat: 'Line 1: `n m` (cities, flight routes). Next `m` lines: `from to price`. Final 3 lines: `src`, then `dst`, then `k`.',
    outputFormat: 'A single integer: the cheapest price within `k` stops, or `-1` if unreachable.',
    hints: [
      "Plain Dijkstra doesn't directly respect the stop limit — the cheapest overall path might use more stops than allowed, so you need to track cost *and* stops used together.",
      'Think of it as a limited Bellman-Ford: you\'re allowed at most `k + 1` "rounds" of relaxation, one per flight taken.',
      "Relax all edges using each round's *starting* distances (a snapshot from before this round), not values already updated during the same round — otherwise you could sneak in extra flights within one round without them counting as a stop.",
    ],
    solutionApproach:
      "This is Bellman-Ford with a bounded number of relaxation rounds. Initialize `dist[src] = 0` and everything else to infinity. Repeat `k + 1` times (at most `k` stops means at most `k + 1` flights): for every edge `(u, v, price)`, if `dist[u] + price` improves on `v`'s *current* best, record that improvement into a fresh snapshot array — critically, relax using the distances from the start of the round, not values already written this round, so a single round can only ever add one flight per path. After all rounds, `dist[dst]` (or `-1` if still infinite) is the answer. O(k * m) time.",
    pythonSolutionCode:
      "def find_cheapest_price(n, flights, src, dst, k):\n    INF = float('inf')\n    dist = [INF] * n\n    dist[src] = 0\n    for _ in range(k + 1):\n        next_dist = dist[:]\n        for u, v, price in flights:\n            if dist[u] != INF and dist[u] + price < next_dist[v]:\n                next_dist[v] = dist[u] + price\n        dist = next_dist\n    return -1 if dist[dst] == INF else dist[dst]\n",
    solve: (n, edges, src, dst, k) => {
      let dist = new Array(n).fill(Infinity);
      dist[src] = 0;
      for (let i = 0; i <= k; i += 1) {
        const next = dist.slice();
        for (const [u, v, w] of edges) {
          if (dist[u] !== Infinity && dist[u] + w < next[v]) {
            next[v] = dist[u] + w;
          }
        }
        dist = next;
      }
      return dist[dst] === Infinity ? -1 : dist[dst];
    },
    exampleExplanation: (rawArgs, result) => {
      const [, , k] = rawArgs[2];
      return result === -1
        ? `No route reaches the destination within ${k} stop(s).`
        : `The cheapest route within ${k} stop(s) costs ${result}.`;
    },
    edgeCases: [
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], [0, 2, 1]], kind: 'edge' },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], [0, 2, 0]], kind: 'edge' },
      { args: [3, [[0, 1, 100]], [0, 2, 1]], kind: 'edge' },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], [1, 1, 1]], kind: 'edge' },
      { args: [3, [[0, 1, 100], [0, 1, 10], [1, 2, 100]], [0, 2, 1]], kind: 'edge' },
      { args: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1]], [0, 3, 0]], kind: 'edge' },
    ],
  },
];
