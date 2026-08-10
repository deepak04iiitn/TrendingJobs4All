import { randInt } from '../dsaIOShapes.js';

export default [
  {
    legacyProblemName: 'Reverse Linked List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'list', hasCycle: false, minN: 0, maxN: 12, min: -50, max: 50 },
    statement: 'Given the `head` of a singly linked list, reverse the list and return the reversed list.',
    constraints: '- The number of nodes is in the range `[0, 5000]`.\n- `-5000 <= Node.val <= 5000`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values describing the list.',
    outputFormat: 'The reversed list, space-separated (empty line if the list is empty).',
    hints: [
      "You can't reverse a singly linked list's pointers in place without first saving where you're going.",
      'At each node, save `next` before you overwrite `node.next` to point backward.',
      'Track a `prev` pointer (starts as null) that becomes the new head once you fall off the end.',
    ],
    solutionApproach:
      'Iterate with three pointers: `prev` (starts null), `cur` (starts at head), and a temporary `next`. At each step, save `cur.next`, point `cur.next` at `prev`, then advance `prev` and `cur`. When `cur` becomes null, `prev` is the new head. O(n) time, O(1) space.',
    pythonSolutionCode:
      'def reverse_list(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return prev\n',
    solve: (head) => {
      let prev = null;
      let cur = head;
      while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
      }
      return prev;
    },
    exampleExplanation: () => 'The list is reversed end to end, so the last node becomes the new head.',
    edgeCases: [
      { args: [[], -1], kind: 'edge' },
      { args: [[1], -1], kind: 'edge' },
      { args: [[1, 2], -1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], -1], kind: 'edge' },
      { args: [[7, 7, 7], -1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Linked List Cycle',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'bool', hasCycle: true, minN: 1, maxN: 12, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12);
      const values = Array.from({ length: n }, () => randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
      const hasCycle = rng() < 0.5;
      const pos = hasCycle && values.length ? randInt(rng, 0, values.length - 1) : -1;
      return [values, pos];
    },
    statement:
      'Given the `head` of a linked list, determine if the linked list has a cycle in it (a node whose `next` pointer, followed repeatedly, eventually leads back to a node already visited).',
    constraints: '- The number of nodes is in the range `[0, 10^4]`.\n- `-10^5 <= Node.val <= 10^5`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values. Line 3: the 0-indexed position the tail connects to for a cycle, or `-1` for no cycle.',
    outputFormat: '`true` if the list has a cycle, `false` otherwise.',
    hints: [
      'You cannot just walk to the end checking for null — a cyclic list never reaches null.',
      "Two pointers moving at different speeds (Floyd's tortoise and hare) will eventually meet if and only if there's a cycle.",
      'If the fast pointer reaches the end (null) first, there is no cycle.',
    ],
    solutionApproach:
      "Floyd's cycle detection: a slow pointer advances one node at a time, a fast pointer advances two. If they ever point to the same node, there's a cycle. If the fast pointer reaches the end first, there isn't. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n',
    solve: (head) => {
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
      }
      return false;
    },
    exampleExplanation: (args, result) => (result ? 'Following next pointers eventually revisits an earlier node.' : 'Following next pointers reaches the end of the list without repeating a node.'),
    edgeCases: [
      { args: [[1], -1], kind: 'edge' },
      { args: [[1], 0], kind: 'edge' },
      { args: [[3, 2, 0, -4], 1], kind: 'edge' },
      { args: [[1, 2], 0], kind: 'edge' },
      { args: [[1, 2], -1], kind: 'edge' },
    ],
  },
];
