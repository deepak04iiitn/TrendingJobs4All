import { randInt, randIntArray, shuffle } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Intersection of Two Linked Lists',
    // No shape in the catalog takes two independent linked lists, so the closest fit is
    // `two_int_arrays_to_value`: each list is given as its array of node values, and by
    // construction the two arrays either share an identical trailing run of values (the
    // "intersection") or share none at all. All values are drawn from a large enough pool
    // that a value match can only happen along the deliberately-shared suffix.
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'int', maxN: 8, min: 1, max: 1000 },
    genArgs: (rng, cfg) => {
      const maxLen = cfg.maxN ?? 8;
      const lenA = randInt(rng, 0, maxLen);
      const lenB = randInt(rng, 0, maxLen);
      const hasIntersection = rng() < 0.6;
      const lenC = hasIntersection ? randInt(rng, 1, maxLen) : 0;
      const total = lenA + lenB + lenC;
      const min = cfg.min ?? 1;
      const max = cfg.max ?? 1000;
      const pool = new Set();
      while (pool.size < total) pool.add(randInt(rng, min, max));
      const values = shuffle(rng, [...pool]);
      let i = 0;
      const prefixA = values.slice(i, i + lenA);
      i += lenA;
      const prefixB = values.slice(i, i + lenB);
      i += lenB;
      const common = values.slice(i, i + lenC);
      return [
        [...prefixA, ...common],
        [...prefixB, ...common],
      ];
    },
    statement:
      "You are given two singly linked lists, `listA` and `listB`, each provided here as the array of its node values from head to tail. The two lists either don't intersect at all, or they intersect at some node and are **identical from that node onward** (they share a common tail).\n\nReturn the value of the first node where the two lists intersect, or `-1` if they never intersect. (Two nodes are considered the same node when they are literally the shared tail, not merely nodes that happen to hold equal values.)",
    constraints:
      '- The number of nodes in each list is in the range `[0, 8]` (larger in stress tests).\n- `1 <= Node.val <= 1000`.\n- Outside of the shared tail (if any), no value is repeated between the two lists — so the first matching value read from a correctly-aligned scan is guaranteed to be the true intersection point.',
    inputFormat: 'Line 1: `listA`, space-separated (empty line if `listA` has no nodes). Line 2: `listB`, space-separated (empty line if `listB` has no nodes).',
    outputFormat: 'A single integer: the value at the intersection node, or `-1` if the lists do not intersect.',
    hints: [
      "Comparing every node of A against every node of B works but is O(n*m) — there's a smarter way that uses the fact that both lists end at the same node when they do intersect.",
      'If you know how much longer one list is than the other, you can skip that many nodes on the longer list so both remaining lists have equal length.',
      'Once both remaining lengths are equal, walk both lists one step at a time — the first position where they agree is the intersection.',
    ],
    solutionApproach:
      "Compute both lengths. Advance a pointer into the longer list by the length difference so both pointers have the same number of nodes left to traverse. Then advance both pointers together one step at a time; the first index at which they hold the same value is the intersection (because everything from that point on is guaranteed identical). If the pointers run off the end without ever matching, there is no intersection. O(n + m) time, O(1) extra space — this is the array-index analogue of the classic two-pointer / length-difference technique used on real linked-list nodes.",
    pythonSolutionCode:
      'def solve(a, b):\n    la, lb = len(a), len(b)\n    ia = la - lb if la > lb else 0\n    ib = lb - la if lb > la else 0\n    while ia < la and ib < lb:\n        if a[ia] == b[ib]:\n            return a[ia]\n        ia += 1\n        ib += 1\n    return -1\n',
    solve: (a, b) => {
      const la = a.length;
      const lb = b.length;
      let ia = la > lb ? la - lb : 0;
      let ib = lb > la ? lb - la : 0;
      while (ia < la && ib < lb) {
        if (a[ia] === b[ib]) return a[ia];
        ia += 1;
        ib += 1;
      }
      return -1;
    },
    exampleExplanation: (args, result) =>
      result === -1
        ? 'The two lists never share a common tail node, so there is no intersection.'
        : `Aligning both lists by length and scanning forward, the first shared node holds the value ${result}.`,
    edgeCases: [
      { args: [[], []], kind: 'edge' },
      { args: [[1, 2, 3], [4, 5]], kind: 'edge' },
      { args: [[9, 4, 1], [9, 4, 1]], kind: 'edge' },
      { args: [[7, 1, 6, 3], [6, 3]], kind: 'edge' },
      { args: [[5], [9]], kind: 'edge' },
      { args: [[2, 4, 6, 8, 1], [9, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Middle of Linked List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'list', hasCycle: false, minN: 1, maxN: 12, min: -100, max: 100 },
    statement:
      "Given the `head` of a singly linked list, return the middle node of the list. If there are two middle nodes (the list has an even length), return the **second** of the two middle nodes.\n\nSince the judge prints the returned node as a list, the expected output is everything from that middle node to the end of the list.",
    constraints: '- The number of nodes is in the range `[1, 100]` (larger in stress tests).\n- `-100 <= Node.val <= 100`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values describing the list.',
    outputFormat: 'The list starting from the middle node through the end, space-separated.',
    hints: [
      "Counting the length first and then walking to n/2 works, but you'd have to traverse the list twice.",
      'A pointer that moves two steps for every one step another pointer takes will reach the end exactly when the slower pointer reaches the middle.',
      "Stop the fast pointer when it (or its next node) runs out — the slow pointer is then sitting on the correct middle (the second one, for even-length lists).",
    ],
    solutionApproach:
      "Use the slow/fast pointer technique (a form of Floyd's algorithm): `slow` advances one node at a time, `fast` advances two. When `fast` reaches the end (or `fast.next` is null), `slow` is on the middle node — and this naturally lands on the second middle node when the list has even length, since `fast` outruns `slow` by exactly the right amount. O(n) time, O(1) space, single pass.",
    pythonSolutionCode:
      'def solve(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow\n',
    solve: (head) => {
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
      }
      return slow;
    },
    exampleExplanation: () => 'The fast pointer covers the list twice as quickly as the slow pointer, so the slow pointer lands exactly on the middle node once the fast pointer runs out.',
    edgeCases: [
      { args: [[5], -1], kind: 'edge' },
      { args: [[1, 2], -1], kind: 'edge' },
      { args: [[1, 2, 3], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], -1], kind: 'edge' },
      { args: [[7, 7, 7, 7], -1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Reorder List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'list', hasCycle: false, minN: 0, maxN: 12, min: -50, max: 50 },
    statement:
      'Given the `head` of a singly linked list `L0 -> L1 -> ... -> Ln-1 -> Ln`, reorder it in place into the form:\n\n`L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...`\n\nYou may not simply rearrange the values inside the nodes — return the list whose nodes have been relinked into this order.',
    constraints: '- The number of nodes is in the range `[0, 5*10^4]` (much smaller here, larger in stress tests).\n- `-1000 <= Node.val <= 1000`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values describing the list.',
    outputFormat: 'The reordered list, space-separated (empty line if the list is empty).',
    hints: [
      "The target order interleaves the first half of the list with the reversed second half — think about isolating those two halves first.",
      'Use the slow/fast pointer trick to find the middle and split the list into a front half and a back half, then reverse the back half.',
      'Once you have two equal-ish-length lists (front, and reversed-back), merge them by alternating one node from each.',
    ],
    solutionApproach:
      'Find the middle with slow/fast pointers and split the list into two halves. Reverse the second half in place. Then merge the two halves by alternating nodes: take one node from the first half, then one from the reversed second half, repeatedly, relinking `.next` pointers as you go. O(n) time, O(1) extra space.',
    pythonSolutionCode:
      'def solve(head):\n    if not head or not head.next:\n        return head\n    slow, fast = head, head\n    while fast.next and fast.next.next:\n        slow = slow.next\n        fast = fast.next.next\n    second = slow.next\n    slow.next = None\n    prev = None\n    cur = second\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    second = prev\n    first = head\n    while second:\n        t1 = first.next\n        t2 = second.next\n        first.next = second\n        if t1:\n            second.next = t1\n        first = t1\n        second = t2\n    return head\n',
    solve: (head) => {
      if (!head || !head.next) return head;
      let slow = head;
      let fast = head;
      while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
      }
      let second = slow.next;
      slow.next = null;
      let prev = null;
      let cur = second;
      while (cur) {
        const nxt = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
      }
      second = prev;
      let first = head;
      while (second) {
        const t1 = first.next;
        const t2 = second.next;
        first.next = second;
        if (t1) second.next = t1;
        first = t1;
        second = t2;
      }
      return head;
    },
    exampleExplanation: () => 'Nodes from the front half and the reversed back half are woven together one at a time.',
    edgeCases: [
      { args: [[], -1], kind: 'edge' },
      { args: [[1], -1], kind: 'edge' },
      { args: [[1, 2], -1], kind: 'edge' },
      { args: [[1, 2, 3], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6], -1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Add Two Numbers',
    // No shape supports "two lists in, one list out" directly. The closest fit is
    // `two_int_arrays_to_value`: each linked list is given as the array of its digit
    // values (one digit per original node), least-significant digit first — exactly
    // the classic problem's node-per-digit convention, just serialized as an array.
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'intArray', minN: 1, maxN: 8, min: 0, max: 9 },
    genArgs: (rng, cfg) => {
      const genNumber = () => {
        const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
        const digits = randIntArray(rng, n, cfg.min ?? 0, cfg.max ?? 9);
        if (n > 1) {
          while (digits[n - 1] === 0) digits[n - 1] = randInt(rng, 1, 9);
        }
        return digits;
      };
      return [genNumber(), genNumber()];
    },
    statement:
      'You are given two non-empty linked lists representing two non-negative integers, each provided here as the array of its digit values. The digits are stored in **reverse order** (the least significant digit first), and each node holds a single digit.\n\nAdd the two numbers and return the sum as a linked list (again as an array of digits, least significant first). Assume the two numbers do not have leading zeroes, except the number `0` itself.',
    constraints: '- `1 <= list length <= 8` (larger in stress tests).\n- `0 <= Node.val <= 9`.\n- No leading zero digit, except a single `0` node representing the value zero.',
    inputFormat: 'Line 1: digits of the first number, least-significant first, space-separated. Line 2: digits of the second number, least-significant first, space-separated.',
    outputFormat: 'The digits of the sum, least-significant first, space-separated.',
    hints: [
      "Since digits are already stored least-significant-first, you can add them exactly like grade-school addition, from left to right in the arrays.",
      'Track a running carry as you walk both digit arrays in lockstep; when one array runs out, treat its remaining digits as 0.',
      "Don't stop once both arrays are exhausted if there's still a leftover carry — that becomes one more digit.",
    ],
    solutionApproach:
      'Walk both digit arrays simultaneously (index by index), summing `a[i] + b[i] + carry` at each step, appending `sum % 10` to the result and carrying `floor(sum / 10)` into the next step. Continue until both arrays are exhausted and the carry is zero. This mirrors exactly how the classic solution walks two linked lists node by node while a `carry` variable travels along with it. O(max(n, m)) time.',
    pythonSolutionCode:
      'def solve(a, b):\n    res = []\n    carry = 0\n    i = 0\n    n = max(len(a), len(b))\n    while i < n or carry:\n        x = a[i] if i < len(a) else 0\n        y = b[i] if i < len(b) else 0\n        s = x + y + carry\n        res.append(s % 10)\n        carry = s // 10\n        i += 1\n    return res\n',
    solve: (a, b) => {
      const res = [];
      let carry = 0;
      const n = Math.max(a.length, b.length);
      let i = 0;
      while (i < n || carry) {
        const x = i < a.length ? a[i] : 0;
        const y = i < b.length ? b[i] : 0;
        const sum = x + y + carry;
        res.push(sum % 10);
        carry = Math.floor(sum / 10);
        i += 1;
      }
      return res;
    },
    exampleExplanation: () => "Adding the two numbers digit-by-digit (least significant first), carrying into the next position exactly as long addition would.",
    edgeCases: [
      { args: [[2, 4, 3], [5, 6, 4]], kind: 'edge' },
      { args: [[9, 9, 9], [1]], kind: 'edge' },
      { args: [[0], [0]], kind: 'edge' },
      { args: [[5], [5]], kind: 'edge' },
      { args: [[1, 8], [0]], kind: 'edge' },
      { args: [[9], [9]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Copy List with Random Pointer',
    // No shape models a linked list whose nodes carry a second ("random") pointer, so the
    // closest fit is `two_int_arrays_to_value`: the list is given as its node values plus a
    // parallel array of random-pointer targets (0-indexed position in the list, or -1 for
    // null). solve() still builds real node objects internally and runs the classic
    // interweaving deep-copy algorithm on them — it just reports the resulting copy back in
    // the same (values, random-target-indices) shape it was given, which is the only
    // observable, unambiguous way to verify a deep copy preserved the random-pointer graph.
    shape: 'two_int_arrays_to_value',
    shapeConfig: { outputType: 'intArray', minN: 0, maxN: 10, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 10);
      const values = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
      const randomIdx = Array.from({ length: n }, () => (rng() < 0.3 ? -1 : randInt(rng, 0, Math.max(n - 1, 0))));
      return [values, randomIdx];
    },
    statement:
      "You are given a linked list where every node has, in addition to its `next` pointer, a `random` pointer that can point to **any** node in the list (or to `null`). It is given here as two parallel arrays: `values` (the node values, head to tail) and `randomIndex` (for each node, the 0-indexed position of the node its `random` pointer targets, or `-1` for `null`).\n\nConstruct a **deep copy** of the list — new nodes, with the same values, whose `next` and `random` pointers reference the corresponding *new* nodes (never the originals) — and return it in the same two-array form.",
    constraints:
      '- `0 <= n <= 10` (larger in stress tests).\n- `-50 <= Node.val <= 50`.\n- `randomIndex[i]` is either `-1` or a valid index into the list.',
    inputFormat: 'Line 1: the array `values`, space-separated (empty line if the list is empty). Line 2: the array `randomIndex`, space-separated, same length as `values`.',
    outputFormat: 'One line: for the copied list, each node\'s value immediately followed by its random-pointer target index (or `-1`), all space-separated as `v0 r0 v1 r1 ... v(n-1) r(n-1)` (empty line if the list is empty).',
    hints: [
      "You can't just copy each node's random pointer directly while you build — the node it should point to might not exist yet.",
      "A hash map from each original node to its brand-new clone lets you look up (or lazily create) the correct clone for any random target, in any order.",
      'A neat O(1)-extra-space alternative: splice a clone right after each original node (A -> A\' -> B -> B\' -> ...), use that interleaving to set each clone\'s random pointer in one pass, then unweave the two lists apart.',
    ],
    solutionApproach:
      "Classic O(1)-extra-space technique: first, insert a clone of every node directly after its original, so the list becomes `A -> A' -> B -> B' -> ...`. Then, for every original node whose `random` pointer is set, point its clone's `random` at `original.random.next` (which is exactly that target's clone, thanks to the interleaving). Finally, walk the woven list once more, unweaving it back into the original list and the new cloned list. O(n) time, O(1) extra space beyond the clones themselves.",
    pythonSolutionCode:
      'class _Node:\n    __slots__ = ("val", "next", "random")\n\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n        self.random = None\n\n\ndef solve(values, random_index):\n    n = len(values)\n    if n == 0:\n        return []\n    nodes = [_Node(v) for v in values]\n    for i in range(n - 1):\n        nodes[i].next = nodes[i + 1]\n    for i in range(n):\n        nodes[i].random = nodes[random_index[i]] if random_index[i] != -1 else None\n\n    old_to_new = {}\n    cur = nodes[0]\n    while cur:\n        old_to_new[id(cur)] = _Node(cur.val)\n        cur = cur.next\n    cur = nodes[0]\n    while cur:\n        clone = old_to_new[id(cur)]\n        clone.next = old_to_new.get(id(cur.next))\n        clone.random = old_to_new.get(id(cur.random)) if cur.random else None\n        cur = cur.next\n\n    clones = []\n    cur = old_to_new[id(nodes[0])]\n    while cur:\n        clones.append(cur)\n        cur = cur.next\n    index_of = {id(c): i for i, c in enumerate(clones)}\n\n    flat = []\n    for c in clones:\n        flat.append(c.val)\n        flat.append(index_of[id(c.random)] if c.random else -1)\n    return flat\n',
    solve: (values, randomIndex) => {
      const n = values.length;
      if (n === 0) return [];
      const nodes = values.map((v) => ({ val: v, next: null, random: null }));
      for (let i = 0; i < n - 1; i += 1) nodes[i].next = nodes[i + 1];
      for (let i = 0; i < n; i += 1) nodes[i].random = randomIndex[i] === -1 ? null : nodes[randomIndex[i]];

      for (let i = 0; i < n; i += 1) {
        const clone = { val: nodes[i].val, next: nodes[i].next, random: null };
        nodes[i].next = clone;
      }
      for (let i = 0; i < n; i += 1) {
        if (nodes[i].random) nodes[i].next.random = nodes[i].random.next;
      }

      const clones = [];
      let orig = nodes[0];
      let clone = nodes[0].next;
      while (orig) {
        clones.push(clone);
        orig.next = orig.next.next;
        clone.next = clone.next ? clone.next.next : null;
        orig = orig.next;
        clone = clone.next;
      }

      const indexOf = new Map();
      clones.forEach((c, idx) => indexOf.set(c, idx));
      const flat = [];
      for (const c of clones) {
        flat.push(c.val);
        flat.push(c.random ? indexOf.get(c.random) : -1);
      }
      return flat;
    },
    exampleExplanation: () => "The copy reproduces the same values and the same relative random-pointer targets as the original, but every node is a brand-new object.",
    edgeCases: [
      { args: [[], []], kind: 'edge' },
      { args: [[5], [-1]], kind: 'edge' },
      { args: [[5], [0]], kind: 'edge' },
      { args: [[1, 2], [1, -1]], kind: 'edge' },
      { args: [[7, 13, 11], [2, 0, -1]], kind: 'edge' },
      { args: [[1, 2, 3, 4], [0, 0, 0, 0]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Flatten a Multilevel Doubly Linked List',
    // No shape models a doubly linked list whose nodes may carry a "child" pointer to a
    // whole nested sub-list, so the closest fit is `string_to_string`, using a single
    // compact nested-array notation for the multilevel structure: every entry in a "level"
    // is either a plain integer (a node with no child) or a `[value, childLevel]` pair (a
    // node whose child pointer starts another level, itself following the same grammar,
    // recursively). e.g. `[1,2,[3,[7,8]],4]` means node 3's child list is `7 -> 8`.
    shape: 'string_to_string',
    shapeConfig: { minLevelLen: 1, maxLevelLen: 4, maxNodes: 12, maxDepth: 3, childChance: 0.3, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const state = { count: 0 };
      const maxNodes = cfg.maxNodes ?? 12;
      const maxDepth = cfg.maxDepth ?? 3;
      const buildLevel = (depth) => {
        const len = randInt(rng, cfg.minLevelLen ?? 1, cfg.maxLevelLen ?? 4);
        const level = [];
        for (let i = 0; i < len; i += 1) {
          if (state.count >= maxNodes) break;
          const val = randInt(rng, cfg.min ?? -50, cfg.max ?? 50);
          state.count += 1;
          const canHaveChild = depth < maxDepth && state.count < maxNodes && rng() < (cfg.childChance ?? 0.3);
          if (canHaveChild) level.push([val, buildLevel(depth + 1)]);
          else level.push(val);
        }
        if (!level.length) {
          const val = randInt(rng, cfg.min ?? -50, cfg.max ?? 50);
          state.count += 1;
          level.push(val);
        }
        return level;
      };
      return [JSON.stringify(buildLevel(0))];
    },
    statement:
      "You are given a multilevel doubly linked list: besides the usual `next` and `prev` pointers, some nodes also have a `child` pointer to the head of a separate doubly linked list, which may itself contain nodes with their own children, nested arbitrarily deep.\n\nBecause node values and pointer graphs like this can't be read as a flat line of numbers, this problem's list is given as a nested JSON array: each element of a \"level\" is either a plain integer (a node with no child) or a two-element array `[value, childLevel]` (a node whose `child` pointer leads into the nested level `childLevel`, which follows this same grammar recursively).\n\nFlatten the list so that all nodes appear in a single-level doubly linked list: whenever a node has a child, that child list is spliced in between the node and whatever originally followed it, and this is done for every child list at every depth. Return the values of the fully flattened list, in order.",
    constraints:
      '- The number of nodes is in the range `[0, 12]` (larger in stress tests).\n- `-50 <= Node.val <= 50`.\n- Child nesting depth is at most `3` levels for generated tests.',
    inputFormat: 'Line 1: the list, encoded as a nested JSON array following the grammar described above (e.g. `[1,2,[3,[7,8]],4]`).',
    outputFormat: 'One line: the flattened list\'s values in order, space-separated (empty line if the list is empty).',
    hints: [
      "Whenever you reach a node with a child, that entire child list (however deep it goes) has to be fully resolved and inserted before you continue with the node's original `next`.",
      "This nests naturally as recursion: flattening a level means walking its entries left to right, and whenever an entry has a child, splicing in the fully-flattened child level right after that entry's value.",
      "A node's child list can itself contain nodes with children — make sure your flattening step recurses instead of only handling one level of nesting.",
    ],
    solutionApproach:
      "Process the (nested) representation with a recursive depth-first walk: for each entry in a level, if it's a plain value, emit it; if it's a `[value, childLevel]` pair, emit the value and then recursively flatten and emit everything in `childLevel` before moving to the next entry in the current level. This exactly mirrors the real algorithm on actual nodes, which recursively (or with an explicit stack) splices each child list in between a node and its original `next`, clearing every `child` pointer along the way. O(n) time where n is the total number of nodes across all levels.",
    pythonSolutionCode:
      'import json\n\n\ndef solve(s):\n    structure = json.loads(s)\n\n    def flatten(level):\n        out = []\n        for entry in level:\n            if isinstance(entry, list):\n                out.append(entry[0])\n                out.extend(flatten(entry[1]))\n            else:\n                out.append(entry)\n        return out\n\n    return " ".join(map(str, flatten(structure)))\n',
    solve: (s) => {
      const structure = JSON.parse(s);
      const flatten = (level) => {
        const out = [];
        for (const entry of level) {
          if (Array.isArray(entry)) {
            out.push(entry[0]);
            out.push(...flatten(entry[1]));
          } else {
            out.push(entry);
          }
        }
        return out;
      };
      return flatten(structure).join(' ');
    },
    exampleExplanation: () => "Every child list is spliced in immediately after the node it hangs off of, before the rest of that node's original level continues.",
    edgeCases: [
      { args: ['[]'], kind: 'edge' },
      { args: ['[5]'], kind: 'edge' },
      { args: ['[1,2,[3,[7,8]]]'], kind: 'edge' },
      { args: ['[1,[2,[5]],3]'], kind: 'edge' },
      { args: ['[1,[2,[[3,[4]]]]]'], kind: 'edge' },
      { args: ['[1,[2,[9]],3,[4,[10,11]]]'], kind: 'edge' },
    ],
  },
];
