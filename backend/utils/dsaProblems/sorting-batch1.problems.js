import { randInt, randIntArray } from '../dsaIOShapes.js';

/** Bottom-up recursive merge sort helper shared by "Sort List". */
function mergeTwoSortedLists(a, b) {
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

function mergeSortLinkedList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const secondHalf = slow.next;
  slow.next = null;
  const left = mergeSortLinkedList(head);
  const right = mergeSortLinkedList(secondHalf);
  return mergeTwoSortedLists(left, right);
}

export default [
  {
    legacyProblemName: 'Merge Sort Implementation',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 0, maxN: 15, min: -50, max: 50 },
    statement:
      'Implement the merge sort algorithm. Given an integer array `nums`, sort it in ascending order using the divide-and-conquer merge sort strategy and return the sorted array.\n\nYou should split the array into halves, recursively sort each half, then merge the two sorted halves back together — not simply call a built-in sort.',
    constraints: '- `0 <= nums.length <= 10^4`\n- `-10^5 <= nums[i] <= 10^5`\n- The output is the unique correct sorted array regardless of which stable sorting method produced it.',
    inputFormat: 'Line 1: the array `nums`, space-separated (empty line if `nums` is empty).',
    outputFormat: 'The array sorted in ascending order, space-separated (empty line if the input is empty).',
    hints: [
      'Merge sort is divide-and-conquer: what happens if you split the array in half and assume each half is already sorted?',
      'Recursively sort the left half and the right half down to base cases of size 0 or 1.',
      'The real work is the merge step: walk two sorted halves with two pointers, always taking the smaller front element, exactly like merging two sorted arrays.',
    ],
    solutionApproach:
      'Recursively split the array at its midpoint until each piece has 0 or 1 elements (trivially sorted). Then merge pairs of sorted pieces back together: walk two pointers, one per half, always appending the smaller current element, and append any remaining tail once one half is exhausted. This gives O(n log n) time and O(n) auxiliary space, and merge sort is stable.',
    pythonSolutionCode:
      'def merge_sort(nums):\n    if len(nums) <= 1:\n        return list(nums)\n    mid = len(nums) // 2\n    left = merge_sort(nums[:mid])\n    right = merge_sort(nums[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i]); i += 1\n        else:\n            res.append(right[j]); j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res\n',
    solve: (nums) => {
      const merge = (a, b) => {
        const res = [];
        let i = 0;
        let j = 0;
        while (i < a.length && j < b.length) {
          if (a[i] <= b[j]) res.push(a[i++]);
          else res.push(b[j++]);
        }
        while (i < a.length) res.push(a[i++]);
        while (j < b.length) res.push(b[j++]);
        return res;
      };
      const mergeSort = (arr) => {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        const left = mergeSort(arr.slice(0, mid));
        const right = mergeSort(arr.slice(mid));
        return merge(left, right);
      };
      return mergeSort(nums);
    },
    exampleExplanation: () => 'The array is split in half recursively until single elements remain, then merged back together in sorted order.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[7]], kind: 'edge' },
      { args: [[3, 3, 3, 3]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[-5, 3, -1, 0, 8, -2]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Quick Sort Implementation',
    shape: 'int_array_to_int_array',
    shapeConfig: { minN: 0, maxN: 15, min: -50, max: 50 },
    statement:
      'Implement the quicksort algorithm. Given an integer array `nums`, sort it in ascending order using the partition-based quicksort strategy and return the sorted array.\n\nPick a pivot, partition the array so smaller elements land left of it and larger elements land right of it, then recursively sort each side — not simply call a built-in sort.',
    constraints: '- `0 <= nums.length <= 10^4`\n- `-10^5 <= nums[i] <= 10^5`\n- The output is the unique correct sorted array regardless of which pivot strategy produced it.',
    inputFormat: 'Line 1: the array `nums`, space-separated (empty line if `nums` is empty).',
    outputFormat: 'The array sorted in ascending order, space-separated (empty line if the input is empty).',
    hints: [
      'Pick one element as a "pivot" — everything smaller should end up to its left, everything larger to its right.',
      'A single left-to-right scan can partition the array around the pivot by swapping elements into place as it goes (Lomuto partition).',
      'Once the pivot is in its final sorted position, recursively quicksort the sub-range to its left and the sub-range to its right — the pivot itself never needs to move again.',
    ],
    solutionApproach:
      "Use Lomuto partitioning: choose the last element of the current range as the pivot, scan the range keeping a boundary index for elements `<= pivot`, swapping as you go, then swap the pivot into place right after that boundary. Recurse on the two resulting sub-ranges (excluding the now-fixed pivot). Average case O(n log n) time, O(1) extra space (in-place, aside from recursion stack); worst case O(n^2) on adversarial pivots.",
    pythonSolutionCode:
      'def quick_sort(nums):\n    arr = list(nums)\n\n    def partition(lo, hi):\n        pivot = arr[hi]\n        i = lo\n        for j in range(lo, hi):\n            if arr[j] <= pivot:\n                arr[i], arr[j] = arr[j], arr[i]\n                i += 1\n        arr[i], arr[hi] = arr[hi], arr[i]\n        return i\n\n    def sort(lo, hi):\n        if lo >= hi:\n            return\n        p = partition(lo, hi)\n        sort(lo, p - 1)\n        sort(p + 1, hi)\n\n    sort(0, len(arr) - 1)\n    return arr\n',
    solve: (nums) => {
      const arr = [...nums];
      const partition = (lo, hi) => {
        const pivot = arr[hi];
        let i = lo;
        for (let j = lo; j < hi; j += 1) {
          if (arr[j] <= pivot) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i += 1;
          }
        }
        [arr[i], arr[hi]] = [arr[hi], arr[i]];
        return i;
      };
      const sort = (lo, hi) => {
        if (lo >= hi) return;
        const p = partition(lo, hi);
        sort(lo, p - 1);
        sort(p + 1, hi);
      };
      sort(0, arr.length - 1);
      return arr;
    },
    exampleExplanation: () => 'Each recursive partition places a pivot in its final position, splitting the rest into smaller and larger sub-arrays until everything is sorted.',
    edgeCases: [
      { args: [[]], kind: 'edge' },
      { args: [[9]], kind: 'edge' },
      { args: [[2, 2, 2, 2]], kind: 'edge' },
      { args: [[1, 2, 3, 4, 5]], kind: 'edge' },
      { args: [[5, 4, 3, 2, 1]], kind: 'edge' },
      { args: [[10, -3, 0, -3, 7, 10]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Sort List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'list', hasCycle: false, minN: 0, maxN: 15, min: -100, max: 100 },
    statement:
      'Given the `head` of a singly linked list, sort it in ascending order and return the sorted list.\n\nA good solution runs in `O(n log n)` time using constant-ish extra space (recursive merge sort adapted for linked lists).',
    constraints: '- The number of nodes is in the range `[0, 5*10^4]`.\n- `-10^5 <= Node.val <= 10^5`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values describing the list.',
    outputFormat: 'The sorted list, space-separated (empty line if the list is empty).',
    hints: [
      "Merge sort adapts naturally to linked lists — you don't need random access, only the ability to split and merge.",
      "Find the middle of the list with slow/fast pointers, split it into two halves there, and recursively sort each half.",
      'Merging two already-sorted linked lists is just like merging two sorted arrays: walk both with a pointer, always attaching the smaller head node next.',
    ],
    solutionApproach:
      "Use the slow/fast pointer trick to find the middle node and split the list into two halves, recursively sort each half the same way, then merge the two sorted halves by repeatedly attaching whichever head node is smaller. Base case: a list of 0 or 1 nodes is already sorted. O(n log n) time, O(log n) recursion stack space.",
    pythonSolutionCode:
      'class _Node:\n    __slots__ = ("val", "next")\n\n    def __init__(self, val=0, nxt=None):\n        self.val = val\n        self.next = nxt\n\n\ndef sort_list(head):\n    if not head or not head.next:\n        return head\n    slow, fast = head, head.next\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    second = slow.next\n    slow.next = None\n    left = sort_list(head)\n    right = sort_list(second)\n    dummy = _Node()\n    node = dummy\n    while left and right:\n        if left.val <= right.val:\n            node.next = left\n            left = left.next\n        else:\n            node.next = right\n            right = right.next\n        node = node.next\n    node.next = left if left else right\n    return dummy.next\n',
    solve: (head) => mergeSortLinkedList(head),
    exampleExplanation: () => 'The list is split at its midpoint recursively, and the sorted halves are merged back together, producing the values in ascending order.',
    edgeCases: [
      { args: [[], -1], kind: 'edge' },
      { args: [[1], -1], kind: 'edge' },
      { args: [[2, 1], -1], kind: 'edge' },
      { args: [[4, 2, 1, 3], -1], kind: 'edge' },
      { args: [[-1, 5, 3, 4, 0], -1], kind: 'edge' },
      { args: [[3, 3, 3, 1, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Insertion Sort List',
    shape: 'linked_list_to_linked_list',
    shapeConfig: { outputType: 'list', hasCycle: false, minN: 0, maxN: 15, min: -100, max: 100 },
    statement:
      'Given the `head` of a singly linked list, sort it in ascending order using the insertion sort algorithm and return the sorted list.\n\nInsertion sort builds the final sorted list one node at a time: it repeatedly removes the next node from the unsorted remainder and inserts it into its correct position among the nodes already sorted.',
    constraints: '- The number of nodes is in the range `[0, 5000]`.\n- `-5000 <= Node.val <= 5000`',
    inputFormat: 'Line 1: count `n`. Line 2: `n` space-separated values describing the list.',
    outputFormat: 'The sorted list, space-separated (empty line if the list is empty).',
    hints: [
      'Keep a separate, growing "sorted" list (using a dummy head), and process the original list one node at a time.',
      'For each node taken from the unsorted remainder, scan the sorted list from its front to find the first place where it still keeps ascending order, and splice the node in there.',
      "Detach each node's `next` pointer before splicing it in, or you'll accidentally keep the rest of the unsorted list attached to it.",
    ],
    solutionApproach:
      "Maintain a dummy head for the sorted portion being built. Walk the original list one node at a time; for each node, scan forward from the dummy head through the sorted portion until you find the last node whose value is `<=` the current node's value (or run off the front), then splice the current node in right after it. This is O(n^2) time in the worst case, O(1) extra space.",
    pythonSolutionCode:
      'class _Node:\n    __slots__ = ("val", "next")\n\n    def __init__(self, val=0, nxt=None):\n        self.val = val\n        self.next = nxt\n\n\ndef insertion_sort_list(head):\n    dummy = _Node()\n    cur = head\n    while cur:\n        nxt = cur.next\n        prev = dummy\n        while prev.next and prev.next.val <= cur.val:\n            prev = prev.next\n        cur.next = prev.next\n        prev.next = cur\n        cur = nxt\n    return dummy.next\n',
    solve: (head) => {
      const dummy = { val: 0, next: null };
      let cur = head;
      while (cur) {
        const next = cur.next;
        let prev = dummy;
        while (prev.next && prev.next.val <= cur.val) prev = prev.next;
        cur.next = prev.next;
        prev.next = cur;
        cur = next;
      }
      return dummy.next;
    },
    exampleExplanation: () => 'Each node is removed from the front of the remaining unsorted list and inserted into its correct place among the already-sorted nodes.',
    edgeCases: [
      { args: [[], -1], kind: 'edge' },
      { args: [[1], -1], kind: 'edge' },
      { args: [[2, 1], -1], kind: 'edge' },
      { args: [[4, 2, 1, 3], -1], kind: 'edge' },
      { args: [[-1, 5, 3, 4, 0], -1], kind: 'edge' },
      { args: [[1, 1, 1, 1]], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Top K Frequent Elements',
    shape: 'k_and_array_to_value',
    shapeConfig: { outputType: 'array', minN: 1, maxN: 15, min: -20, max: 20 },
    genArgs: (rng, cfg) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 15);
      const arr = randIntArray(rng, n, cfg.min ?? -20, cfg.max ?? 20);
      const distinct = new Set(arr).size;
      const k = randInt(rng, 1, distinct);
      return [arr, k];
    },
    statement:
      'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in `nums`.\n\n`k` is guaranteed to be between `1` and the number of distinct elements in `nums`.',
    constraints:
      '- `1 <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`\n- `1 <= k <= number of distinct elements in nums`\n- Elements are ordered by frequency descending; if two or more values tie in frequency (including ties that straddle the cutoff at `k`), they are ordered by ascending value among themselves. This canonical tie-break makes the output unique even though the problem itself accepts any order.',
    inputFormat: 'Line 1: the array `nums`, space-separated. Line 2: the integer `k`.',
    outputFormat: 'The `k` most frequent elements, space-separated, ordered by frequency descending then value ascending on ties.',
    hints: [
      'First count how many times each value appears — a hash map from value to frequency does this in one pass.',
      'You need the k values with the largest counts; sorting all distinct values by count is simplest, though a heap of size k (or bucket sort by frequency) is the more advanced O(n) approach.',
      'Sort the (value, count) pairs by count descending, breaking ties by value so the result is deterministic, then take the first k.',
    ],
    solutionApproach:
      "Build a frequency map with one pass over `nums`. Take its (value, count) entries, sort them by count descending (ties broken by value ascending for a deterministic result), and return the values from the first `k` entries. This is O(n log n) with a full sort; using a min-heap of size k or bucket sort by frequency gets it to O(n log k) / O(n) respectively.",
    pythonSolutionCode:
      'def top_k_frequent(nums, k):\n    freq = {}\n    for n in nums:\n        freq[n] = freq.get(n, 0) + 1\n    items = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [v for v, _ in items[:k]]\n',
    solve: (nums, k) => {
      const freq = new Map();
      for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
      const entries = [...freq.entries()];
      entries.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      return entries.slice(0, k).map(([val]) => val);
    },
    exampleExplanation: (args, result) => `The ${args[1]} most frequent value(s) in the array, ordered by frequency then value, are [${result.join(', ')}].`,
    edgeCases: [
      { args: [[1], 1], kind: 'edge' },
      { args: [[1, 1, 1, 2, 2, 3], 2], kind: 'edge' },
      { args: [[4, 4, 4, 4], 1], kind: 'edge' },
      { args: [[1, 2], 2], kind: 'edge' },
      { args: [[5, 3, 5, 3, 1, 1], 2], kind: 'edge' },
      { args: [[-1, -1, 2, 2, 2, -3], 2], kind: 'edge' },
    ],
  },
];
