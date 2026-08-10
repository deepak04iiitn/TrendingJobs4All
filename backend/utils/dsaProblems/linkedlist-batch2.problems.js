import {
  randInt,
  randIntArray,
  buildLinkedList,
  serializeLinkedList,
  formatByType,
  linesOf,
  tokInts,
  SHAPES,
} from '../dsaIOShapes.js';
import { defaultStarterCode } from '../dsaConstants.js';

/*
 * This batch needs linked-list I/O beyond what the shared `linked_list_to_linked_list`
 * shape supports: that shape's decode() always yields exactly one arg, `(head)` (plus an
 * internally-consumed optional cycle position) — it cannot be reshaped per-spec, only its
 * `gen`/`genArgs` can be overridden. Five of these seven problems genuinely need more than
 * that: two full lists in (Merge Two Sorted Lists), a variable-length array of lists in
 * (Merge k Sorted Lists), or a head plus extra scalar parameter(s) (Reverse Linked List II,
 * Remove Nth Node From End of List, Delete Node in a Linked List).
 *
 * Per the guide's "bespoke: you own everything" allowance, we register a handful of small,
 * fully self-contained additional shapes onto the shared shape registry (`SHAPES` is a
 * plain exported object, not a frozen one). Each id is namespaced with an `ll_` prefix and
 * used by exactly one problem below, so there's no collision risk with the shared catalog
 * or with any other authoring batch. This is a runtime side effect of importing this module
 * — it edits no other file on disk, and it only matters at authoring/seed time: grading later
 * reads pre-computed `stdin`/`expectedStdout` straight from the DB and never calls
 * getShape() again (see backend/services/dsaJudge.service.js), so nothing at request time
 * depends on these extra ids existing.
 *
 * Every solve() below still receives and walks *real* linked-list node objects (per the
 * "decode-before-solve" rule for structural shapes) — the only adaptation is that, since
 * none of these new shapes have a builder-level "node -> display array" special case the way
 * `linked_list_to_linked_list` does, each solve() itself calls `serializeLinkedList(...)` on
 * its way out so the returned value is already a plain array, never a raw node object.
 */

function mergeTwoLists(a, b) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  let p1 = a;
  let p2 = b;
  while (p1 && p2) {
    if (p1.val <= p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }
  tail.next = p1 || p2;
  return dummy.next;
}

// ---- ll_two_ints_to_ll: head + left/right (1-indexed) -> reversed-sublist list ----
SHAPES.ll_two_ints_to_ll = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const values = tokInts(L[1]);
    const [left, right] = tokInts(L[2]);
    const { head } = buildLinkedList(values);
    return [head, left, right];
  },
  encode: (values, left, right) => `${values.length}\n${values.join(' ')}\n${left} ${right}`,
  gen: (rng, cfg = {}) => {
    const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
    const values = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
    const left = randInt(rng, 1, n);
    const right = randInt(rng, left, n);
    return [values, left, right];
  },
  format: (result) => formatByType(result, 'intArray'),
  pretty: (args) => `list = [${args[0].join(',')}], left = ${args[1]}, right = ${args[2]}`,
  starter: (title) => defaultStarterCode(title),
};

// ---- ll_pair_to_ll: two sorted lists in -> one merged sorted list out ----
SHAPES.ll_pair_to_ll = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const values1 = tokInts(L[1]);
    const values2 = tokInts(L[3]);
    const head1 = buildLinkedList(values1).head;
    const head2 = buildLinkedList(values2).head;
    return [head1, head2];
  },
  encode: (values1, values2) => `${values1.length}\n${values1.join(' ')}\n${values2.length}\n${values2.join(' ')}`,
  gen: (rng, cfg = {}) => {
    const mk = () => {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 10);
      return randIntArray(rng, n, cfg.min ?? -100, cfg.max ?? 100).sort((a, b) => a - b);
    };
    return [mk(), mk()];
  },
  format: (result) => formatByType(result, 'intArray'),
  pretty: (args) => `list1 = [${args[0].join(',')}], list2 = [${args[1].join(',')}]`,
  starter: (title) => defaultStarterCode(title),
};

// ---- ll_array_to_ll: k sorted lists in -> one merged sorted list out ----
SHAPES.ll_array_to_ll = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const k = Number(L[0] || 0);
    const heads = [];
    let cursor = 1;
    for (let i = 0; i < k; i += 1) {
      const values = tokInts(L[cursor + 1]);
      heads.push(buildLinkedList(values).head);
      cursor += 2;
    }
    return [heads];
  },
  encode: (listsOfValues) => {
    const parts = [String(listsOfValues.length)];
    for (const vals of listsOfValues) {
      parts.push(String(vals.length));
      parts.push(vals.join(' '));
    }
    return parts.join('\n');
  },
  gen: (rng, cfg = {}) => {
    const k = randInt(rng, cfg.minK ?? 0, cfg.maxK ?? 4);
    const lists = [];
    for (let i = 0; i < k; i += 1) {
      const n = randInt(rng, cfg.minN ?? 0, cfg.maxN ?? 6);
      lists.push(randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50).sort((a, b) => a - b));
    }
    return [lists];
  },
  format: (result) => formatByType(result, 'intArray'),
  pretty: (args) => `lists = [${args[0].map((l) => `[${l.join(',')}]`).join(', ')}]`,
  starter: (title) => defaultStarterCode(title),
};

// ---- ll_int_to_ll: head + n -> list with the nth-from-end node removed ----
SHAPES.ll_int_to_ll = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const values = tokInts(L[1]);
    const n = Number(L[2] || 0);
    const { head } = buildLinkedList(values);
    return [head, n];
  },
  encode: (values, n) => `${values.length}\n${values.join(' ')}\n${n}`,
  gen: (rng, cfg = {}) => {
    const len = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
    const values = randIntArray(rng, len, cfg.min ?? -50, cfg.max ?? 50);
    const n = randInt(rng, 1, len);
    return [values, n];
  },
  format: (result) => formatByType(result, 'intArray'),
  pretty: (args) => `list = [${args[0].join(',')}], n = ${args[1]}`,
  starter: (title) => defaultStarterCode(title),
};

// ---- ll_delete_node: a node reference (NOT the head) -> that node's onward values ----
SHAPES.ll_delete_node = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const values = tokInts(L[1]);
    const delIndex = Number(L[2] || 0);
    const { nodes } = buildLinkedList(values);
    return [nodes[delIndex]];
  },
  encode: (values, delIndex) => `${values.length}\n${values.join(' ')}\n${delIndex}`,
  gen: (rng, cfg = {}) => {
    const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 10);
    const values = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
    const delIndex = randInt(rng, 0, n - 2);
    return [values, delIndex];
  },
  format: (result) => formatByType(result, 'intArray'),
  pretty: (args) => `list = [${args[0].join(',')}], given node's value = ${args[0][args[1]]}`,
  starter: (title) => defaultStarterCode(title),
};

export default [
  {
    legacyProblemName: 'Reverse Linked List II',
    shape: 'll_two_ints_to_ll',
    shapeConfig: { minN: 1, maxN: 12, min: -50, max: 50 },
    statement:
      'Given the `head` of a singly linked list and two 1-indexed positions `left` and `right` (`left <= right`), reverse only the nodes from position `left` to position `right`, and return the resulting list. Everything before position `left` and after position `right` keeps its original order.',
    constraints: '- The number of nodes is in the range `[1, 500]`.\n- `-500 <= Node.val <= 500`\n- `1 <= left <= right <= n`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values. Line 3: two integers `left right` (1-indexed).',
    outputFormat: 'The list after reversing the sublist from position `left` to `right` (inclusive), space-separated.',
    hints: [
      'A dummy node before the head avoids special-casing `left = 1`, where the reversed sublist would otherwise become the new head.',
      "Walk `prev` to the node just before position `left` first — everything from there is what you'll be rearranging.",
      "Instead of physically reversing the sublist and re-splicing it, repeatedly pull the node right after `prev` (the sublist's current start) out and re-insert it right after `prev` — after `right - left` repetitions the sublist ends up fully reversed in one pass.",
    ],
    solutionApproach:
      "Use a dummy node pointing at `head` so `left = 1` needs no special case. Advance `prev` forward `left - 1` steps so it sits just before the sublist, and let `cur = prev.next` be the sublist's first node (it will end up last after reversing). Repeat `right - left` times: detach the node right after `cur`, and re-insert it immediately after `prev` (this is the classic 'move-to-front' one-pass reversal — `cur` itself never moves, everything after it gets threaded in front of it, one node at a time). The result is the sublist reversed in place with no extra pass needed. O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def reverse_between(head, left, right):\n    dummy = ListNode(0, head)\n    prev = dummy\n    for _ in range(left - 1):\n        prev = prev.next\n    cur = prev.next\n    for _ in range(right - left):\n        moved = cur.next\n        cur.next = moved.next\n        moved.next = prev.next\n        prev.next = moved\n    return dummy.next\n',
    solve: (head, left, right) => {
      const dummy = { val: 0, next: head };
      let prev = dummy;
      for (let i = 1; i < left; i += 1) prev = prev.next;
      const cur = prev.next;
      for (let i = 0; i < right - left; i += 1) {
        const moved = cur.next;
        cur.next = moved.next;
        moved.next = prev.next;
        prev.next = moved;
      }
      return serializeLinkedList(dummy.next);
    },
    exampleExplanation: (args, result) =>
      `Reversing positions ${args[1]} through ${args[2]} of [${args[0].join(',')}] gives [${result.join(',')}].`,
    edgeCases: [
      { args: [[5], 1, 1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], 2, 4], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], 1, 5], kind: 'edge' },
      { args: [[1, 2], 1, 2], kind: 'edge' },
      { args: [[3, 5], 1, 1], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], 3, 3], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Linked List Cycle II',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'int', hasCycle: true, minN: 1, maxN: 12, min: -50, max: 50 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12);
      const values = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
      const hasCycle = rng() < 0.5;
      const pos = hasCycle && values.length ? randInt(rng, 0, values.length - 1) : -1;
      return [values, pos];
    },
    statement:
      'Given the `head` of a linked list, determine whether it contains a cycle, and if so, identify exactly where it begins. A cycle exists if some node\'s `next` pointer, followed repeatedly, eventually leads back to a node visited earlier.\n\nSince this is a text-based judge (there is no way to "return a pointer" over stdout), return the **0-indexed distance from `head`** to the node where the cycle begins, or `-1` if there is no cycle.',
    constraints: '- The number of nodes is in the range `[0, 10^4]`.\n- `-10^5 <= Node.val <= 10^5`\n- The list is not modified.',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values. Line 3: the 0-indexed position the tail connects to for a cycle, or `-1` for no cycle.',
    outputFormat: 'A single integer: the 0-indexed distance from head to the cycle\'s entry node, or `-1` if there is no cycle.',
    hints: [
      "Detecting a cycle with slow/fast pointers is only half the problem — the node where slow and fast first meet is almost never the actual start of the cycle.",
      'There\'s a well-known mathematical fact here: once slow and fast meet inside the cycle, resetting a fresh pointer to `head` and advancing it *and* the meeting pointer one step at a time will make them collide exactly at the cycle\'s entry node.',
      "Once you have the entry node, its distance from `head` is just how many steps it took your reset pointer to reach it.",
    ],
    solutionApproach:
      "First run Floyd's tortoise-and-hare: `slow` advances one node at a time, `fast` advances two; if `fast` (or `fast.next`) hits null, there's no cycle. If they meet, a cycle exists. Then reset a third pointer to `head` and advance it together with the meeting pointer, one step at a time — the point where they collide is provably the cycle's entry node. Counting those synchronized steps from `head` gives the 0-indexed distance to report. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def cycle_entry_index(head):\n    slow = fast = head\n    has_cycle = False\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            has_cycle = True\n            break\n    if not has_cycle:\n        return -1\n    ptr = head\n    index = 0\n    while ptr is not slow:\n        ptr = ptr.next\n        slow = slow.next\n        index += 1\n    return index\n',
    solve: (head) => {
      let slow = head;
      let fast = head;
      let hasCycle = false;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
          hasCycle = true;
          break;
        }
      }
      if (!hasCycle) return -1;
      let ptr = head;
      let index = 0;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
        index += 1;
      }
      return index;
    },
    exampleExplanation: (args, result) =>
      result === -1
        ? 'Following next pointers reaches the end of the list without repeating a node, so there is no cycle.'
        : `The tail loops back to the node at index ${result}, so that is where the cycle begins.`,
    edgeCases: [
      { args: [[1], -1], kind: 'edge' },
      { args: [[1], 0], kind: 'edge' },
      { args: [[3, 2, 0, -4], 1], kind: 'edge' },
      { args: [[1, 2], 0], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], -1], kind: 'edge' },
      { args: [[1, 2, 3], 2], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Merge Two Sorted Lists',
    shape: 'll_pair_to_ll',
    shapeConfig: { minN: 0, maxN: 10, min: -100, max: 100 },
    statement:
      'You are given the heads of two linked lists, `list1` and `list2`, each already sorted in non-decreasing order. Merge them into a single sorted list by splicing their nodes together, and return the head of the merged list.',
    constraints: '- The number of nodes in each list is in the range `[0, 50]`.\n- `-100 <= Node.val <= 100`\n- Both `list1` and `list2` are sorted in non-decreasing order on input.',
    inputFormat: 'Line 1: count `n1`. Line 2: `n1` values (`list1`, ascending). Line 3: count `n2`. Line 4: `n2` values (`list2`, ascending).',
    outputFormat: 'The merged sorted list, space-separated (empty line if both input lists are empty).',
    hints: [
      "Since both lists are already sorted, you never need to compare more than the two current front nodes at any moment.",
      'A dummy head node lets you build the merged list by always appending without worrying about what the very first node of the result will be.',
      "Walk both lists with one pointer each, always attaching whichever current node has the smaller value, then advance only that pointer — once one list runs out, attach the rest of the other list directly.",
    ],
    solutionApproach:
      "Build the result with a dummy head and a `tail` pointer. Compare the two lists' current nodes; attach the smaller (or either, if equal) to `tail.next`, advance that list's pointer, and advance `tail`. Once either list is exhausted, attach the remainder of the other list in one shot — since it's already sorted, no further comparisons are needed. O(n + m) time, O(1) extra space (nodes are relinked, not copied).",
    pythonSolutionCode:
      'def merge_two_lists(l1, l2):\n    dummy = ListNode(0)\n    tail = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 or l2\n    return dummy.next\n',
    solve: (l1, l2) => serializeLinkedList(mergeTwoLists(l1, l2)),
    exampleExplanation: (args, result) => `Splicing [${args[0].join(',')}] and [${args[1].join(',')}] together in sorted order gives [${result.join(',')}].`,
    edgeCases: [
      { args: [[], []], kind: 'edge' },
      { args: [[], [0]], kind: 'edge' },
      { args: [[1, 2, 4], []], kind: 'edge' },
      { args: [[1, 2, 4], [1, 3, 4]], kind: 'edge' },
      { args: [[-5, -2, 0], [-4, -1, 3]], kind: 'edge' },
      { args: [[2, 2, 2], [2, 2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Merge k Sorted Lists',
    shape: 'll_array_to_ll',
    shapeConfig: { minK: 0, maxK: 4, minN: 0, maxN: 6, min: -50, max: 50 },
    statement:
      'You are given an array `lists` of `k` linked lists, each already sorted in non-decreasing order. Merge all of them into one sorted linked list and return its head.',
    constraints: '- `0 <= k <= 10^4`\n- `0 <= lists[i].length <= 500`\n- `-10^4 <= lists[i][j] <= 10^4`\n- Every individual list is sorted in non-decreasing order on input.',
    inputFormat: 'Line 1: `k` (number of lists). Then, for each of the `k` lists: one line with its length, followed by one line with its (possibly empty) space-separated values.',
    outputFormat: 'The fully merged, non-decreasing sorted list across all `k` lists, space-separated (empty line if the result is empty).',
    hints: [
      "Merging two sorted lists at a time is something you already know how to do in O(n + m) — the question is how to extend that to k lists without it costing O(k) work per node.",
      "Repeatedly merging one list into a running 'result so far' works but costs O(n * k) in the worst case — pairing lists up and merging in rounds does better.",
      "Merge the lists in pairs (list 0 with list 1, list 2 with list 3, ...), then merge those results in pairs again, and so on — this halves the number of lists each round, like the merge step of merge sort, giving O(N log k) total for N total nodes.",
    ],
    solutionApproach:
      "Use pairwise divide-and-conquer: merge the lists two at a time (list[0] with list[1], list[2] with list[3], ...) using the standard two-sorted-lists merge, producing half as many lists. Repeat this pairing-and-merging process on the resulting lists until only one list remains. Each of the O(log k) rounds does O(N) total work across all lists combined (N being the total number of nodes), for O(N log k) overall — notably better than repeatedly folding one list into a running total, which costs O(N * k). (An equivalent alternative is a min-heap of size k holding each list's current front node.)",
    pythonSolutionCode:
      'def merge_two(a, b):\n    dummy = ListNode(0)\n    tail = dummy\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next\n\n\ndef merge_k_lists(lists):\n    if not lists:\n        return None\n    lists = list(lists)\n    while len(lists) > 1:\n        merged = []\n        for i in range(0, len(lists), 2):\n            if i + 1 < len(lists):\n                merged.append(merge_two(lists[i], lists[i + 1]))\n            else:\n                merged.append(lists[i])\n        lists = merged\n    return lists[0]\n',
    solve: (lists) => {
      if (!lists.length) return [];
      let round = lists.slice();
      while (round.length > 1) {
        const merged = [];
        for (let i = 0; i < round.length; i += 2) {
          if (i + 1 < round.length) merged.push(mergeTwoLists(round[i], round[i + 1]));
          else merged.push(round[i]);
        }
        round = merged;
      }
      return serializeLinkedList(round[0]);
    },
    exampleExplanation: (args, result) =>
      `Merging all ${args[0].length} list(s) — [${args[0].map((l) => `[${l.join(',')}]`).join(', ')}] — in sorted order gives [${result.join(',')}].`,
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[[]]], kind: 'edge' },
      { args: [[[], []]], kind: 'edge' },
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], kind: 'edge' },
      { args: [[[5]]], kind: 'edge' },
      { args: [[[1, 2, 3], []]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Remove Nth Node From End of List',
    shape: 'll_int_to_ll',
    shapeConfig: { minN: 1, maxN: 15, min: -50, max: 50 },
    statement:
      'Given the `head` of a linked list, remove the `n`th node counting from the end of the list (`n = 1` means the last node), and return the head of the resulting list.',
    constraints: '- The number of nodes in the list is `sz`.\n- `1 <= sz <= 30`\n- `0 <= Node.val <= 100`\n- `1 <= n <= sz`',
    inputFormat: 'Line 1: count `n` (list length). Line 2: `n` space-separated values. Line 3: the integer `k` — remove the `k`th node from the end.',
    outputFormat: 'The list after removing that node, space-separated (empty line if the result is empty).',
    hints: [
      "Doing this in two passes (count the length, then walk to the right spot) works, but a single pass is possible with two pointers offset by a fixed gap.",
      "Advance a 'fast' pointer `n` steps ahead of a 'slow' pointer first — once that gap is set, moving both one step at a time keeps `fast` exactly `n` nodes ahead of `slow`.",
      "When `fast` runs off the end of the list, `slow` is sitting exactly at the node *before* the one to remove — a dummy head node handles the edge case where the node to remove is the head itself.",
    ],
    solutionApproach:
      "Use a dummy node before `head` so removing the head itself needs no special case. Advance a `fast` pointer `n` steps from the dummy first, then advance both `fast` and a `slow` pointer (starting at the dummy) together until `fast` reaches the last node. At that point `slow` is right before the target node, so `slow.next = slow.next.next` removes it in a single pass. O(n) time, O(1) space.",
    pythonSolutionCode:
      'def remove_nth_from_end(head, n):\n    dummy = ListNode(0, head)\n    fast = dummy\n    for _ in range(n):\n        fast = fast.next\n    slow = dummy\n    while fast.next:\n        fast = fast.next\n        slow = slow.next\n    slow.next = slow.next.next\n    return dummy.next\n',
    solve: (head, n) => {
      const dummy = { val: 0, next: head };
      let fast = dummy;
      for (let i = 0; i < n; i += 1) fast = fast.next;
      let slow = dummy;
      while (fast.next) {
        fast = fast.next;
        slow = slow.next;
      }
      slow.next = slow.next.next;
      return serializeLinkedList(dummy.next);
    },
    exampleExplanation: (args, result) =>
      `Removing the node ${args[1]} from the end of [${args[0].join(',')}] leaves [${result.join(',')}].`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 2], 1], kind: 'edge' },
      { args: [[1, 2], 2], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], 2], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5], 5], kind: 'edge' },
      { args: [[7, 7, 7], 1], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Delete Node in a Linked List',
    shape: 'll_delete_node',
    shapeConfig: { minN: 2, maxN: 12, min: -50, max: 50 },
    statement:
      'You are given a reference to a node (guaranteed **not** the last node) inside a singly linked list — but crucially, you do **not** have access to the list\'s `head`. Delete that node from the list by only ever touching the node you were handed (and the nodes reachable from it).\n\nBecause the whole point of this problem is operating without `head`, this judge only shows you the values reachable starting from the node you\'re given (its new value, then everything after it) after your modification — not the untouched part of the list before it, which you have no way to reach anyway.',
    constraints: '- The number of nodes in the list is in the range `[2, 1000]`.\n- `-1000 <= Node.val <= 1000`\n- The node to delete is not the last node, and it is a valid node of the list.',
    inputFormat:
      "Line 1: count `n` (the full original list's length, for constructing the test case). Line 2: `n` space-separated values. Line 3: the 0-indexed position of the node you are given access to (guaranteed not the last index).",
    outputFormat: "The values reachable from the given node after your modification, from that node through the end of the list, space-separated.",
    hints: [
      "You can't unlink the given node the normal way (you'd need the node *before* it, which you don't have) — but you can still change what it looks like from the outside.",
      "Nothing says you have to keep the given node's original value — copy the next node's value into it instead.",
      "Once the given node holds a copy of its successor's value, skip that successor entirely by pointing the given node's `next` at `next.next` — the node is now functionally deleted.",
    ],
    solutionApproach:
      "Since the node before the target is unreachable, delete 'forward' instead: overwrite the given node's value with its successor's value (`node.val = node.next.val`), then unlink that successor (`node.next = node.next.next`). The given node now holds what used to be its neighbor's data and skips over the (now-orphaned) neighbor entirely — from every other node's perspective, the original node has vanished. This only works because the node is guaranteed not to be the last one (it needs a successor to copy from). O(1) time and space.",
    pythonSolutionCode: 'def delete_node(node):\n    node.val = node.next.val\n    node.next = node.next.next\n',
    solve: (node) => {
      node.val = node.next.val;
      node.next = node.next.next;
      return serializeLinkedList(node);
    },
    exampleExplanation: (args) =>
      `The given node originally held ${args[0][args[1]]}; after copying its successor's value forward and unlinking that successor, the node effectively disappears from the list.`,
    edgeCases: [
      { args: [[4, 5, 1, 9], 1], kind: 'edge' },
      { args: [[4, 5, 1, 9], 2], kind: 'edge' },
      { args: [[1, 2], 0], kind: 'edge' },
      { args: [[1, 2, 3], 0], kind: 'edge' },
      { args: [[7, 7, 7, 7], 1], kind: 'edge' },
      { args: [[-5, 3, -2, 10], 2], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Palindrome Linked List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'bool', hasCycle: false, minN: 0, maxN: 15, min: 0, max: 9 },
    statement:
      'Given the `head` of a singly linked list, return `true` if the sequence of values it holds reads the same forwards and backwards, and `false` otherwise.',
    constraints: '- The number of nodes is in the range `[0, 10^5]`.\n- `0 <= Node.val <= 9`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values.',
    outputFormat: '`true` or `false`.',
    hints: [
      "Copying every value into an array and checking it against its reverse works, but it costs O(n) extra space — can you avoid that?",
      "A slow/fast pointer pair finds the middle of the list in one pass, the same way it does in cycle detection.",
      "Reverse the second half of the list in place, then walk it alongside the first half comparing values — this gets you down to O(1) extra space (you can even re-reverse the second half afterward to restore the original list, though this judge doesn't require that).",
    ],
    solutionApproach:
      "Find the middle of the list with slow/fast pointers (slow advances one step, fast advances two). Reverse the second half of the list starting at `slow` using the standard in-place reversal. Then walk a pointer from `head` and a pointer from the head of the reversed second half simultaneously, comparing values at each step — a mismatch means it's not a palindrome, and reaching the end of the (shorter) reversed half without one means it is. O(n) time, O(1) extra space.",
    pythonSolutionCode:
      'def is_palindrome(head):\n    if not head or not head.next:\n        return True\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    prev = None\n    cur = slow\n    while cur:\n        cur.next, prev, cur = prev, cur, cur.next\n    p1, p2 = head, prev\n    while p2:\n        if p1.val != p2.val:\n            return False\n        p1, p2 = p1.next, p2.next\n    return True\n',
    solve: (head) => {
      if (!head || !head.next) return true;
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
      }
      let prev = null;
      let cur = slow;
      while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
      }
      let p1 = head;
      let p2 = prev;
      let ok = true;
      while (p2) {
        if (p1.val !== p2.val) {
          ok = false;
          break;
        }
        p1 = p1.next;
        p2 = p2.next;
      }
      return ok;
    },
    exampleExplanation: (args, result) =>
      result ? 'The sequence of values reads identically forwards and backwards.' : 'The sequence of values does not match its own reverse.',
    edgeCases: [
      { args: [[], -1], kind: 'edge' },
      { args: [[1], -1], kind: 'edge' },
      { args: [[1, 2], -1], kind: 'edge' },
      { args: [[1, 2, 1], -1], kind: 'edge' },
      { args: [[1, 2, 2, 1], -1], kind: 'edge' },
      { args: [[1, 2, 3], -1], kind: 'edge' },
    ],
  },
];
