import { randInt } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Min Stack',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'int',
      queryOps: ['top', 'getMin'],
      genOps: (rng) => {
        const ops = [];
        let size = 0;
        const count = randInt(rng, 4, 12);
        for (let i = 0; i < count; i += 1) {
          const choices = size > 0 ? ['push', 'push', 'pop', 'top', 'getMin'] : ['push'];
          const name = choices[randInt(rng, 0, choices.length - 1)];
          if (name === 'push') {
            ops.push({ name: 'push', args: [randInt(rng, -50, 50)] });
            size += 1;
          } else if (name === 'pop') {
            ops.push({ name: 'pop', args: [] });
            size -= 1;
          } else {
            ops.push({ name, args: [] });
          }
        }
        if (size === 0) ops.unshift({ name: 'push', args: [randInt(rng, -50, 50)] });
        return ops;
      },
    },
    statement:
      'Design a stack that supports `push`, `pop`, `top`, and retrieving the minimum element in constant time.\n\nImplement the `MinStack` operations:\n- `push(val)` — pushes `val` onto the stack.\n- `pop()` — removes the element on top of the stack.\n- `top()` — gets the top element.\n- `getMin()` — retrieves the minimum element currently in the stack.',
    constraints: '- `-2^31 <= val <= 2^31 - 1`\n- `pop`, `top`, and `getMin` are only called on a non-empty stack.\n- At most `3*10^4` calls total.',
    inputFormat: 'Line 1: operation count `M`. Next `M` lines: `opName arg` (e.g. `push 5`, `pop`, `top`, `getMin` — no arg for `pop`/`top`/`getMin`).',
    outputFormat: 'One line per `top`/`getMin` call, in order, with that call\'s result. `push`/`pop` produce no output.',
    hints: [
      'A single stack cannot answer getMin() in O(1) on its own — you need to track minimums alongside the values.',
      'Maintain a second stack that, at every push, records the minimum-so-far (either the new value or the previous minimum, whichever is smaller).',
      'Pop from both stacks together so they always stay in sync.',
    ],
    solutionApproach:
      'Keep two stacks in lockstep: the main value stack, and a "min stack" where each position holds the minimum of everything pushed up to that point. Pushing computes `min(val, minStack.top())`; popping pops both stacks. `getMin()` just reads the top of the min stack. All operations are O(1).',
    pythonSolutionCode:
      'class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val):\n        self.stack.append(val)\n        m = val if not self.min_stack else min(val, self.min_stack[-1])\n        self.min_stack.append(m)\n\n    def pop(self):\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self):\n        return self.stack[-1]\n\n    def get_min(self):\n        return self.min_stack[-1]\n',
    solve: (ops) => {
      const stack = [];
      const minStack = [];
      const results = [];
      for (const op of ops) {
        if (op.name === 'push') {
          const val = op.args[0];
          stack.push(val);
          minStack.push(minStack.length ? Math.min(val, minStack[minStack.length - 1]) : val);
        } else if (op.name === 'pop') {
          stack.pop();
          minStack.pop();
        } else if (op.name === 'top') {
          results.push(stack[stack.length - 1]);
        } else if (op.name === 'getMin') {
          results.push(minStack[minStack.length - 1]);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each query (top/getMin) reflects the state of the stack at that point in the operation sequence.',
    edgeCases: [
      { args: [[{ name: 'push', args: [1] }, { name: 'getMin', args: [] }]], kind: 'edge' },
      {
        args: [
          [
            { name: 'push', args: [-2] },
            { name: 'push', args: [0] },
            { name: 'push', args: [-3] },
            { name: 'getMin', args: [] },
            { name: 'pop', args: [] },
            { name: 'top', args: [] },
            { name: 'getMin', args: [] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'push', args: [5] },
            { name: 'push', args: [5] },
            { name: 'getMin', args: [] },
            { name: 'pop', args: [] },
            { name: 'getMin', args: [] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },
];
