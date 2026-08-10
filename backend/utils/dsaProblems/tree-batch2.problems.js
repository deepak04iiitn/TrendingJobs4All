import { randInt, getShape, serializeTree } from '../dsaIOShapes.js';

/** Distinct sorted values sampled from [lo, hi], capped to the available range. */
function randDistinctSorted(rng, n, lo, hi) {
  const range = hi - lo + 1;
  const count = Math.max(1, Math.min(n, range));
  const set = new Set();
  while (set.size < count) set.add(randInt(rng, lo, hi));
  return [...set].sort((a, b) => a - b);
}

/** Builds a real, balanced, strictly-ordered BST node tree from sorted distinct values. */
function buildBalancedBst(sortedVals) {
  if (!sortedVals.length) return null;
  const mid = Math.floor(sortedVals.length / 2);
  return {
    val: sortedVals[mid],
    left: buildBalancedBst(sortedVals.slice(0, mid)),
    right: buildBalancedBst(sortedVals.slice(mid + 1)),
  };
}

export default [
  {
    legacyProblemName: 'Minimum Depth of Binary Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'int', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement:
      "Given the `root` of a binary tree, return its minimum depth — the number of nodes along the shortest path from the root down to the nearest leaf node.\n\nA leaf is a node with no children. Note that a node with only **one** child is not a leaf, so the path must continue down that child even though the other side is missing.",
    constraints: '- The number of nodes is in the range `[0, 10^5]`.\n- `-1000 <= Node.val <= 1000`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children, e.g. `3 9 20 null null 15 7`.',
    outputFormat: 'A single integer: the minimum depth (0 for an empty tree).',
    hints: [
      'Depth-first recursion works, but be careful with nodes that have only one child.',
      "If a node has no left child, you can't stop there just because the left side is missing — the minimum depth must go through the child that actually exists.",
      'Only take `min(left, right)` when BOTH children exist; otherwise recurse into whichever single child is present.',
    ],
    solutionApproach:
      "Recurse with a rule that mirrors the leaf definition exactly: an empty tree has depth 0. If a node is missing its left child, its minimum depth is `1 + minDepth(right)`; if missing its right child, it's `1 + minDepth(left)`. Only when both children exist do you take `1 + min(minDepth(left), minDepth(right))`. This avoids the classic bug of returning a false depth of 1 through a node that only has one child. O(n) time, O(h) recursion stack.",
    pythonSolutionCode:
      'def min_depth(root):\n    if not root:\n        return 0\n    if not root.left:\n        return 1 + min_depth(root.right)\n    if not root.right:\n        return 1 + min_depth(root.left)\n    return 1 + min(min_depth(root.left), min_depth(root.right))\n',
    solve: function solve(root) {
      if (!root) return 0;
      if (!root.left) return 1 + solve(root.right);
      if (!root.right) return 1 + solve(root.left);
      return 1 + Math.min(solve(root.left), solve(root.right));
    },
    exampleExplanation: (args, result) => `The shortest root-to-leaf path visits ${result} node(s).`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2]], kind: 'edge' },
      { args: [[2, null, 3, null, 4, null, 5, null, 6]], kind: 'edge' },
      { args: [[3, 9, 20, null, null, 15, 7]], kind: 'edge' },
      { args: [[1, null, 2, null, 3]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Validate Binary Search Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'bool', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      // Half the time build a genuinely valid BST; the other half, fall back to the
      // shape's own random-tree generator (usually invalid) so both outcomes get exercised.
      if (rng() < 0.5) {
        const n = randInt(rng, 1, cfg.maxNodes ?? 12);
        const vals = randDistinctSorted(rng, n, cfg.min ?? -50, cfg.max ?? 50);
        return [serializeTree(buildBalancedBst(vals))];
      }
      return getShape('binary_tree_to_value_or_array_or_tree').gen(rng, cfg);
    },
    statement:
      "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows: for every node, **all** values in its left subtree are strictly less than the node's value, **all** values in its right subtree are strictly greater than the node's value, and both the left and right subtrees are themselves valid BSTs. Equal values are not allowed anywhere in the ancestor chain.",
    constraints: '- The number of nodes is in the range `[1, 10^4]`.\n- `-2^31 <= Node.val <= 2^31 - 1`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: '`true` or `false`.',
    hints: [
      "Checking only `node.left.val < node.val < node.right.val` at each node is not enough — a node deep in the left subtree could still violate an ancestor further up.",
      'Every node really needs a valid *range* it must fall within, inherited and narrowed from its ancestors.',
      'Recurse with `(node, lowerBound, upperBound)`: going left tightens the upper bound to the current value, going right tightens the lower bound.',
    ],
    solutionApproach:
      "Recurse carrying an open interval `(lo, hi)` that the current node's value must fall strictly inside. The root starts unbounded. Moving to a left child narrows the interval to `(lo, node.val)`; moving to a right child narrows it to `(node.val, hi)`. A node fails validation the moment its value is `<= lo` or `>= hi`. This correctly rejects the classic trap where a node's immediate parent looks fine but a value violates a grandparent's constraint. O(n) time, O(h) space.",
    pythonSolutionCode:
      "def is_valid_bst(root):\n    def valid(node, lo, hi):\n        if not node:\n            return True\n        if node.val <= lo or node.val >= hi:\n            return False\n        return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)\n    return valid(root, float('-inf'), float('inf'))\n",
    solve: function solve(root) {
      function valid(node, lo, hi) {
        if (!node) return true;
        if (node.val <= lo || node.val >= hi) return false;
        return valid(node.left, lo, node.val) && valid(node.right, node.val, hi);
      }
      return valid(root, -Infinity, Infinity);
    },
    exampleExplanation: (args, result) =>
      result ? 'Every node respects the strict ordering required of a valid BST.' : 'Some node violates the BST ordering property relative to one of its ancestors.',
    edgeCases: [
      { args: [[2, 1, 3]], kind: 'edge' },
      { args: [[5, 1, 4, null, null, 3, 6]], kind: 'edge' },
      { args: [[1, 1]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[10, 5, 15, null, null, 6, 20]], kind: 'edge' },
      { args: [[3, 1, 5, 0, 2, 4, 6]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Inorder Traversal',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement:
      'Given the `root` of a binary tree, return the values of its nodes visited in **inorder** — left subtree, then the node itself, then right subtree.',
    constraints: '- The number of nodes is in the range `[0, 100]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: 'The visited values, in inorder, space-separated (empty line for an empty tree).',
    hints: [
      'Inorder visits the entire left subtree before the node itself, and the entire right subtree after.',
      'A direct recursive definition falls straight out of that ordering: `visit(left)`, then the node, then `visit(right)`.',
      'If you need an iterative version instead, an explicit stack that keeps pushing left children before ever visiting a node reproduces the same order.',
    ],
    solutionApproach:
      'Recursively traverse: fully visit the left subtree, record the current node\'s value, then fully visit the right subtree. For an iterative alternative, push a `(node)` onto an explicit stack while descending left; when you can go no further left, pop, record, and move to the right child. Both are O(n) time, O(h) space.',
    pythonSolutionCode:
      'def inorder_traversal(root):\n    res = []\n    def visit(node):\n        if not node:\n            return\n        visit(node.left)\n        res.append(node.val)\n        visit(node.right)\n    visit(root)\n    return res\n',
    solve: function solve(root) {
      const res = [];
      (function visit(node) {
        if (!node) return;
        visit(node.left);
        res.push(node.val);
        visit(node.right);
      })(root);
      return res;
    },
    exampleExplanation: (args, result) => `Visiting left, then node, then right across the whole tree yields [${result.join(', ')}].`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, null, 2, null, null, 3]], kind: 'edge' },
      { args: [[1, 2, null, 3]], kind: 'edge' },
      { args: [[5, 3, 8, 1, 4, 7, 9]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Preorder Traversal',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement:
      'Given the `root` of a binary tree, return the values of its nodes visited in **preorder** — the node itself, then its left subtree, then its right subtree.',
    constraints: '- The number of nodes is in the range `[0, 100]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: 'The visited values, in preorder, space-separated (empty line for an empty tree).',
    hints: [
      'Preorder records a node the moment you arrive at it, before descending into either subtree.',
      'The recursive shape is: record the node, then recurse left, then recurse right.',
      'Iteratively, a stack works too — just make sure you push the right child before the left child so the left one gets popped (and visited) first.',
    ],
    solutionApproach:
      "Recursively traverse: record the current node's value first, then fully visit the left subtree, then fully visit the right subtree. Iteratively, use an explicit stack: pop a node, record it, then push its right child followed by its left child (so the left child is popped next). O(n) time, O(h) space.",
    pythonSolutionCode:
      'def preorder_traversal(root):\n    res = []\n    def visit(node):\n        if not node:\n            return\n        res.append(node.val)\n        visit(node.left)\n        visit(node.right)\n    visit(root)\n    return res\n',
    solve: function solve(root) {
      const res = [];
      (function visit(node) {
        if (!node) return;
        res.push(node.val);
        visit(node.left);
        visit(node.right);
      })(root);
      return res;
    },
    exampleExplanation: (args, result) => `Visiting each node before its children gives [${result.join(', ')}].`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, null, 2, null, null, 3]], kind: 'edge' },
      { args: [[1, 2, null, 3]], kind: 'edge' },
      { args: [[5, 3, 8, 1, 4, 7, 9]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Postorder Traversal',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement:
      'Given the `root` of a binary tree, return the values of its nodes visited in **postorder** — the left subtree, then the right subtree, then the node itself.',
    constraints: '- The number of nodes is in the range `[0, 100]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: 'The visited values, in postorder, space-separated (empty line for an empty tree).',
    hints: [
      'A node is only recorded after both of its subtrees have been fully visited.',
      'The recursive shape is: recurse left, then recurse right, then finally record the node.',
      'Iteratively, one trick is to do a "reversed preorder" (node, right, left) while pushing to the front of the result, or prepending — that produces postorder without a second pass.',
    ],
    solutionApproach:
      "Recursively traverse: fully visit the left subtree, then fully visit the right subtree, then record the current node's value last. An iterative approach can compute a (node, right, left) traversal onto a stack and reverse the collected output at the end, since that is the exact mirror of postorder. O(n) time, O(h) space.",
    pythonSolutionCode:
      'def postorder_traversal(root):\n    res = []\n    def visit(node):\n        if not node:\n            return\n        visit(node.left)\n        visit(node.right)\n        res.append(node.val)\n    visit(root)\n    return res\n',
    solve: function solve(root) {
      const res = [];
      (function visit(node) {
        if (!node) return;
        visit(node.left);
        visit(node.right);
        res.push(node.val);
      })(root);
      return res;
    },
    exampleExplanation: (args, result) => `Visiting both children before their parent gives [${result.join(', ')}].`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, null, 2, null, null, 3]], kind: 'edge' },
      { args: [[1, 2, null, 3]], kind: 'edge' },
      { args: [[5, 3, 8, 1, 4, 7, 9]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Level Order Traversal',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 14, maxDepth: 4, min: -50, max: 50 },
    statement:
      "Given the `root` of a binary tree, return the values of its nodes grouped level by level, from top to bottom. Within a level, values are ordered left to right.",
    constraints: '- The number of nodes is in the range `[0, 2000]`.\n- `-1000 <= Node.val <= 1000`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat:
      'One line: each level printed left-to-right with its values comma-separated, and levels separated by a single space — e.g. `3 9,20 15,7` for the tree `[3,9,20,null,null,15,7]` (an empty tree prints an empty line).',
    hints: [
      "Processing level by level is a strong hint toward breadth-first search rather than depth-first recursion.",
      'Keep a queue of "the nodes at the current level". Before draining it, record how many nodes belong to this level so you know exactly where the level ends.',
      "For each node you dequeue from the current level, push its children onto a separate queue for the next level, then swap queues once the current one is empty.",
    ],
    solutionApproach:
      "Do a standard BFS with a queue, but process it one full level at a time: capture the current queue as 'this level', collect every node's value, and while doing so enqueue their children into a fresh queue for the next round. Repeat until the queue is empty. O(n) time and space.",
    pythonSolutionCode:
      'def level_order(root):\n    if not root:\n        return []\n    res = []\n    queue = [root]\n    while queue:\n        level = []\n        nxt = []\n        for node in queue:\n            level.append(node.val)\n            if node.left:\n                nxt.append(node.left)\n            if node.right:\n                nxt.append(node.right)\n        res.append(level)\n        queue = nxt\n    return res\n',
    solve: function solve(root) {
      if (!root) return [];
      const res = [];
      let queue = [root];
      while (queue.length) {
        const level = [];
        const next = [];
        for (const node of queue) {
          level.push(node.val);
          if (node.left) next.push(node.left);
          if (node.right) next.push(node.right);
        }
        res.push(level);
        queue = next;
      }
      return res;
    },
    exampleExplanation: (args, result) => `The tree has ${result.length} level(s), printed top to bottom, left to right within each level.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[3, 9, 20, null, null, 15, 7]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
      { args: [[1, null, 2, null, 3, null, 4]], kind: 'edge' },
      { args: [[1, 2, null, 3, null, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Binary Tree Zigzag Level Order Traversal',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'array', maxNodes: 14, maxDepth: 4, min: -50, max: 50 },
    statement:
      "Given the `root` of a binary tree, return its node values grouped level by level, but alternate the direction each level is printed in: the first level left to right, the second level right to left, the third left to right again, and so on.",
    constraints: '- The number of nodes is in the range `[0, 2000]`.\n- `-1000 <= Node.val <= 1000`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat:
      'One line: each level\'s values comma-separated (already in their printed, possibly reversed, order), levels separated by a single space — e.g. `3 20,9 15,7` for the tree `[3,9,20,null,null,15,7]` (an empty tree prints an empty line).',
    hints: [
      'Start from a plain breadth-first, level-by-level traversal — the grouping into levels is identical to standard level order.',
      "The only difference is cosmetic: every other level needs to be reversed before you record it.",
      'Track a boolean that flips after each level, and reverse the collected values for that level whenever it is false.',
    ],
    solutionApproach:
      "Run the same level-by-level BFS as standard level order traversal, collecting each level's values left to right as you dequeue nodes and enqueue their children. Keep a toggling flag starting at 'left to right'; before pushing a completed level into the result, reverse it if the flag says this level should read right to left, then flip the flag for next time. O(n) time and space.",
    pythonSolutionCode:
      'def zigzag_level_order(root):\n    if not root:\n        return []\n    res = []\n    queue = [root]\n    left_to_right = True\n    while queue:\n        vals = []\n        nxt = []\n        for node in queue:\n            vals.append(node.val)\n            if node.left:\n                nxt.append(node.left)\n            if node.right:\n                nxt.append(node.right)\n        if not left_to_right:\n            vals.reverse()\n        res.append(vals)\n        queue = nxt\n        left_to_right = not left_to_right\n    return res\n',
    solve: function solve(root) {
      if (!root) return [];
      const res = [];
      let queue = [root];
      let leftToRight = true;
      while (queue.length) {
        const vals = [];
        const next = [];
        for (const node of queue) {
          vals.push(node.val);
          if (node.left) next.push(node.left);
          if (node.right) next.push(node.right);
        }
        if (!leftToRight) vals.reverse();
        res.push(vals);
        queue = next;
        leftToRight = !leftToRight;
      }
      return res;
    },
    exampleExplanation: (args, result) => `The tree has ${result.length} level(s), alternating printed direction starting left-to-right.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[3, 9, 20, null, null, 15, 7]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
      { args: [[1, null, 2, null, 3, null, 4]], kind: 'edge' },
      { args: [[1, 2, null, 3, null, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Symmetric Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'bool', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement:
      "Given the `root` of a binary tree, return `true` if it is a mirror of itself — the left subtree is a structural and value mirror image of the right subtree — and `false` otherwise.",
    constraints: '- The number of nodes is in the range `[1, 1000]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: '`true` or `false`.',
    hints: [
      "Comparing the tree to itself directly doesn't make sense — instead compare the left subtree against the right subtree as mirror images of each other.",
      'Write a helper that checks whether two subtrees are mirrors: it needs both nodes to exist with equal values (or both be null), AND the outer pair (left.left vs right.right) must mirror, AND the inner pair (left.right vs right.left) must mirror.',
      'That crossed pairing — left.left with right.right, left.right with right.left — is exactly what makes it a mirror check rather than a plain equality check.',
    ],
    solutionApproach:
      "Define a helper `isMirror(a, b)` that returns true when both nodes are null, false when exactly one is null or their values differ, and otherwise recurses as `isMirror(a.left, b.right) && isMirror(a.right, b.left)` — the crossed pairing is what captures mirroring rather than plain equality. The answer is `isMirror(root.left, root.right)` (an empty tree is trivially symmetric). O(n) time, O(h) space.",
    pythonSolutionCode:
      'def is_symmetric(root):\n    def is_mirror(a, b):\n        if not a and not b:\n            return True\n        if not a or not b:\n            return False\n        return a.val == b.val and is_mirror(a.left, b.right) and is_mirror(a.right, b.left)\n    if not root:\n        return True\n    return is_mirror(root.left, root.right)\n',
    solve: function solve(root) {
      function isMirror(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        return a.val === b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
      }
      if (!root) return true;
      return isMirror(root.left, root.right);
    },
    exampleExplanation: (args, result) => (result ? 'The left and right subtrees mirror each other exactly.' : 'The left and right subtrees are not mirror images of each other.'),
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 2, 3, 4, 4, 3]], kind: 'edge' },
      { args: [[1, 2, 2, null, 3, null, 3]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[2, 3, 3, 4, 5, 5, 4]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Count Complete Tree Nodes',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'int', maxNodes: 20, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      // A complete binary tree filled left-to-right needs no `null` markers at all: its
      // level-order array is exactly the classic 0-indexed heap layout (children of
      // index i live at 2i+1, 2i+2), which is exactly what the decoder expects.
      const n = randInt(rng, 0, cfg.maxNodes ?? 20);
      const vals = Array.from({ length: n }, () => randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
      return [vals];
    },
    statement:
      "Given the `root` of a **complete** binary tree — every level is fully filled except possibly the last, which is filled from left to right — return the total number of nodes in the tree.\n\nYou could count every node in O(n), but the completeness guarantee lets you do meaningfully better than that.",
    constraints: '- The number of nodes is in the range `[0, 5*10^4]`.\n- `0 <= Node.val <= 5*10^4`\n- The tree is guaranteed complete.',
    inputFormat: "Line 1: the tree's values in level-order (heap-array order); since the tree is guaranteed complete, no `null` markers ever appear.",
    outputFormat: 'A single integer: the total number of nodes (0 for an empty tree).',
    hints: [
      'A plain recursive count works but is O(n) — completeness is a strong enough guarantee to beat that.',
      "In a complete tree, if you measure height by always following left children from a node, and separately measure it by always following right children, the two match exactly when that subtree is perfect (fully filled).",
      'When a subtree is perfect with height h, it has exactly 2^h - 1 nodes and you can count it with a formula instead of visiting every node — then only recurse into the side that might not be perfect.',
    ],
    solutionApproach:
      "For a node, compute `lh` = the height obtained by always descending `.left` from its left child, and `rh` = the height obtained by always descending `.left` from its right child. Because the tree is complete, `lh === rh` exactly when the left subtree is perfect (every level full), in which case the left subtree alone contributes `2^lh - 1` nodes and you only need to recurse into the right subtree; otherwise the right subtree is the perfect one, contributing `2^rh - 1` nodes, and you recurse into the left subtree instead. Each recursive call does O(log n) work to measure heights, and the recursion depth is O(log n), giving O((log n)^2) total instead of O(n).",
    pythonSolutionCode:
      'def count_nodes(root):\n    def left_height(node):\n        h = 0\n        while node:\n            h += 1\n            node = node.left\n        return h\n    if not root:\n        return 0\n    lh = left_height(root.left)\n    rh = left_height(root.right)\n    if lh == rh:\n        return (1 << lh) + count_nodes(root.right)\n    return (1 << rh) + count_nodes(root.left)\n',
    solve: function solve(root) {
      function leftHeight(node) {
        let h = 0;
        while (node) {
          h += 1;
          node = node.left;
        }
        return h;
      }
      if (!root) return 0;
      const lh = leftHeight(root.left);
      const rh = leftHeight(root.right);
      if (lh === rh) return 2 ** lh + solve(root.right);
      return 2 ** rh + solve(root.left);
    },
    exampleExplanation: (args, result) => `The complete tree built from ${args[0].length} listed value(s) contains ${result} node(s) in total.`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 3]], kind: 'edge' },
      { args: [[1, 2, 3, 4]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7]], kind: 'edge' },
    ],
  },
];
