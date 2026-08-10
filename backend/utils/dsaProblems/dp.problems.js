export default [
  {
    legacyProblemName: 'Climbing Stairs',
    shape: 'int_to_int',
    shapeConfig: { outputType: 'int', min: 1, max: 45 },
    statement:
      'You are climbing a staircase with `n` steps. Each time you can climb either `1` or `2` steps. In how many distinct ways can you climb to the top?',
    constraints: '- `1 <= n <= 45`',
    inputFormat: 'Line 1: the integer `n`.',
    outputFormat: 'A single integer: the number of distinct ways to reach the top.',
    hints: [
      'To reach step n, your last move was either a single step from n-1, or a double step from n-2.',
      'That means `ways(n) = ways(n-1) + ways(n-2)` — this is exactly the Fibonacci recurrence.',
      'You only need the previous two values at any point, so this can run in O(1) space.',
    ],
    solutionApproach:
      'This is the Fibonacci sequence in disguise: `ways(n) = ways(n-1) + ways(n-2)`, with `ways(1) = 1` and `ways(2) = 2`. Iterate forward tracking only the last two values. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def climb_stairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n',
    solve: (n) => {
      if (n <= 2) return n;
      let a = 1;
      let b = 2;
      for (let i = 3; i <= n; i += 1) {
        const c = a + b;
        a = b;
        b = c;
      }
      return b;
    },
    exampleExplanation: (args, result) => `There are ${result} distinct ways to climb ${args[0]} step(s) using 1- or 2-step moves.`,
    edgeCases: [
      { args: [1], kind: 'edge' },
      { args: [2], kind: 'edge' },
      { args: [3], kind: 'edge' },
      { args: [10], kind: 'edge' },
      { args: [45], kind: 'edge' },
    ],
  },
];
