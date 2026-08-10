export default [
  {
    legacyProblemName: 'Maximum Depth of Binary Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'int', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement: "Given the `root` of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.",
    constraints: '- The number of nodes is in the range `[0, 10^4]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children, e.g. `3 9 20 null null 15 7`.',
    outputFormat: 'A single integer: the maximum depth (0 for an empty tree).',
    hints: [
      'An empty tree has depth 0; a single node has depth 1.',
      "A tree's depth is 1 plus the deeper of its two subtrees' depths.",
      'This recurrence maps directly onto a simple recursive function.',
    ],
    solutionApproach: 'Recursively compute `1 + max(depth(left), depth(right))`, with an empty subtree having depth 0. O(n) time, O(h) recursion stack where h is the height.',
    pythonSolutionCode:
      'def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n',
    solve: function solve(root) {
      if (!root) return 0;
      return 1 + Math.max(solve(root.left), solve(root.right));
    },
    exampleExplanation: (args, result) => `The longest root-to-leaf path visits ${result} node(s).`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[1, null, 2]], kind: 'edge' },
      { args: [[3, 9, 20, null, null, 15, 7]], kind: 'edge' },
      { args: [[1, 2, 3, 4, null, null, null, 5]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Invert Binary Tree',
    shape: 'binary_tree_to_value_or_array_or_tree',
    shapeConfig: { outputType: 'tree', maxNodes: 12, maxDepth: 4, min: -50, max: 50 },
    statement: "Given the `root` of a binary tree, invert the tree (swap every node's left and right children) and return its root.",
    constraints: '- The number of nodes is in the range `[0, 100]`.\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: the tree in level-order, `null` marking missing children.',
    outputFormat: 'The inverted tree in level-order, `null` marking missing children (trailing nulls trimmed).',
    hints: [
      'Inverting means every node swaps its left and right subtree.',
      'This is naturally recursive: invert the left subtree, invert the right subtree, then swap them at the current node.',
      'The base case is an empty subtree — nothing to invert.',
    ],
    solutionApproach: 'Recursively invert the left and right subtrees, then swap `node.left` and `node.right` at the current node. O(n) time.',
    pythonSolutionCode:
      'def invert_tree(root):\n    if not root:\n        return None\n    root.left, root.right = invert_tree(root.right), invert_tree(root.left)\n    return root\n',
    solve: function solve(root) {
      if (!root) return null;
      const left = solve(root.left);
      const right = solve(root.right);
      root.left = right;
      root.right = left;
      return root;
    },
    exampleExplanation: () => 'Every left and right child pair is swapped throughout the tree.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[4, 2, 7, 1, 3, 6, 9]], kind: 'edge' },
      { args: [[2, 1, 3]], kind: 'edge' },
      { args: [[1, 2, null, 3]], kind: 'edge' },
    ],
  },
];
