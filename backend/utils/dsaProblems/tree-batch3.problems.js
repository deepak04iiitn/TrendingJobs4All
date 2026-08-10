import { randInt, buildTree, serializeTree, parseTreeLine, formatTreeLine } from '../dsaIOShapes.js';

/* --------------------------------------------------------------------------
 * Local helpers for generating random trees. These mirror the recursive
 * generation style used by the shared `binary_tree_to_value_or_array_or_tree`
 * shape's own `gen()` (backend/utils/dsaIOShapes.js) so that feeding the
 * resulting values array through `buildTree()` produces a well-formed,
 * deterministic tree given the same `rng`.
 * -------------------------------------------------------------------------- */

/** General (non-BST) random tree, values may repeat. `forceRoot` guarantees a non-null root. */
function genGeneralTreeValues(rng, cfg = {}) {
  const { maxNodes = 10, maxDepth = 4, min = -30, max = 30, nullChance = 0.3, forceRoot = false } = cfg;
  const values = [];
  let count = 0;
  const build = (depth, isRoot) => {
    const forced = isRoot && forceRoot;
    if (!forced && (count >= maxNodes || depth > maxDepth || rng() < nullChance)) {
      values.push(null);
      return;
    }
    values.push(randInt(rng, min, max));
    count += 1;
    build(depth + 1, false);
    build(depth + 1, false);
  };
  build(0, true);
  return values;
}

/** General random tree shape, but every filled slot gets a value drawn from a distinct pool
 * (no two nodes anywhere in the generated array share a value) — used where node identity is
 * looked up by value (e.g. LCA on a general binary tree). */
function genDistinctGeneralTreeValues(rng, cfg = {}) {
  const { maxNodes = 12, maxDepth = 4, min = -2000, max = 2000, nullChance = 0.3 } = cfg;
  const slots = [];
  let count = 0;
  const build = (depth, isRoot) => {
    if (!isRoot && (count >= maxNodes || depth > maxDepth || rng() < nullChance)) {
      slots.push(false);
      return;
    }
    slots.push(true);
    count += 1;
    build(depth + 1, false);
    build(depth + 1, false);
  };
  build(0, true);
  const filledCount = slots.filter(Boolean).length;
  const range = max - min + 1;
  const pool = [];
  const seen = new Set();
  while (pool.length < filledCount && pool.length < range) {
    const v = randInt(rng, min, max);
    if (!seen.has(v)) {
      seen.add(v);
      pool.push(v);
    }
  }
  let pi = 0;
  return slots.map((filled) => {
    if (!filled) return null;
    const v = pool[pi] ?? randInt(rng, min, max);
    pi += 1;
    return v;
  });
}

/** Height-balanced BST built from an already-sorted, distinct array of values. */
function buildBalancedBst(sortedVals) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    return { val: sortedVals[mid], left: build(lo, mid - 1), right: build(mid + 1, hi) };
  };
  return build(0, sortedVals.length - 1);
}

function collectNodes(root) {
  const nodes = [];
  const walk = (node) => {
    if (!node) return;
    nodes.push(node);
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return nodes;
}

/** Parses a "6 2 8 0 4 7 9 null null 3 5"-style line into a real tree node (or null). */
function parseTree(line) {
  return buildTree(parseTreeLine(line));
}

function sameTreeCheck(x, y) {
  if (!x && !y) return true;
  if (!x || !y) return false;
  return x.val === y.val && sameTreeCheck(x.left, y.left) && sameTreeCheck(x.right, y.right);
}

export default [
  {
    legacyProblemName: 'Same Tree',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', maxNodes: 10, maxDepth: 4, min: -30, max: 30, nullChance: 0.3 },
    genArgs: (rng, cfg) => {
      const valuesA = genGeneralTreeValues(rng, cfg);
      const same = rng() < 0.5;
      const valuesB = same ? valuesA.slice() : genGeneralTreeValues(rng, cfg);
      return [formatTreeLine(valuesA), formatTreeLine(valuesB)];
    },
    statement:
      "Given the roots of two binary trees `p` and `q`, return `true` if the trees are structurally identical and every corresponding pair of nodes holds the same value, and `false` otherwise.\n\nBoth trees are given in level order (BFS), one per input line, with `null` marking a missing child.",
    constraints: '- The number of nodes in each tree is in the range `[0, 100]`.\n- `-10^4 <= Node.val <= 10^4`.',
    inputFormat: "Line 1: tree `p`'s values in level order, space-separated, `null` for missing children. Line 2: tree `q`'s values in the same format.",
    outputFormat: '`true` or `false`.',
    hints: [
      "Two trees can only match if their shapes line up exactly — a missing child on one side must be missing on the other side too.",
      'Compare the two roots recursively: values must match, and both the left subtrees and the right subtrees must also match.',
      'The base cases are: two empty trees are trivially the same; one empty and one non-empty are never the same.',
    ],
    solutionApproach:
      "Recursively compare `p` and `q`: if both are null, they match. If exactly one is null, they don't. Otherwise they match only if `p.val === q.val` and the left subtrees match and the right subtrees match. O(min(n, m)) time since recursion stops as soon as a mismatch is found.",
    pythonSolutionCode:
      "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\n\ndef build_tree(line):\n    vals = [None if t == 'null' else int(t) for t in line.split()]\n    if not vals or vals[0] is None:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals):\n            lv = vals[i]; i += 1\n            if lv is not None:\n                node.left = TreeNode(lv)\n                queue.append(node.left)\n        if i < len(vals):\n            rv = vals[i]; i += 1\n            if rv is not None:\n                node.right = TreeNode(rv)\n                queue.append(node.right)\n    return root\n\n\ndef is_same_tree(p, q):\n    if p is None and q is None:\n        return True\n    if p is None or q is None:\n        return False\n    return p.val == q.val and is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)\n\n\ndef solve(line_p, line_q):\n    return is_same_tree(build_tree(line_p), build_tree(line_q))\n",
    solve: (a, b) => sameTreeCheck(parseTree(a), parseTree(b)),
    exampleExplanation: (args, result) =>
      result
        ? `Tree p = [${args[0]}] and tree q = [${args[1]}] have identical shape and values, so the answer is true.`
        : `Tree p = [${args[0]}] and tree q = [${args[1]}] differ in shape or in at least one value, so the answer is false.`,
    edgeCases: [
      { args: ['', ''], kind: 'edge' },
      { args: ['1', '1'], kind: 'edge' },
      { args: ['1', '2'], kind: 'edge' },
      { args: ['1 2 3', '1 2 3'], kind: 'edge' },
      { args: ['1 2', '1 null 2'], kind: 'edge' },
      { args: ['1 2 3', '1 2 4'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Subtree of Another Tree',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'bool', maxNodes: 12, maxDepth: 4, min: -30, max: 30, nullChance: 0.3 },
    genArgs: (rng, cfg) => {
      const bigValues = genGeneralTreeValues(rng, { ...cfg, forceRoot: true });
      const bigTree = buildTree(bigValues);
      const nodes = collectNodes(bigTree);
      const makeMatch = rng() < 0.6;
      let subValues;
      if (makeMatch && nodes.length) {
        const pick = nodes[randInt(rng, 0, nodes.length - 1)];
        subValues = serializeTree(pick);
      } else {
        subValues = genGeneralTreeValues(rng, {
          ...cfg,
          maxNodes: Math.max(1, Math.floor((cfg.maxNodes ?? 12) / 2)),
          forceRoot: true,
        });
      }
      return [formatTreeLine(bigValues), formatTreeLine(subValues)];
    },
    statement:
      'Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a node in `root` such that the subtree rooted at that node is identical (same shape and same values) to `subRoot`, and `false` otherwise.\n\nA subtree of a node includes that node and all of its descendants — it must match `subRoot` exactly, not just contain its values somewhere.',
    constraints:
      '- The number of nodes in `root` is in the range `[1, 2000]`.\n- The number of nodes in `subRoot` is in the range `[1, 1000]`.\n- `-10^4 <= Node.val <= 10^4`.',
    inputFormat: "Line 1: `root`'s values in level order, space-separated, `null` for missing children. Line 2: `subRoot`'s values in the same format.",
    outputFormat: '`true` or `false`.',
    hints: [
      'This builds directly on "Same Tree" — you need a same-tree check as a building block.',
      'Walk every node of `root`; at each one, ask "is the subtree starting here the same tree as subRoot?"',
      'If any node in `root` passes that same-tree check, the answer is true — otherwise, after checking every node, it is false.',
    ],
    solutionApproach:
      "Reuse a same-tree comparison as a helper. Do a traversal of `root` (any order works); at every visited node, run the same-tree check against `subRoot`. Return true the moment one matches. This is O(n * m) worst case (n nodes in root, m nodes in subRoot), since each same-tree check can itself take O(m) time.",
    pythonSolutionCode:
      "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\n\ndef build_tree(line):\n    vals = [None if t == 'null' else int(t) for t in line.split()]\n    if not vals or vals[0] is None:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals):\n            lv = vals[i]; i += 1\n            if lv is not None:\n                node.left = TreeNode(lv)\n                queue.append(node.left)\n        if i < len(vals):\n            rv = vals[i]; i += 1\n            if rv is not None:\n                node.right = TreeNode(rv)\n                queue.append(node.right)\n    return root\n\n\ndef is_same_tree(p, q):\n    if p is None and q is None:\n        return True\n    if p is None or q is None:\n        return False\n    return p.val == q.val and is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)\n\n\ndef is_subtree_at(node, sub):\n    if node is None:\n        return False\n    if is_same_tree(node, sub):\n        return True\n    return is_subtree_at(node.left, sub) or is_subtree_at(node.right, sub)\n\n\ndef solve(line_root, line_sub):\n    return is_subtree_at(build_tree(line_root), build_tree(line_sub))\n",
    solve: (root, subRoot) => {
      const t = parseTree(root);
      const sub = parseTree(subRoot);
      if (!sub) return true;
      const walk = (node) => {
        if (!node) return false;
        if (sameTreeCheck(node, sub)) return true;
        return walk(node.left) || walk(node.right);
      };
      return walk(t);
    },
    exampleExplanation: (args, result) =>
      result
        ? `Some node in root = [${args[0]}] roots a subtree that exactly matches subRoot = [${args[1]}], so the answer is true.`
        : `No node in root = [${args[0]}] roots a subtree matching subRoot = [${args[1]}] exactly, so the answer is false.`,
    edgeCases: [
      { args: ['3 4 5 1 2', '4 1 2'], kind: 'edge' },
      { args: ['3 4 5 1 2 null null null null null 0', '4 1 2'], kind: 'edge' },
      { args: ['1', '1'], kind: 'edge' },
      { args: ['1', '2'], kind: 'edge' },
      { args: ['1 2 3', '2'], kind: 'edge' },
      { args: ['1 2 3', '4'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Lowest Common Ancestor of BST',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', maxNodes: 15, min: -2000, max: 2000 },
    genArgs: (rng, cfg) => {
      const { maxNodes = 15, min = -2000, max = 2000 } = cfg;
      const range = max - min + 1;
      const cap = Math.max(3, Math.min(maxNodes, range - 1));
      const n = randInt(rng, 3, cap);
      const valuesSet = new Set();
      while (valuesSet.size < n) valuesSet.add(randInt(rng, min, max));
      const sorted = [...valuesSet].sort((x, y) => x - y);
      const root = buildBalancedBst(sorted);
      const treeVals = serializeTree(root);
      const p = sorted[randInt(rng, 0, sorted.length - 1)];
      const q = sorted[randInt(rng, 0, sorted.length - 1)];
      return [formatTreeLine(treeVals), `${p} ${q}`];
    },
    statement:
      'Given the root of a **binary search tree** and the values of two nodes `p` and `q` that are guaranteed to exist in it, return the value of their lowest common ancestor (LCA) — the deepest node that has both `p` and `q` as descendants (a node is allowed to be a descendant of itself).',
    constraints:
      '- The number of nodes is in the range `[3, 15]` (up to much larger in stress tests).\n- All node values are unique and the tree satisfies the BST property.\n- `p` and `q` both exist in the tree; `p` may equal `q`.',
    inputFormat: 'Line 1: the BST values in level order, space-separated, `null` for missing children. Line 2: two space-separated integers `p` and `q`.',
    outputFormat: 'A single integer: the value stored at the LCA node.',
    hints: [
      "The BST ordering property means you don't need to search both subtrees blindly like in a general tree.",
      'At any node, if both p and q are smaller than the node\'s value, the LCA must be in the left subtree; if both are larger, it must be in the right subtree.',
      "The first node where p and q split (one is <=, one is >=) — or where the node's value equals p or q — is the answer.",
    ],
    solutionApproach:
      'Start at the root and walk down using the BST property: while both `p` and `q` are strictly less than the current node, move left; while both are strictly greater, move right. As soon as that stops being true (the values straddle the current node, or the node equals one of them), the current node is the LCA. O(h) time where h is the tree height.',
    pythonSolutionCode:
      "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\n\ndef build_tree(line):\n    vals = [None if t == 'null' else int(t) for t in line.split()]\n    if not vals or vals[0] is None:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals):\n            lv = vals[i]; i += 1\n            if lv is not None:\n                node.left = TreeNode(lv)\n                queue.append(node.left)\n        if i < len(vals):\n            rv = vals[i]; i += 1\n            if rv is not None:\n                node.right = TreeNode(rv)\n                queue.append(node.right)\n    return root\n\n\ndef lca_bst(root, p, q):\n    node = root\n    while node:\n        if p < node.val and q < node.val:\n            node = node.left\n        elif p > node.val and q > node.val:\n            node = node.right\n        else:\n            return node.val\n    return None\n\n\ndef solve(line_tree, line_pq):\n    p, q = map(int, line_pq.split())\n    return lca_bst(build_tree(line_tree), p, q)\n",
    solve: (rootStr, pq) => {
      const [p, q] = pq.trim().split(/\s+/).map(Number);
      let node = parseTree(rootStr);
      while (node) {
        if (p < node.val && q < node.val) node = node.left;
        else if (p > node.val && q > node.val) node = node.right;
        else return node.val;
      }
      return null;
    },
    exampleExplanation: (args, result) => `For p, q = (${args[1]}) on the BST [${args[0]}], the lowest common ancestor holds value ${result}.`,
    edgeCases: [
      { args: ['6 2 8 0 4 7 9 null null 3 5', '2 8'], kind: 'edge' },
      { args: ['6 2 8 0 4 7 9 null null 3 5', '2 4'], kind: 'edge' },
      { args: ['2 1', '2 1'], kind: 'edge' },
      { args: ['5 3 6 2 4 null null 1', '3 4'], kind: 'edge' },
      { args: ['5 3 6 2 4 null null 1', '1 1'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Lowest Common Ancestor of Binary Tree',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', maxNodes: 14, maxDepth: 4, min: -2000, max: 2000, nullChance: 0.3 },
    genArgs: (rng, cfg) => {
      let values;
      let tree;
      let nodes;
      let guard = 0;
      do {
        values = genDistinctGeneralTreeValues(rng, cfg);
        tree = buildTree(values);
        nodes = collectNodes(tree);
        guard += 1;
      } while (nodes.length < 2 && guard < 30);
      if (nodes.length < 2) {
        values = [1, 2];
        tree = buildTree(values);
        nodes = collectNodes(tree);
      }
      const a = nodes[randInt(rng, 0, nodes.length - 1)];
      const b = nodes[randInt(rng, 0, nodes.length - 1)];
      return [formatTreeLine(values), `${a.val} ${b.val}`];
    },
    statement:
      'Given the root of a **general** binary tree (not necessarily a search tree) and the values of two nodes `p` and `q` guaranteed to exist in it, return the value of their lowest common ancestor — the deepest node that has both `p` and `q` as descendants (a node counts as its own descendant).\n\nAll node values in the tree are distinct, so a value uniquely identifies a node.',
    constraints:
      '- The number of nodes is in the range `[2, 14]` (up to much larger in stress tests).\n- All `Node.val` are unique.\n- `p != q`, and both values exist in the tree.',
    inputFormat: 'Line 1: the tree values in level order, space-separated, `null` for missing children. Line 2: two space-separated integers `p` and `q`.',
    outputFormat: 'A single integer: the value stored at the LCA node.',
    hints: [
      "Without a BST ordering, you can't decide which side to search — you may need to search the whole tree.",
      'Write a recursive function: if the current node is null, or its value is p or q, return it immediately.',
      'Otherwise recurse into both children; if BOTH sides return something non-null, the current node is the split point (the LCA). If only one side returns non-null, pass that result upward.',
    ],
    solutionApproach:
      "Post-order recursion: `find(node)` returns node itself if it's null or equals p/q, otherwise recurses into left and right. If both recursive calls return non-null, the current node is the LCA (p and q are on opposite sides). If only one is non-null, that's the answer bubbling up (one of p/q is an ancestor of the other, or the split happened lower down). O(n) time — every node is visited once.",
    pythonSolutionCode:
      "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\n\ndef build_tree(line):\n    vals = [None if t == 'null' else int(t) for t in line.split()]\n    if not vals or vals[0] is None:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals):\n            lv = vals[i]; i += 1\n            if lv is not None:\n                node.left = TreeNode(lv)\n                queue.append(node.left)\n        if i < len(vals):\n            rv = vals[i]; i += 1\n            if rv is not None:\n                node.right = TreeNode(rv)\n                queue.append(node.right)\n    return root\n\n\ndef lca(node, p, q):\n    if node is None or node.val == p or node.val == q:\n        return node\n    left = lca(node.left, p, q)\n    right = lca(node.right, p, q)\n    if left and right:\n        return node\n    return left or right\n\n\ndef solve(line_tree, line_pq):\n    p, q = map(int, line_pq.split())\n    return lca(build_tree(line_tree), p, q).val\n",
    solve: (rootStr, pq) => {
      const [p, q] = pq.trim().split(/\s+/).map(Number);
      const find = (node) => {
        if (!node || node.val === p || node.val === q) return node;
        const left = find(node.left);
        const right = find(node.right);
        if (left && right) return node;
        return left || right;
      };
      const res = find(parseTree(rootStr));
      return res ? res.val : null;
    },
    exampleExplanation: (args, result) => `For p, q = (${args[1]}) on the tree [${args[0]}], the lowest common ancestor holds value ${result}.`,
    edgeCases: [
      { args: ['3 5 1 6 2 0 8 null null 7 4', '5 1'], kind: 'edge' },
      { args: ['3 5 1 6 2 0 8 null null 7 4', '5 4'], kind: 'edge' },
      { args: ['1 2', '1 2'], kind: 'edge' },
      { args: ['1 null 2', '1 2'], kind: 'edge' },
      { args: ['4 2 7 1 3 6 9', '1 3'], kind: 'edge' },
      { args: ['4 2 7 1 3 6 9', '1 9'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Right Side View',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 15, maxDepth: 4, min: -50, max: 50 },
    statement:
      "Given the `root` of a binary tree, imagine standing to its right side. Return the values of the nodes you can see, ordered from the topmost level to the bottommost — that is, for every level, the rightmost node visible on that level.",
    constraints: '- The number of nodes is in the range `[0, 100]`.\n- `-100 <= Node.val <= 100`.',
    inputFormat: 'Line 1: the tree in level order, space-separated, `null` marking missing children.',
    outputFormat: 'The right-side-view values, one per level from top to bottom, space-separated (empty line if the tree is empty).',
    hints: [
      "This is really about processing the tree level by level, not node by node.",
      'A breadth-first traversal naturally groups nodes by level — the last node processed at each level is the one visible from the right.',
      'Alternative: a depth-first traversal that visits right-before-left, recording the first node seen at each new depth, also works.',
    ],
    solutionApproach:
      "Run a level-order (BFS) traversal. At each level, keep track of every node's value in visiting order, and take the last one — that's the one visible from the right side of the tree (nothing to its right blocks the view). Move on to the next level using that level's children. O(n) time, O(w) space where w is the widest level.",
    pythonSolutionCode:
      'def right_side_view(root):\n    if root is None:\n        return []\n    result = []\n    level = [root]\n    while level:\n        result.append(level[-1].val)\n        next_level = []\n        for node in level:\n            if node.left:\n                next_level.append(node.left)\n            if node.right:\n                next_level.append(node.right)\n        level = next_level\n    return result\n',
    solve: function solve(root) {
      if (!root) return [];
      const result = [];
      let level = [root];
      while (level.length) {
        result.push(level[level.length - 1].val);
        const next = [];
        for (const node of level) {
          if (node.left) next.push(node.left);
          if (node.right) next.push(node.right);
        }
        level = next;
      }
      return result;
    },
    exampleExplanation: (args, result) => `Looking at the tree from the right, you would see, top to bottom: [${result.join(', ')}].`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[1, null, 3]], kind: 'edge' },
      { args: [[1, 2, 3, 4, null, null, null, 5]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Serialize and Deserialize Binary Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'tree', maxNodes: 12, maxDepth: 4, min: -1000, max: 1000 },
    statement:
      "Design an algorithm to serialize a binary tree into a string and deserialize that string back into a tree with the exact same structure and node values.\n\nOn this platform, the wire format is fixed so answers can be graded automatically: it's the same level-order layout used for input everywhere else on this site (values in BFS order, `null` marking a missing child, trailing nulls trimmed). Your program reads a tree in that format and must print it back out in that same format after round-tripping it through your own internal representation — you're free to use any internal encoding you like (preorder with markers, level order, parenthesized, etc.) as long as the final printed tree matches.",
    constraints:
      '- The number of nodes is in the range `[0, 10^4]` (kept small here for judging speed).\n- `-1000 <= Node.val <= 1000`.\n- The output must describe a tree structurally and value-wise identical to the input.',
    inputFormat: 'Line 1: the tree in level order, space-separated, `null` marking missing children (e.g. `1 2 3 null null 4 5`).',
    outputFormat: 'The same tree, re-serialized in level order with trailing nulls trimmed (empty line for an empty tree).',
    hints: [
      "You need two matching functions: one that turns a tree into a string, and one that turns that exact string back into a tree — design them together.",
      'A preorder traversal that emits an explicit marker (e.g. "#") for every null child is easy to both produce and parse back, because it tells you exactly when to stop building each subtree.',
      "When deserializing, consume the tokens with a single shared pointer/index as you recursively rebuild: read a value, build the node, then recursively build its left subtree, then its right subtree.",
    ],
    solutionApproach:
      'A clean approach (independent of the platform\'s own level-order wire format) is preorder serialization with null markers: recursively emit `node.val` then recurse left then right, emitting `"#"` for every null. Deserializing reverses this: pop the next token — if it\'s `"#"` return null, otherwise create a node from it and recursively fill its left and right children from the remaining tokens, in that same order. Both directions are O(n), and because every null is written explicitly, the token stream uniquely determines the tree shape with no ambiguity.',
    pythonSolutionCode:
      "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\n\ndef serialize(root):\n    out = []\n\n    def go(node):\n        if node is None:\n            out.append('#')\n            return\n        out.append(str(node.val))\n        go(node.left)\n        go(node.right)\n\n    go(root)\n    return ','.join(out)\n\n\ndef deserialize(data):\n    tokens = iter(data.split(','))\n\n    def go():\n        token = next(tokens)\n        if token == '#':\n            return None\n        node = TreeNode(int(token))\n        node.left = go()\n        node.right = go()\n        return node\n\n    return go()\n\n\ndef solve(root):\n    # Round trip through our own preorder format; the platform re-serializes\n    # the resulting tree back into level order for grading.\n    return deserialize(serialize(root))\n",
    solve: function solve(root) {
      const tokens = [];
      const ser = (node) => {
        if (!node) {
          tokens.push('#');
          return;
        }
        tokens.push(String(node.val));
        ser(node.left);
        ser(node.right);
      };
      ser(root);
      let idx = 0;
      const de = () => {
        const token = tokens[idx];
        idx += 1;
        if (token === '#') return null;
        const node = { val: Number(token), left: null, right: null };
        node.left = de();
        node.right = de();
        return node;
      };
      return de();
    },
    exampleExplanation: () => 'The tree is serialized to a string and deserialized back, producing a structurally identical tree.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[1, null, 2]], kind: 'edge' },
      { args: [[5, 4, 7, 3, null, 2, null, -1, null, 9]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Maximum Path Sum',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'int', maxNodes: 10, maxDepth: 4, min: -30, max: 30 },
    genArgs: (rng, cfg) => [genGeneralTreeValues(rng, { ...cfg, forceRoot: true })],
    statement:
      'A **path** in a binary tree is any sequence of nodes connected by parent-child edges, where each node appears at most once; the path does not need to pass through the root, and does not need to start or end at a leaf.\n\nGiven the `root` of a binary tree, return the maximum possible sum of node values along any path in the tree.',
    constraints: '- The number of nodes is in the range `[1, 3*10^4]`.\n- `-1000 <= Node.val <= 1000`.',
    inputFormat: 'Line 1: the tree in level order, space-separated, `null` marking missing children.',
    outputFormat: 'A single integer: the maximum path sum.',
    hints: [
      "A path can bend at most once — at its single highest point — so think about what each node can contribute both 'through itself' and 'upward to a parent'.",
      'For each node, compute the best sum you can extend *upward* through it: its own value plus the better of its two children\'s best downward contributions (never both, and never negative).',
      "While computing that, also check whether using BOTH children at this node (val + left-contribution + right-contribution) beats your best-answer-so-far — that captures paths that bend at this node, even though such a bent path can't be extended further up.",
    ],
    solutionApproach:
      "Do a post-order DFS. For each node, compute `gain(node)` = the maximum sum of a downward path starting at `node` that a parent could use — `node.val + max(0, gain(left), gain(right))` (clamping negative contributions to 0, since a parent is free to not extend into a subtree that only hurts the sum). While computing this, also update a global best answer with `node.val + max(0, gain(left)) + max(0, gain(right))`, which accounts for a path that bends downward on both sides at this node. O(n) time, O(h) recursion stack.",
    pythonSolutionCode:
      'def max_path_sum(root):\n    best = float("-inf")\n\n    def gain(node):\n        nonlocal best\n        if node is None:\n            return 0\n        left = max(gain(node.left), 0)\n        right = max(gain(node.right), 0)\n        best = max(best, node.val + left + right)\n        return node.val + max(left, right)\n\n    gain(root)\n    return best\n',
    solve: function solve(root) {
      let best = -Infinity;
      const gain = (node) => {
        if (!node) return 0;
        const left = Math.max(gain(node.left), 0);
        const right = Math.max(gain(node.right), 0);
        best = Math.max(best, node.val + left + right);
        return node.val + Math.max(left, right);
      };
      gain(root);
      return best;
    },
    exampleExplanation: (args, result) => `The best path through this tree sums to ${result}.`,
    edgeCases: [
      { args: [[-3]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[-10, 9, 20, null, null, 15, 7]], kind: 'edge' },
      { args: [[2, -1]], kind: 'edge' },
      { args: [[-1, -2, -3]], kind: 'edge' },
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Flatten Binary Tree to Linked List',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'tree', maxNodes: 12, maxDepth: 4, min: -100, max: 100 },
    statement:
      'Given the `root` of a binary tree, flatten it in place into a "linked list" that follows the same order as a preorder traversal: every node\'s `left` child becomes `null`, and every node\'s `right` child points to the next node in preorder order.\n\nReturn the root of the flattened tree.',
    constraints: '- The number of nodes is in the range `[0, 2000]`.\n- `-100 <= Node.val <= 100`.',
    inputFormat: 'Line 1: the tree in level order, space-separated, `null` marking missing children.',
    outputFormat: 'The flattened tree, printed in the same level-order format (since every left pointer is null, this prints as a chain of `val null val null ...`, trailing nulls trimmed).',
    hints: [
      "Preorder visits a node, then its whole left subtree, then its whole right subtree — that's exactly the order the final chain needs to follow.",
      'Processing the tree in reverse preorder (right subtree, then left subtree, then the node itself) lets you build the chain backwards while only needing to remember the previously-linked node.',
      "For each node (visited in that reverse order): point its right child at the node you linked last, set its left child to null, then mark this node as the new 'last linked' node.",
    ],
    solutionApproach:
      "Traverse in reverse preorder (right subtree first, then left subtree, then the node itself), keeping a `prev` pointer to the most recently linked node. At each node: set `node.right = prev`, `node.left = null`, then `prev = node`. Because right is processed before left, `prev` always holds the correct 'next node in preorder' by the time you reach `node`. After the traversal finishes, `prev` (and the original `root`) is the head of the flattened list. O(n) time, O(h) recursion stack.",
    pythonSolutionCode:
      'def flatten(root):\n    prev = None\n\n    def go(node):\n        nonlocal prev\n        if node is None:\n            return\n        go(node.right)\n        go(node.left)\n        node.right = prev\n        node.left = None\n        prev = node\n\n    go(root)\n    return root\n',
    solve: function solve(root) {
      let prev = null;
      const go = (node) => {
        if (!node) return;
        go(node.right);
        go(node.left);
        node.right = prev;
        node.left = null;
        prev = node;
      };
      go(root);
      return root;
    },
    exampleExplanation: () => "The tree's nodes are relinked into a right-only chain following preorder order.",
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[1, null, 2]], kind: 'edge' },
      { args: [[1, 2, 5, 3, 4, null, 6]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Kth Smallest Element in BST',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'int', maxNodes: 15, min: -2000, max: 2000 },
    genArgs: (rng, cfg) => {
      const { maxNodes = 15, min = -2000, max = 2000 } = cfg;
      const range = max - min + 1;
      const cap = Math.max(1, Math.min(maxNodes, range - 1));
      const n = randInt(rng, 1, cap);
      const valuesSet = new Set();
      while (valuesSet.size < n) valuesSet.add(randInt(rng, min, max));
      const sorted = [...valuesSet].sort((x, y) => x - y);
      const root = buildBalancedBst(sorted);
      const treeVals = serializeTree(root);
      const k = randInt(rng, 1, n);
      return [formatTreeLine(treeVals), `${k}`];
    },
    statement:
      "Given the root of a **binary search tree** and an integer `k`, return the `k`th smallest value stored in it (1-indexed — `k = 1` means the smallest value).",
    constraints: '- The number of nodes is in the range `[1, 15]` (up to much larger in stress tests).\n- All node values are unique and the tree satisfies the BST property.\n- `1 <= k <= ` number of nodes.',
    inputFormat: 'Line 1: the BST values in level order, space-separated, `null` for missing children. Line 2: the integer `k`.',
    outputFormat: 'A single integer: the kth smallest value in the tree.',
    hints: [
      "A binary search tree has a property that makes one traversal order visit every node's value in strictly increasing order — which one?",
      'An in-order traversal (left, node, right) of a BST visits values from smallest to largest.',
      "You don't need to collect every value first — you can stop the traversal as soon as you've visited the kth node.",
    ],
    solutionApproach:
      "Perform an in-order traversal (left subtree, then the node, then right subtree) — this visits BST values in ascending order. Keep a counter that increments each time you visit a node, and return the value the moment the counter reaches `k` (short-circuiting the rest of the traversal). O(h + k) time where h is the tree height.",
    pythonSolutionCode:
      'def kth_smallest(root, k):\n    count = 0\n    result = None\n    stack = []\n    node = root\n    while stack or node:\n        while node:\n            stack.append(node)\n            node = node.left\n        node = stack.pop()\n        count += 1\n        if count == k:\n            return node.val\n        node = node.right\n    return result\n',
    solve: (rootStr, kStr) => {
      const k = Number(kStr.trim());
      let count = 0;
      let result = null;
      const stack = [];
      let node = parseTree(rootStr);
      while ((stack.length || node) && result === null) {
        while (node) {
          stack.push(node);
          node = node.left;
        }
        node = stack.pop();
        count += 1;
        if (count === k) {
          result = node.val;
          break;
        }
        node = node.right;
      }
      return result;
    },
    exampleExplanation: (args, result) => `Reading the BST [${args[0]}] from smallest to largest, the ${args[1]}th value encountered is ${result}.`,
    edgeCases: [
      { args: ['3 1 4 null 2', '1'], kind: 'edge' },
      { args: ['5 3 6 2 4 null null 1', '3'], kind: 'edge' },
      { args: ['1', '1'], kind: 'edge' },
      { args: ['2 1 3', '2'], kind: 'edge' },
      { args: ['2 1 3', '3'], kind: 'edge' },
    ],
  },
];
