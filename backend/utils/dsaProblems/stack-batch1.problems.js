import { randInt, sample } from '../dsaIOShapes.js';

/* ------------------------------------------------------------------ *
 * Small local helpers for the calculator-family generators below.
 * ------------------------------------------------------------------ */

function randSpaces(rng) {
  return ' '.repeat(randInt(rng, 0, 2));
}

/** Builds a random valid "Basic Calculator" (I) term: an optionally-negated
 * number or an optionally-negated parenthesized sub-expression. Leading '-'
 * is only ever allowed where the real grammar allows it (start of an
 * expression, or right after '('/an operator) — controlled by `allowNeg`. */
function genCalcTerm(rng, depth, cfg, allowNeg) {
  const neg = allowNeg && rng() < 0.3;
  let inner;
  if (depth <= 0 || rng() < 0.55) {
    const num = randInt(rng, cfg.min ?? 0, cfg.max ?? 50);
    inner = { str: String(num), value: num };
  } else {
    const sub = genCalcExpr(rng, depth - 1, cfg);
    inner = { str: `(${randSpaces(rng)}${sub.str}${randSpaces(rng)})`, value: sub.value };
  }
  if (neg) return { str: `-${inner.str}`, value: -inner.value };
  return inner;
}

function genCalcExpr(rng, depth, cfg) {
  const first = genCalcTerm(rng, depth, cfg, true);
  let str = first.str;
  let value = first.value;
  const numTerms = randInt(rng, 1, 3);
  for (let i = 1; i < numTerms; i += 1) {
    const op = rng() < 0.5 ? '+' : '-';
    const t = genCalcTerm(rng, depth, cfg, false);
    str += `${randSpaces(rng)}${op}${randSpaces(rng)}${t.str}`;
    value = op === '+' ? value + t.value : value - t.value;
  }
  return { str, value };
}

export default [
  {
    legacyProblemName: 'Implement Stack using Queues',
    shape: 'stateful_ops',
    shapeConfig: {
      queryOps: ['pop', 'top', 'empty'],
      genOps: (rng) => {
        const ops = [];
        let size = 0;
        const count = randInt(rng, 4, 12);
        for (let i = 0; i < count; i += 1) {
          const choices = size > 0 ? ['push', 'push', 'pop', 'top', 'empty'] : ['push'];
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
      'Implement a **Last-In-First-Out (LIFO)** stack using only the standard operations of a queue (`enqueue` = push to back, `dequeue` = pop from front, peek front, check empty).\n\nYour `MyStack` must support:\n- `push(x)` — pushes element `x` onto the stack.\n- `pop()` — removes and returns the element on top of the stack.\n- `top()` — returns the element on top of the stack without removing it.\n- `empty()` — returns `true` if the stack is empty, `false` otherwise.',
    constraints:
      '- `-2^31 <= x <= 2^31 - 1`\n- At most `100` calls will be made to `push`, `pop`, `top`, and `empty`.\n- `pop` and `top` are only ever called on a non-empty stack.',
    inputFormat: 'Line 1: operation count `M`. Next `M` lines: `opName arg` (e.g. `push 5`, `pop`, `top`, `empty` — no arg for `pop`/`top`/`empty`).',
    outputFormat: 'One line per `pop`/`top`/`empty` call, in order, with that call\'s result. `push` produces no output.',
    hints: [
      'A queue only lets you remove from the front (FIFO) — the challenge is making the *most recently pushed* element come out first instead.',
      'One classic trick: after pushing a new element to the back of a single queue, immediately rotate every element that was already there around to the back, one at a time.',
      "If you always re-rotate right after each push, the newest element ends up at the front of the queue — so the queue's own \"dequeue\" now behaves exactly like a stack pop.",
    ],
    solutionApproach:
      'Keep everything in a single queue. On `push(x)`: enqueue `x` at the back, then dequeue-and-immediately-re-enqueue every element that was already in the queue (i.e. rotate the queue by `size - 1` positions). This walks the newly pushed element all the way to the front, so the front of the queue is always the most recently pushed value. `pop()` and `top()` then just read/remove the front. `push` is O(n), `pop`/`top`/`empty` are O(1).',
    pythonSolutionCode:
      'from collections import deque\n\n\nclass MyStack:\n    def __init__(self):\n        self.q = deque()\n\n    def push(self, x):\n        self.q.append(x)\n        for _ in range(len(self.q) - 1):\n            self.q.append(self.q.popleft())\n\n    def pop(self):\n        return self.q.popleft()\n\n    def top(self):\n        return self.q[0]\n\n    def empty(self):\n        return len(self.q) == 0\n\n\ndef solve(ops):\n    s = MyStack()\n    out = []\n    for name, args in ops:\n        if name == "push":\n            s.push(args[0])\n        elif name == "pop":\n            out.append(s.pop())\n        elif name == "top":\n            out.append(s.top())\n        elif name == "empty":\n            out.append(s.empty())\n    return out\n',
    solve: (ops) => {
      let queue = [];
      const results = [];
      for (const op of ops) {
        if (op.name === 'push') {
          queue.push(op.args[0]);
          for (let i = 0; i < queue.length - 1; i += 1) {
            queue.push(queue.shift());
          }
        } else if (op.name === 'pop') {
          results.push(queue.shift());
        } else if (op.name === 'top') {
          results.push(queue[0]);
        } else if (op.name === 'empty') {
          results.push(queue.length === 0);
        }
      }
      return results;
    },
    exampleExplanation: () => 'Each push rotates the queue so the newest value sits at the front, so pop/top always report LIFO (stack) order.',
    edgeCases: [
      { args: [[{ name: 'push', args: [5] }, { name: 'pop', args: [] }]], kind: 'edge' },
      {
        args: [[
          { name: 'push', args: [1] },
          { name: 'push', args: [2] },
          { name: 'push', args: [3] },
          { name: 'pop', args: [] },
          { name: 'top', args: [] },
        ]],
        kind: 'edge',
      },
      { args: [[{ name: 'push', args: [1] }, { name: 'empty', args: [] }]], kind: 'edge' },
      { args: [[{ name: 'push', args: [1] }, { name: 'pop', args: [] }, { name: 'empty', args: [] }]], kind: 'edge' },
      { args: [[{ name: 'push', args: [-5] }, { name: 'push', args: [10] }, { name: 'top', args: [] }]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Evaluate Reverse Polish Notation',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'int', minN: 2, maxN: 7, min: -12, max: 12 },
    genArgs: (rng, cfg) => {
      const numCount = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 7);
      const ops = ['+', '-', '*', '/'];
      const tokens = [];
      const stack = [];
      let numsUsed = 0;
      while (numsUsed < numCount || stack.length > 1) {
        const needNumber = stack.length < 2 || (numsUsed < numCount && rng() < 0.55);
        if (needNumber && numsUsed < numCount) {
          let v = randInt(rng, cfg.min ?? -12, cfg.max ?? 12);
          if (v === 0) v = randInt(rng, 1, Math.max(1, cfg.max ?? 12));
          tokens.push(String(v));
          stack.push(v);
          numsUsed += 1;
        } else {
          let op = ops[randInt(rng, 0, 3)];
          const b = stack[stack.length - 1];
          const a = stack[stack.length - 2];
          if (op === '/' && b === 0) op = '+';
          if (op === '*' && Math.abs(a * b) > 100000) op = rng() < 0.5 ? '+' : '-';
          let val;
          if (op === '+') val = a + b;
          else if (op === '-') val = a - b;
          else if (op === '*') val = a * b;
          else val = Math.trunc(a / b);
          stack.pop();
          stack.pop();
          stack.push(val);
          tokens.push(op);
        }
      }
      return [tokens];
    },
    statement:
      'Evaluate an arithmetic expression written in **Reverse Polish Notation** (postfix notation), given as an array of `tokens`.\n\nEach token is either an integer (may be negative) or one of the operators `+`, `-`, `*`, `/`. Division between two integers should **truncate toward zero**. There will always be a valid expression with no division by zero.',
    constraints:
      '- `1 <= tokens.length <= 10^4`\n- Each token is an integer in `[-200, 200]` or one of `+ - * /`.\n- The expression is always valid and never divides by zero.\n- Division truncates toward zero (e.g. `7 / -2 = -3`, not `-4`).',
    inputFormat: 'Line 1: token count `N`. Next `N` lines: one token per line (a number, or one of `+ - * /`).',
    outputFormat: 'A single integer: the value of the evaluated expression.',
    hints: [
      'Process tokens left to right and think about what data structure naturally holds "pending operands waiting to be combined".',
      'Whenever you see an operator, it always applies to the two most-recently-seen numbers — that\'s a stack.',
      'Push numbers onto the stack; on an operator, pop the top two (the second-popped is the left operand), apply the operator, and push the result back.',
    ],
    solutionApproach:
      'Use a single stack. Scan tokens left to right: if a token is a number, push it. If it\'s an operator, pop the top two values `b` (top) then `a` (next), compute `a OP b`, and push the result back — order matters for `-` and `/`. After the last token, the stack holds exactly one value: the answer. Integer division truncates toward zero (e.g. via `Math.trunc` in JS or a manual sign-aware division in languages that floor instead). O(n) time and space.',
    pythonSolutionCode:
      'def solve(tokens):\n    stack = []\n    ops = {"+", "-", "*", "/"}\n    for tok in tokens:\n        if tok in ops:\n            b = stack.pop()\n            a = stack.pop()\n            if tok == "+":\n                stack.append(a + b)\n            elif tok == "-":\n                stack.append(a - b)\n            elif tok == "*":\n                stack.append(a * b)\n            else:\n                # truncate toward zero (Python\'s // floors, so divide as float then int())\n                stack.append(int(a / b))\n        else:\n            stack.append(int(tok))\n    return stack.pop()\n',
    solve: (tokens) => {
      const isOp = (t) => t === '+' || t === '-' || t === '*' || t === '/';
      const stack = [];
      for (const t of tokens) {
        if (isOp(t)) {
          const b = stack.pop();
          const a = stack.pop();
          let val;
          if (t === '+') val = a + b;
          else if (t === '-') val = a - b;
          else if (t === '*') val = a * b;
          else val = Math.trunc(a / b);
          stack.push(val);
        } else {
          stack.push(Number(t));
        }
      }
      return stack.pop();
    },
    exampleExplanation: (args, result) => `Evaluating the postfix expression [${args[0].join(', ')}] one token at a time yields ${result}.`,
    edgeCases: [
      { args: [['5']], kind: 'edge' },
      { args: [['-7']], kind: 'edge' },
      { args: [['2', '1', '+', '3', '*']], kind: 'edge' },
      { args: [['4', '13', '5', '/', '+']], kind: 'edge' },
      { args: [['3', '-2', '*']], kind: 'edge' },
      { args: [['5', '1', '2', '+', '4', '*', '+', '3', '-']], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Daily Temperatures',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: 30, max: 100 },
    statement:
      'Given an array `temperatures` where `temperatures[i]` is the temperature on day `i`, return an array `answer` such that `answer[i]` is the number of days you would have to wait after day `i` to get a **strictly warmer** temperature. If there is no future day with a warmer temperature, put `0` for that day instead.',
    constraints: '- `1 <= temperatures.length <= 10^5`\n- `30 <= temperatures[i] <= 100`',
    inputFormat: 'Line 1: the array `temperatures`, space-separated.',
    outputFormat: 'The array `answer`, space-separated, same length as the input.',
    hints: [
      'A brute-force scan-forward-from-every-day check is O(n^2) — think about which days are still "waiting" for a warmer day at any point.',
      'Keep a stack of indices whose warmer day hasn\'t been found yet, from coldest (top) to some baseline.',
      'When the current temperature beats the temperature at the index on top of the stack, that index just found its answer — pop it and record the day-gap, then keep checking the new top.',
    ],
    solutionApproach:
      "Maintain a stack of indices for days whose next-warmer-day is still unknown, kept so temperatures at those indices are in decreasing order from bottom to top... actually top always holds the coldest unresolved day. Scan left to right: while the stack is non-empty and today's temperature is strictly greater than the temperature at the index on top, pop that index and set `answer[popped] = i - popped`. Then push the current index. Every index is pushed and popped at most once, so this is O(n) time, O(n) space.",
    pythonSolutionCode:
      'def solve(temperatures):\n    n = len(temperatures)\n    answer = [0] * n\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            j = stack.pop()\n            answer[j] = i - j\n        stack.append(i)\n    return answer\n',
    solve: (temperatures) => {
      const n = temperatures.length;
      const answer = new Array(n).fill(0);
      const stack = [];
      for (let i = 0; i < n; i += 1) {
        while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
          const j = stack.pop();
          answer[j] = i - j;
        }
        stack.push(i);
      }
      return answer;
    },
    exampleExplanation: () => 'Each entry counts how many days until a strictly warmer temperature appears, or 0 if none ever does.',
    edgeCases: [
      { args: [[73]], kind: 'edge' },
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], kind: 'edge' },
      { args: [[30, 40, 50, 60]], kind: 'edge' },
      { args: [[60, 50, 40, 30]], kind: 'edge' },
      { args: [[55, 55, 55]], kind: 'edge' },
      { args: [[100]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Next Greater Element I',
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'intArray', minN: 1, maxN: 10, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n2 = randInt(rng, Math.max(1, cfg.minN ?? 1), cfg.maxN ?? 10);
      const pool = [];
      const used = new Set();
      let guard = 0;
      while (pool.length < n2 && guard < n2 * 60 + 60) {
        const v = randInt(rng, cfg.min ?? -50, cfg.max ?? 50);
        if (!used.has(v)) {
          used.add(v);
          pool.push(v);
        }
        guard += 1;
      }
      if (pool.length === 0) pool.push(randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
      const nums2 = pool;
      const n1 = randInt(rng, 1, nums2.length);
      const nums1 = sample(rng, nums2, n1);
      return [nums1, nums2];
    },
    statement:
      'You are given two integer arrays `nums1` and `nums2`, both containing **distinct** values, where `nums1` is a subset of `nums2`.\n\nFor each value `nums1[i]`, find its index in `nums2`, then find the first value to the **right** of that index in `nums2` that is strictly greater. That is the "next greater element" for `nums1[i]`; if no such value exists, use `-1`. Return the answers for `nums1` in order.',
    constraints:
      '- `1 <= nums1.length <= nums2.length <= 1000`\n- `-10^4 <= nums1[i], nums2[i] <= 10^4`\n- All integers within `nums1` are distinct, all integers within `nums2` are distinct, and every element of `nums1` also appears in `nums2`.',
    inputFormat: 'Line 1: the array `nums1`, space-separated. Line 2: the array `nums2`, space-separated.',
    outputFormat: 'One integer per element of `nums1`, in order, space-separated: the next greater element in `nums2`, or `-1`.',
    hints: [
      'Answering "next greater to the right" for every element of nums2 once, up front, is more efficient than re-scanning nums2 for each query in nums1.',
      'Scan `nums2` once with a decreasing stack of "unresolved" values — when a bigger value arrives, everything smaller left on the stack has just found its answer.',
      'Store those answers in a hash map keyed by value, then just look each `nums1[i]` up in O(1).',
    ],
    solutionApproach:
      'Precompute the next-greater-to-the-right for every value of `nums2` in one O(n) pass using a monotonic decreasing stack: push indices/values while scanning; whenever the current value beats the value on top of the stack, that stacked value\'s "next greater" is the current value — pop and record it in a map, then repeat the check against the new top. Anything left on the stack at the end has no next greater (`-1`). Finally, map each `nums1[i]` through that lookup table. O(n + m) time.',
    pythonSolutionCode:
      'def solve(nums1, nums2):\n    next_greater = {}\n    stack = []\n    for v in nums2:\n        while stack and stack[-1] < v:\n            next_greater[stack.pop()] = v\n        stack.append(v)\n    return [next_greater.get(v, -1) for v in nums1]\n',
    solve: (nums1, nums2) => {
      const nextGreater = new Map();
      const stack = [];
      for (const v of nums2) {
        while (stack.length && stack[stack.length - 1] < v) {
          nextGreater.set(stack.pop(), v);
        }
        stack.push(v);
      }
      return nums1.map((v) => (nextGreater.has(v) ? nextGreater.get(v) : -1));
    },
    exampleExplanation: (args, result) => `For nums1 = [${args[0].join(', ')}] against nums2 = [${args[1].join(', ')}], the next-greater lookups give [${result.join(', ')}].`,
    edgeCases: [
      { args: [[4, 1, 2], [1, 3, 4, 2]], kind: 'edge' },
      { args: [[2, 4], [1, 2, 3, 4]], kind: 'edge' },
      { args: [[1], [1]], kind: 'edge' },
      { args: [[-1], [-1]], kind: 'edge' },
      { args: [[1, 3, 5], [6, 5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[3, 1], [3, 4, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Next Greater Element II',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 1, maxN: 15, min: -50, max: 50 },
    statement:
      'Given a **circular** integer array `nums` (the last element\'s next element wraps around to the first), return an array `answer` where `answer[i]` is the next greater number of `nums[i]` when scanning forward and wrapping around at most once. If no greater number exists anywhere in the circle, `answer[i] = -1`.',
    constraints: '- `1 <= nums.length <= 10^4`\n- `-10^9 <= nums[i] <= 10^9`',
    inputFormat: 'Line 1: the array `nums`, space-separated.',
    outputFormat: 'The array `answer`, space-separated, same length as the input.',
    hints: [
      'Ignoring the wraparound for a moment, this is the same monotonic-stack idea as the non-circular "next greater element" problem.',
      'You can simulate the circular wraparound without physically duplicating the array by iterating index `i` from `0` to `2n - 1` and using `i % n` to read values.',
      'Only push each original index onto the stack once (during the first pass, `i < n`) — the second lap around is only there to let earlier elements find a later answer.',
    ],
    solutionApproach:
      'Simulate walking the array twice (indices `0..2n-1`, using `i % n` to index into `nums`) with a monotonic decreasing stack of indices whose answer is still unknown. On each step, while the value at the top of the stack is smaller than the current value, pop it and record the current value as its answer. Only push the index during the first lap (`i < n`) so each index is pushed exactly once. Anything left on the stack after both laps never finds a greater value (`-1`). O(n) time, O(n) space.',
    pythonSolutionCode:
      'def solve(nums):\n    n = len(nums)\n    answer = [-1] * n\n    stack = []\n    for i in range(2 * n):\n        idx = i % n\n        while stack and nums[stack[-1]] < nums[idx]:\n            answer[stack.pop()] = nums[idx]\n        if i < n:\n            stack.append(idx)\n    return answer\n',
    solve: (nums) => {
      const n = nums.length;
      const answer = new Array(n).fill(-1);
      const stack = [];
      for (let i = 0; i < 2 * n; i += 1) {
        const idx = i % n;
        while (stack.length && nums[stack[stack.length - 1]] < nums[idx]) {
          answer[stack.pop()] = nums[idx];
        }
        if (i < n) stack.push(idx);
      }
      return answer;
    },
    exampleExplanation: () => 'Each entry is the first strictly-greater value found while scanning forward and wrapping around the circle at most once.',
    edgeCases: [
      { args: [[1]], kind: 'edge' },
      { args: [[1, 2, 1]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[1, 1, 1]], kind: 'edge' },
      { args: [[100, -100]], kind: 'edge' },
      { args: [[3, 8, 4, 1, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Largest Rectangle in Histogram',
    shape: 'int_array_to_value',
    shapeConfig: { outputType: 'int', minN: 1, maxN: 15, min: 0, max: 1000 },
    statement:
      'Given an array `heights` representing the heights of bars in a histogram (each bar has width `1`, placed side by side), find the area of the **largest rectangle** that can be formed using a contiguous run of these bars.',
    constraints: '- `1 <= heights.length <= 10^5`\n- `0 <= heights[i] <= 10^4`',
    inputFormat: 'Line 1: the array `heights`, space-separated.',
    outputFormat: 'A single integer: the largest rectangular area achievable.',
    hints: [
      'For any bar, the tallest rectangle that uses that bar as its limiting (shortest) height extends as far left and right as neighboring bars stay `>=` that height.',
      'A monotonic increasing stack of indices lets you find, for each bar, exactly how far it can extend in both directions, in a single pass.',
      'When a new bar is shorter than the bar on top of the stack, that stacked bar can\'t extend any further right — pop it and finalize the rectangle it forms, using the new top of the stack (after popping) as its left boundary.',
    ],
    solutionApproach:
      "Walk the array with a stack of indices holding bars in increasing height order. When the current bar's height is less than the height at the top of the stack, the stacked bar has found its right boundary: pop it, and compute its rectangle's width as the distance between the new stack top and the current index (or from the start if the stack is now empty), multiplied by its height. Track the maximum area seen. Push a sentinel height of `0` at the very end to flush any bars still on the stack. Each index is pushed and popped exactly once: O(n) time, O(n) space.",
    pythonSolutionCode:
      'def solve(heights):\n    stack = []\n    best = 0\n    n = len(heights)\n    for i in range(n + 1):\n        h = 0 if i == n else heights[i]\n        while stack and heights[stack[-1]] >= h:\n            height = heights[stack.pop()]\n            width = i - stack[-1] - 1 if stack else i\n            best = max(best, height * width)\n        stack.append(i)\n    return best\n',
    solve: (heights) => {
      const stack = [];
      let best = 0;
      const n = heights.length;
      for (let i = 0; i <= n; i += 1) {
        const h = i === n ? 0 : heights[i];
        while (stack.length && heights[stack[stack.length - 1]] >= h) {
          const height = heights[stack.pop()];
          const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
          best = Math.max(best, height * width);
        }
        stack.push(i);
      }
      return best;
    },
    exampleExplanation: (args, result) => `The widest rectangle that fits under the histogram [${args[0].join(', ')}] has area ${result}.`,
    edgeCases: [
      { args: [[2, 1, 5, 6, 2, 3]], kind: 'edge' },
      { args: [[2, 4]], kind: 'edge' },
      { args: [[1]], kind: 'edge' },
      { args: [[3, 3, 3, 3]], kind: 'edge' },
      { args: [[0, 0, 0]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Maximal Rectangle',
    shape: 'matrix_to_value_or_matrix',
    shapeConfig: { outputType: 'int', minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, min: 0, max: 1 },
    statement:
      'Given a `rows x cols` binary matrix filled with `0`s and `1`s, find the area of the largest rectangle made entirely of `1`s.',
    constraints: '- `1 <= rows, cols <= 200`\n- Each matrix entry is `0` or `1`.',
    inputFormat: 'Line 1: `rows cols`. Next `rows` lines: `cols` space-separated `0`/`1` values.',
    outputFormat: 'A single integer: the area of the largest all-`1`s rectangle.',
    hints: [
      'This looks a lot like a 2D version of a problem about the largest rectangle in a histogram — can you reduce it to that, one row at a time?',
      'For each row, imagine a "height histogram" where `height[c]` is how many consecutive `1`s are stacked above (and including) that row in column `c`.',
      'Run the largest-rectangle-in-histogram algorithm on that height array for every row, resetting a column\'s height to `0` whenever a `0` appears in it, and take the best answer across all rows.',
    ],
    solutionApproach:
      "Maintain a `heights` array over the columns. Processing rows top to bottom, update `heights[c] = heights[c] + 1` if `matrix[r][c] == 1`, else reset `heights[c] = 0`. After updating for row `r`, run the O(cols) largest-rectangle-in-histogram routine on `heights` and keep the running maximum. Since that routine runs once per row, total time is O(rows * cols).",
    pythonSolutionCode:
      'def _largest_rectangle(heights):\n    stack = []\n    best = 0\n    n = len(heights)\n    for i in range(n + 1):\n        h = 0 if i == n else heights[i]\n        while stack and heights[stack[-1]] >= h:\n            height = heights[stack.pop()]\n            width = i - stack[-1] - 1 if stack else i\n            best = max(best, height * width)\n        stack.append(i)\n    return best\n\n\ndef solve(matrix):\n    if not matrix or not matrix[0]:\n        return 0\n    cols = len(matrix[0])\n    heights = [0] * cols\n    best = 0\n    for row in matrix:\n        for c in range(cols):\n            heights[c] = heights[c] + 1 if row[c] == 1 else 0\n        best = max(best, _largest_rectangle(heights))\n    return best\n',
    solve: (matrix) => {
      if (!matrix.length || !matrix[0].length) return 0;
      const cols = matrix[0].length;
      const heights = new Array(cols).fill(0);
      const largestRectangle = (hs) => {
        const stack = [];
        let best = 0;
        for (let i = 0; i <= hs.length; i += 1) {
          const h = i === hs.length ? 0 : hs[i];
          while (stack.length && hs[stack[stack.length - 1]] >= h) {
            const height = hs[stack.pop()];
            const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
            best = Math.max(best, height * width);
          }
          stack.push(i);
        }
        return best;
      };
      let best = 0;
      for (let r = 0; r < matrix.length; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          heights[c] = matrix[r][c] === 1 ? heights[c] + 1 : 0;
        }
        best = Math.max(best, largestRectangle(heights));
      }
      return best;
    },
    exampleExplanation: (args, result) => `The largest all-1s rectangle in the given ${args[0].length}x${args[0][0]?.length ?? 0} matrix has area ${result}.`,
    edgeCases: [
      { args: [[[0]]], kind: 'edge' },
      { args: [[[1]]], kind: 'edge' },
      { args: [[[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]]], kind: 'edge' },
      { args: [[[0, 0], [0, 0]]], kind: 'edge' },
      { args: [[[1, 1], [1, 1]]], kind: 'edge' },
      { args: [[[1, 1, 1]]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Basic Calculator',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', min: 0, max: 50 },
    genArgs: (rng, cfg) => [genCalcExpr(rng, 2, cfg).str],
    statement:
      'Given a string `s` representing a valid arithmetic expression, evaluate it and return its integer value.\n\nThe expression may contain non-negative integers, the binary operators `+` and `-`, parentheses `(` `)` for grouping, spaces, and a leading unary `-` (e.g. `-(2+3)`) at the start of the expression or right after an opening parenthesis. There is no multiplication or division. Do not use `eval`.',
    constraints:
      '- `1 <= s.length <= 3 * 10^5`\n- `s` consists of digits, `+`, `-`, `(`, `)`, and spaces.\n- `s` represents a valid expression.\n- All intermediate and final values fit in a 32-bit signed integer.',
    inputFormat: 'Line 1: the expression string `s`.',
    outputFormat: 'A single integer: the evaluated result.',
    hints: [
      'A pure left-to-right scan struggles with parentheses — you need to "pause" the outer computation while you resolve an inner group.',
      'A stack can hold the outer running total and its sign every time you enter a `(`, so you can pick it back up after the matching `)`.',
      "Track a running result, the current number being built digit-by-digit, and a current sign; on `(` push (result, sign) and reset both; on `)` fold the finished inner value back into what you popped.",
    ],
    solutionApproach:
      "Scan left to right maintaining `result`, the digit-by-digit `number` currently being built, and `sign` (+1/-1). On a digit, extend `number`. On `+`/`-`, fold `sign * number` into `result`, reset `number` to 0, and set the new `sign`. On `(`, push the current `result` and `sign` onto a stack (they represent 'everything before this group'), then reset `result = 0, sign = 1` to evaluate the group fresh. On `)`, fold the trailing number into `result`, then combine with what's on the stack: `result = result * poppedSign + poppedResult`. Spaces are simply skipped. O(n) time, O(n) space for the stack (bounded by nesting depth).",
    pythonSolutionCode:
      'def solve(s):\n    stack = []\n    result = 0\n    number = 0\n    sign = 1\n    for c in s:\n        if c.isdigit():\n            number = number * 10 + int(c)\n        elif c == "+":\n            result += sign * number\n            number = 0\n            sign = 1\n        elif c == "-":\n            result += sign * number\n            number = 0\n            sign = -1\n        elif c == "(":\n            stack.append(result)\n            stack.append(sign)\n            result = 0\n            sign = 1\n        elif c == ")":\n            result += sign * number\n            number = 0\n            prev_sign = stack.pop()\n            prev_result = stack.pop()\n            result = result * prev_sign + prev_result\n    result += sign * number\n    return result\n',
    solve: (s) => {
      const stack = [];
      let result = 0;
      let number = 0;
      let sign = 1;
      for (let i = 0; i < s.length; i += 1) {
        const c = s[i];
        if (c >= '0' && c <= '9') {
          number = number * 10 + (c.charCodeAt(0) - 48);
        } else if (c === '+') {
          result += sign * number;
          number = 0;
          sign = 1;
        } else if (c === '-') {
          result += sign * number;
          number = 0;
          sign = -1;
        } else if (c === '(') {
          stack.push(result);
          stack.push(sign);
          result = 0;
          sign = 1;
        } else if (c === ')') {
          result += sign * number;
          number = 0;
          const prevSign = stack.pop();
          const prevResult = stack.pop();
          result = result * prevSign + prevResult;
        }
      }
      result += sign * number;
      return result;
    },
    exampleExplanation: (args, result) => `Evaluating "${args[0]}" (resolving parentheses first) gives ${result}.`,
    edgeCases: [
      { args: ['0'] , kind: 'edge' },
      { args: ['1 + 1'], kind: 'edge' },
      { args: [' 2-1 + 2 '], kind: 'edge' },
      { args: ['(1+(4+5+2)-3)+(6+8)'], kind: 'edge' },
      { args: ['-(2+3)'], kind: 'edge' },
      { args: ['-(2+3) - 4'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Basic Calculator II',
    shape: 'string_to_value',
    shapeConfig: { outputType: 'int', min: 0, max: 20, maxTerms: 4 },
    genArgs: (rng, cfg) => {
      const termCount = randInt(rng, 2, cfg.maxTerms ?? 4);
      const first = randInt(rng, cfg.min ?? 0, cfg.max ?? 20);
      let expr = String(first);
      for (let i = 1; i < termCount; i += 1) {
        const op = ['+', '-', '*', '/'][randInt(rng, 0, 3)];
        const v = op === '/' ? randInt(rng, 1, cfg.max ?? 20) : randInt(rng, cfg.min ?? 0, cfg.max ?? 20);
        expr += `${randSpaces(rng)}${op}${randSpaces(rng)}${v}`;
      }
      return [expr];
    },
    statement:
      'Given a string `s` representing a valid arithmetic expression, evaluate it and return its integer value.\n\nThe expression contains non-negative integers, the operators `+`, `-`, `*`, `/`, and spaces — but **no parentheses**. Integer division should **truncate toward zero** (e.g. `7 / 2 = 3`, `-7 / 2 = -3`). Assume the expression is always valid and never divides by zero.',
    constraints:
      '- `1 <= s.length <= 3 * 10^5`\n- `s` consists of digits, `+ - * /`, and spaces.\n- `s` represents a valid expression with no parentheses.\n- All intermediate values fit in a 32-bit signed integer, and division never has a zero divisor.',
    inputFormat: 'Line 1: the expression string `s`.',
    outputFormat: 'A single integer: the evaluated result, respecting standard operator precedence (`*`/`/` before `+`/`-`).',
    hints: [
      'Without parentheses, the only tricky part is operator precedence: `*` and `/` must be resolved before `+` and `-`.',
      'Try resolving every `*`/`/` the moment you see it, against the most recently pushed number, so only "already-final" terms ever get added together at the end.',
      'A stack of pending terms works well: push a number for `+`, push its negation for `-`, and for `*`/`/`, pop the previous term and combine it directly with the new number before pushing.',
    ],
    solutionApproach:
      'Scan the string left to right, building up the current number digit by digit and remembering the operator (`sign`) that preceded it (starting with `+`). Whenever you hit a new operator (or reach the end of the string), resolve the just-finished number against its preceding operator: for `+` push the number, for `-` push its negative, for `*`/`/` pop the previous value off the stack and push `prev * number` or `truncate(prev / number)`. Since `*`/`/` are resolved immediately using the previous stacked term, only fully-resolved `+`/`-` terms remain on the stack; summing the stack gives the answer. O(n) time, O(n) space.',
    pythonSolutionCode:
      'def solve(s):\n    stack = []\n    num = 0\n    sign = "+"\n    n = len(s)\n    for i, c in enumerate(s):\n        if c.isdigit():\n            num = num * 10 + int(c)\n        if (not c.isspace() and not c.isdigit()) or i == n - 1:\n            if sign == "+":\n                stack.append(num)\n            elif sign == "-":\n                stack.append(-num)\n            elif sign == "*":\n                stack.append(stack.pop() * num)\n            elif sign == "/":\n                prev = stack.pop()\n                stack.append(int(prev / num))\n            sign = c\n            num = 0\n    return sum(stack)\n',
    solve: (s) => {
      const stack = [];
      let num = 0;
      let sign = '+';
      const n = s.length;
      for (let i = 0; i < n; i += 1) {
        const c = s[i];
        const isDigit = c >= '0' && c <= '9';
        if (isDigit) num = num * 10 + (c.charCodeAt(0) - 48);
        const isSpace = c === ' ' || c === '\t';
        if ((!isSpace && !isDigit) || i === n - 1) {
          if (sign === '+') stack.push(num);
          else if (sign === '-') stack.push(-num);
          else if (sign === '*') stack.push(stack.pop() * num);
          else if (sign === '/') {
            const prev = stack.pop();
            stack.push(Math.trunc(prev / num));
          }
          sign = c;
          num = 0;
        }
      }
      return stack.reduce((a, b) => a + b, 0);
    },
    exampleExplanation: (args, result) => `Applying standard operator precedence to "${args[0]}" gives ${result}.`,
    edgeCases: [
      { args: ['3+2*2'], kind: 'edge' },
      { args: [' 3/2 '], kind: 'edge' },
      { args: [' 3+5 / 2 '], kind: 'edge' },
      { args: ['14-3/2'], kind: 'edge' },
      { args: ['0-4'], kind: 'edge' },
      { args: ['1*2*3*4'], kind: 'edge' },
    ],
  },
];
