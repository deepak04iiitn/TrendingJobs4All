import { randInt, randString, shuffle, formatByType, linesOf, tokInts, SHAPES } from '../dsaIOShapes.js';

/*
 * "Word Search II" needs a board (2D grid of letters) *and* a list of words as two
 * independent inputs, which no shape in the shared catalog provides (the closest,
 * `matrix_to_value_or_matrix`, only carries a single numeric matrix). Per the guide's
 * "bespoke: you own everything" allowance -- and following the precedent set by
 * `backtracking-batch3.problems.js`'s `bt_board_and_word` shape -- we register one
 * small, self-contained shape onto the shared registry (`SHAPES` is a plain exported
 * object, not frozen). It's namespaced `trieb1_board_and_words` so it can't collide
 * with the shared catalog or any other authoring batch's shapes. This is a runtime
 * side effect of importing this module only; it edits no file on disk, and only
 * matters at authoring/seed time (grading later reads pre-computed stdin/expectedStdout
 * from the DB and never calls getShape() again).
 */
SHAPES.trieb1_board_and_words = {
  decode: (stdin) => {
    const L = linesOf(stdin);
    const [rows] = tokInts(L[0]);
    const board = [];
    for (let r = 0; r < rows; r += 1) board.push(String(L[1 + r] ?? '').split(''));
    const wordCount = Number(L[1 + rows] || 0);
    const words = [];
    for (let i = 0; i < wordCount; i += 1) words.push(L[2 + rows + i] ?? '');
    return [board, words];
  },
  encode: (board, words) =>
    `${board.length} ${board[0]?.length || 0}\n${board.map((row) => row.join('')).join('\n')}\n${words.length}\n${words.join('\n')}`,
  gen: (rng, cfg = {}) => {
    // Clamp defensively regardless of what stress-scaling does to maxRows/maxCols/maxWordLen
    // upstream (dsaProblemBuilder.js multiplies those keys by 6 for non-unordered_listing
    // shapes) -- a small letter board and short words keep the trie-DFS fast no matter what.
    const rows = randInt(rng, cfg.minRows ?? 3, Math.min(cfg.maxRows ?? 4, 6));
    const cols = randInt(rng, cfg.minCols ?? 3, Math.min(cfg.maxCols ?? 4, 6));
    const alphabet = cfg.alphabet || 'aeost';
    const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => alphabet[randInt(rng, 0, alphabet.length - 1)]));
    const maxWordLen = Math.min(cfg.maxWordLen ?? 4, rows * cols);
    const wordCount = randInt(rng, cfg.minWords ?? 2, Math.min(cfg.maxWords ?? 5, 8));
    const words = new Set();
    for (let i = 0; i < wordCount; i += 1) {
      let word = null;
      if (rng() < 0.65) {
        const len = randInt(rng, 1, maxWordLen);
        word = extractPathWord(rng, board, len);
      }
      if (!word) word = randString(rng, randInt(rng, 1, maxWordLen), alphabet);
      words.add(word);
    }
    return [board, [...words]];
  },
  format: (result) => formatByType(result, 'stringArray'),
  pretty: (args) => `board = [${args[0].map((row) => `"${row.join('')}"`).join(', ')}], words = [${args[1].map((w) => `"${w}"`).join(', ')}]`,
  starter: (title) =>
    genericStarterFor(
      title,
      'Line 1 is "rows cols"; next `rows` lines are the board rows (letters, no separators); then a word count, then that many words (one per line).'
    ),
};

/** Local copy of dsaIOShapes.js's genericStarter (not exported there) -- same shape, own name to avoid import churn. */
function genericStarterFor(title, formatNote) {
  const langs = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'csharp', 'ruby'];
  const out = {};
  for (const lang of langs) {
    const commentStyle = lang === 'python' || lang === 'ruby' ? '#' : lang === 'c' ? '/*' : '//';
    const line = commentStyle === '/*' ? `/* TODO: Implement ${title}. ${formatNote} */` : `${commentStyle} TODO: Implement ${title}. ${formatNote}`;
    out[lang] = `${line}\n`;
  }
  return out;
}

/** Walks a random simple path of `len` cells from a random start, returning the letters
 * along that path as a string -- guarantees the word genuinely exists on the board. */
function extractPathWord(rng, board, len) {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  if (!rows || !cols) return null;
  const startR = randInt(rng, 0, rows - 1);
  const startC = randInt(rng, 0, cols - 1);
  const visited = new Set();
  const path = [];
  const dfs = (r, c, remaining) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const key = `${r},${c}`;
    if (visited.has(key)) return false;
    visited.add(key);
    path.push(board[r][c]);
    if (remaining === 1) return true;
    const dirs = shuffle(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc, remaining - 1)) return true;
    }
    path.pop();
    visited.delete(key);
    return false;
  };
  return dfs(startR, startC, len) ? path.join('') : null;
}

export default [
  {
    legacyProblemName: 'Implement Trie (Prefix Tree)',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'bool',
      queryOps: ['search', 'startsWith'],
      genOps: (rng) => {
        const alphabet = 'abcdefghij';
        const words = [];
        const ops = [];
        const count = randInt(rng, 6, 14);
        for (let i = 0; i < count; i += 1) {
          const choices = words.length ? ['insert', 'insert', 'search', 'startsWith'] : ['insert'];
          const kind = choices[randInt(rng, 0, choices.length - 1)];
          if (kind === 'insert') {
            const w = randString(rng, randInt(rng, 1, 6), alphabet);
            ops.push({ name: 'insert', args: [w] });
            words.push(w);
          } else if (kind === 'search') {
            const w = rng() < 0.6 && words.length ? words[randInt(rng, 0, words.length - 1)] : randString(rng, randInt(rng, 1, 6), alphabet);
            ops.push({ name: 'search', args: [w] });
          } else {
            let prefix;
            if (rng() < 0.6 && words.length) {
              const w = words[randInt(rng, 0, words.length - 1)];
              prefix = w.slice(0, randInt(rng, 1, w.length));
            } else {
              prefix = randString(rng, randInt(rng, 1, 6), alphabet);
            }
            ops.push({ name: 'startsWith', args: [prefix] });
          }
        }
        if (!words.length) ops.unshift({ name: 'insert', args: [randString(rng, randInt(rng, 1, 6), alphabet)] });
        return ops;
      },
    },
    statement:
      'Design a Trie (prefix tree) that stores a set of lowercase words and answers two kinds of queries efficiently.\n\nImplement the `Trie` operations:\n- `insert(word)` -- adds `word` to the trie.\n- `search(word)` -- returns `true` if `word` was previously inserted exactly (a full match, not just a prefix).\n- `startsWith(prefix)` -- returns `true` if any previously inserted word begins with `prefix`.',
    constraints:
      '- `1 <= word.length, prefix.length <= 2000`\n- `word` and `prefix` consist only of lowercase English letters.\n- At most `3*10^4` calls total to `insert`, `search`, and `startsWith`.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName arg`, where `opName` is `insert`, `search`, or `startsWith`, and `arg` is the single word/prefix argument.',
    outputFormat: 'One line per `search`/`startsWith` call, in order, printing `true` or `false`. `insert` produces no output.',
    hints: [
      'A hash set of whole words answers search() fine, but startsWith() needs to check every stored word against the prefix -- that gets slow as the trie grows.',
      'Structure the data as a tree of characters: each node has up to 26 children (one per letter) plus a flag marking "a word ends here".',
      'insert() walks/creates one node per character of the word and flags the final node. search() walks the same path and requires both a full path match AND the end-of-word flag; startsWith() only requires the path to exist -- the flag does not matter.',
    ],
    solutionApproach:
      "Model the trie as nested objects (or a fixed-size array of 26 children per node). `insert(word)` walks from the root, creating a child node for each character that doesn't exist yet, and marks the final node as a word end. A shared helper walks the trie following the characters of a given string and returns the node reached (or null if the path breaks early); `search(word)` requires that walk to succeed AND land on a node flagged as a word end, while `startsWith(prefix)` only requires the walk to succeed. Every operation is O(length of the argument), independent of how many words are stored.",
    pythonSolutionCode:
      "class Trie:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n    def insert(self, word):\n        node = self\n        for ch in word:\n            node = node.children.setdefault(ch, Trie())\n        node.is_word = True\n\n    def _walk(self, s):\n        node = self\n        for ch in s:\n            if ch not in node.children:\n                return None\n            node = node.children[ch]\n        return node\n\n    def search(self, word):\n        node = self._walk(word)\n        return node is not None and node.is_word\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None\n\n\ndef solve(ops):\n    trie = Trie()\n    results = []\n    for name, *args in ops:\n        if name == 'insert':\n            trie.insert(args[0])\n        elif name == 'search':\n            results.append(trie.search(args[0]))\n        elif name == 'startsWith':\n            results.append(trie.starts_with(args[0]))\n    return results\n",
    solve: (ops) => {
      const root = {};
      const walk = (s) => {
        let node = root;
        for (const ch of s) {
          if (!node.children || !node.children[ch]) return null;
          node = node.children[ch];
        }
        return node;
      };
      const results = [];
      for (const op of ops) {
        if (op.name === 'insert') {
          let node = root;
          for (const ch of op.args[0]) {
            node.children = node.children || {};
            node = node.children[ch] = node.children[ch] || {};
          }
          node.isWord = true;
        } else if (op.name === 'search') {
          const node = walk(op.args[0]);
          results.push(!!node && !!node.isWord);
        } else if (op.name === 'startsWith') {
          results.push(walk(op.args[0]) !== null);
        }
      }
      return results;
    },
    exampleExplanation: () => "Each query (search/startsWith) reflects the trie's contents built up by the preceding insert calls.",
    edgeCases: [
      {
        args: [
          [
            { name: 'insert', args: ['apple'] },
            { name: 'search', args: ['apple'] },
            { name: 'search', args: ['app'] },
            { name: 'startsWith', args: ['app'] },
            { name: 'insert', args: ['app'] },
            { name: 'search', args: ['app'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'insert', args: ['a'] },
            { name: 'search', args: ['a'] },
            { name: 'startsWith', args: ['a'] },
            { name: 'search', args: ['b'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'insert', args: ['cat'] },
            { name: 'insert', args: ['cat'] },
            { name: 'search', args: ['cat'] },
            { name: 'startsWith', args: ['ca'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'insert', args: ['a'] },
            { name: 'insert', args: ['ab'] },
            { name: 'insert', args: ['abc'] },
            { name: 'search', args: ['ab'] },
            { name: 'startsWith', args: ['abcd'] },
            { name: 'search', args: ['abc'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'search', args: ['x'] },
            { name: 'startsWith', args: ['x'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'insert', args: ['aaa'] },
            { name: 'search', args: ['aa'] },
            { name: 'startsWith', args: ['aa'] },
            { name: 'search', args: ['aaa'] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Design Add and Search Words Data Structure',
    shape: 'stateful_ops',
    shapeConfig: {
      resultType: 'bool',
      queryOps: ['search'],
      genOps: (rng) => {
        const alphabet = 'abcde';
        const words = [];
        const ops = [];
        const count = randInt(rng, 6, 14);
        for (let i = 0; i < count; i += 1) {
          const choices = words.length ? ['addWord', 'addWord', 'search', 'search'] : ['addWord'];
          const kind = choices[randInt(rng, 0, choices.length - 1)];
          if (kind === 'addWord') {
            const w = randString(rng, randInt(rng, 1, 5), alphabet);
            ops.push({ name: 'addWord', args: [w] });
            words.push(w);
          } else {
            const r = rng();
            let pattern;
            if (r < 0.4 && words.length) {
              pattern = words[randInt(rng, 0, words.length - 1)];
            } else if (r < 0.75 && words.length) {
              const w = words[randInt(rng, 0, words.length - 1)];
              const chars = w.split('');
              chars[randInt(rng, 0, chars.length - 1)] = '.';
              pattern = chars.join('');
            } else {
              pattern = randString(rng, randInt(rng, 1, 5), alphabet);
            }
            ops.push({ name: 'search', args: [pattern] });
          }
        }
        if (!words.length) ops.unshift({ name: 'addWord', args: [randString(rng, randInt(rng, 1, 5), alphabet)] });
        return ops;
      },
    },
    statement:
      'Design a data structure that supports adding lowercase words and then searching for a word pattern that may include the wildcard character `.`, which matches any single letter.\n\nImplement the operations:\n- `addWord(word)` -- adds `word` to the structure.\n- `search(pattern)` -- returns `true` if any previously added word matches `pattern` exactly in length, where each `.` in `pattern` may match any one letter and every non-`.` character must match literally.',
    constraints:
      '- `1 <= word.length, pattern.length <= 25`\n- `word` in `addWord` consists only of lowercase English letters.\n- `pattern` in `search` consists of lowercase English letters and/or the wildcard `.`.\n- At most `10^4` calls total to `addWord` and `search`.',
    inputFormat:
      'Line 1: operation count `M`. Next `M` lines: `opName arg`, where `opName` is `addWord` or `search`, and `arg` is the word or wildcard pattern.',
    outputFormat: 'One line per `search` call, in order, printing `true` or `false`. `addWord` produces no output.',
    hints: [
      "Without wildcards this would be a plain Trie lookup -- the challenge is that a single `.` can stand for any of up to 26 letters at that position.",
      'Store added words in a Trie exactly like Implement Trie. For search, walk the pattern through the trie character by character, but when you hit a `.`, you must try every child of the current node instead of just one.',
      "Write search as a recursive helper: at a literal character, follow that one child (or fail if it doesn't exist); at `.`, recurse into every child and succeed if any branch succeeds; success at the end of the pattern requires the current node to be a word end.",
    ],
    solutionApproach:
      "Store words in a Trie identical to Implement Trie's. `search(pattern)` recurses over the pattern's index and the current trie node: at the end of the pattern, the match succeeds only if the current node is flagged as a word end; for a literal character, only the matching child (if any) is explored; for `.`, every child of the current node is explored, and the search succeeds if any of those recursive branches succeeds. In the worst case (a pattern of all dots) this degrades to visiting every stored word, but literal characters prune the branching sharply in practice.",
    pythonSolutionCode:
      "class WordDictionary:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n    def add_word(self, word):\n        node = self\n        for ch in word:\n            node = node.children.setdefault(ch, WordDictionary())\n        node.is_word = True\n\n    def search(self, pattern):\n        def dfs(node, i):\n            if i == len(pattern):\n                return node.is_word\n            ch = pattern[i]\n            if ch == '.':\n                return any(dfs(child, i + 1) for child in node.children.values())\n            if ch not in node.children:\n                return False\n            return dfs(node.children[ch], i + 1)\n        return dfs(self, 0)\n",
    solve: (ops) => {
      const root = {};
      const addWord = (w) => {
        let node = root;
        for (const ch of w) {
          node.children = node.children || {};
          node = node.children[ch] = node.children[ch] || {};
        }
        node.isWord = true;
      };
      const searchFrom = (node, pattern, i) => {
        if (i === pattern.length) return !!node.isWord;
        const ch = pattern[i];
        if (ch === '.') {
          if (!node.children) return false;
          return Object.keys(node.children).some((key) => searchFrom(node.children[key], pattern, i + 1));
        }
        if (!node.children || !node.children[ch]) return false;
        return searchFrom(node.children[ch], pattern, i + 1);
      };
      const results = [];
      for (const op of ops) {
        if (op.name === 'addWord') addWord(op.args[0]);
        else if (op.name === 'search') results.push(searchFrom(root, op.args[0], 0));
      }
      return results;
    },
    exampleExplanation: () => "Each search reflects the words added so far; a `.` in the pattern may match any single letter at that position.",
    edgeCases: [
      {
        args: [
          [
            { name: 'addWord', args: ['bad'] },
            { name: 'addWord', args: ['dad'] },
            { name: 'addWord', args: ['mad'] },
            { name: 'search', args: ['pad'] },
            { name: 'search', args: ['bad'] },
            { name: 'search', args: ['.ad'] },
            { name: 'search', args: ['b..'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'addWord', args: ['a'] },
            { name: 'search', args: ['.'] },
            { name: 'search', args: ['a'] },
            { name: 'search', args: ['aa'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'addWord', args: ['ab'] },
            { name: 'search', args: ['a.'] },
            { name: 'search', args: ['.b'] },
            { name: 'search', args: ['..'] },
            { name: 'search', args: ['...'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [[{ name: 'search', args: ['.'] }]],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'addWord', args: ['ab'] },
            { name: 'addWord', args: ['ac'] },
            { name: 'search', args: ['a.'] },
            { name: 'search', args: ['ad'] },
          ],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            { name: 'addWord', args: ['abc'] },
            { name: 'addWord', args: ['abd'] },
            { name: 'search', args: ['ab.'] },
            { name: 'search', args: ['...'] },
            { name: 'search', args: ['....'] },
          ],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Word Search II',
    shape: 'trieb1_board_and_words',
    shapeConfig: { minRows: 3, maxRows: 4, minCols: 3, maxCols: 4, alphabet: 'aeost', maxWordLen: 4, minWords: 2, maxWords: 5 },
    statement:
      'You are given an `m x n` board of lowercase letters and a list of candidate `words`. Return every word from the list that can be traced on the board as a path of horizontally- or vertically-adjacent cells, where no single cell may be reused within that same word\'s path (different words are free to reuse the same cells independently).\n\nReturn the matching words in ascending alphabetical order, each listed at most once even if it appears more than once in `words`.',
    constraints:
      '- `1 <= board.length, board[0].length <= 12`\n- `board[i][j]` is a lowercase English letter.\n- `1 <= words.length <= 3*10^4`\n- `1 <= words[i].length <= 10`\n- `words` may contain duplicate entries; each matching word is still reported only once.\n- Matches are printed in ascending alphabetical order (their own canonical, unambiguous ordering).',
    inputFormat:
      'Line 1: `rows cols`. Next `rows` lines: each board row as a string of letters (no separators). Next line: word count `k`. Next `k` lines: one candidate word each.',
    outputFormat: 'One matching word per line, in ascending alphabetical order (no lines at all if none match).',
    hints: [
      'Checking each word independently with a Word-Search-style DFS works, but re-scanning the whole board from scratch for every single word wastes a lot of repeated work when words share prefixes.',
      'Build a Trie out of all the candidate words first, so one DFS pass over the board can advance many candidate words at once -- one board step corresponds to one trie level.',
      'Run a DFS from every cell, following the Trie edge matching that cell\'s letter. Whenever the trie node you land on is flagged as the end of some word, record that word. Temporarily mark the current path\'s cells as "used" (e.g. overwrite them) and restore them when backtracking, so the same cell is never reused within one word\'s path.',
    ],
    solutionApproach:
      "Insert every word into a Trie, storing the completed word string itself at the node where it ends (so finding a match reports it in O(1)). Then run a DFS from each board cell: at a cell whose letter has a matching child in the current trie node, descend into that child; if the child marks a word's end, add that word to a result set. Mark the current cell visited (e.g. temporarily overwrite it with a sentinel) before recursing into its four neighbors, and restore it afterward so sibling paths and other words can still use that cell. Sorting the collected result set gives a canonical, order-independent output. This is O(rows * cols * 4^L) in the worst case for the longest word length L, but the shared Trie prunes dramatically once a board path stops matching any word's prefix.",
    pythonSolutionCode:
      "def find_words(board, words):\n    rows, cols = len(board), len(board[0]) if board else 0\n    root = {}\n    for w in words:\n        node = root\n        for ch in w:\n            node = node.setdefault(ch, {})\n        node['#word'] = w\n\n    found = set()\n\n    def dfs(r, c, node):\n        if r < 0 or r >= rows or c < 0 or c >= cols:\n            return\n        ch = board[r][c]\n        if ch == '*' or ch not in node:\n            return\n        nxt = node[ch]\n        if '#word' in nxt:\n            found.add(nxt['#word'])\n        board[r][c] = '*'\n        dfs(r + 1, c, nxt)\n        dfs(r - 1, c, nxt)\n        dfs(r, c + 1, nxt)\n        dfs(r, c - 1, nxt)\n        board[r][c] = ch\n\n    for r in range(rows):\n        for c in range(cols):\n            dfs(r, c, root)\n\n    return sorted(found)\n",
    solve: (board, words) => {
      const rows = board.length;
      const cols = board[0]?.length || 0;
      const root = {};
      for (const w of words) {
        let node = root;
        for (const ch of w) {
          node.children = node.children || {};
          node = node.children[ch] = node.children[ch] || {};
        }
        node.word = w;
      }
      const found = new Set();
      const dfs = (r, c, node) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        const ch = board[r][c];
        if (ch === '#' || !node.children || !node.children[ch]) return;
        const next = node.children[ch];
        if (next.word) found.add(next.word);
        board[r][c] = '#';
        dfs(r + 1, c, next);
        dfs(r - 1, c, next);
        dfs(r, c + 1, next);
        dfs(r, c - 1, next);
        board[r][c] = ch;
      };
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) dfs(r, c, root);
      }
      return [...found].sort();
    },
    exampleExplanation: (args, result) =>
      result.length
        ? `${result.length} of the given word(s) can be traced on the board: ${result.join(', ')}.`
        : 'None of the given words can be traced through adjacent cells of the board.',
    edgeCases: [
      {
        args: [
          [
            ['o', 'a', 'a', 'n'],
            ['e', 't', 'a', 'e'],
            ['i', 'h', 'k', 'r'],
            ['i', 'f', 'l', 'v'],
          ],
          ['oath', 'pea', 'eat', 'rain'],
        ],
        kind: 'edge',
      },
      {
        args: [
          [
            ['a', 'b'],
            ['c', 'd'],
          ],
          ['abcb'],
        ],
        kind: 'edge',
      },
      { args: [[['a']], ['a']], kind: 'edge' },
      { args: [[['a']], ['b']], kind: 'edge' },
      { args: [[['a', 'a']], ['a', 'aa']], kind: 'edge' },
      {
        args: [
          [
            ['o', 'a'],
            ['e', 't'],
          ],
          ['eat', 'eat', 'oat', 'tea'],
        ],
        kind: 'edge',
      },
    ],
  },

  {
    legacyProblemName: 'Replace Words',
    shape: 'two_strings_to_value',
    shapeConfig: { outputType: 'string', alphabet: 'abcdefghij', minRoots: 1, maxRoots: 5, maxRootLen: 4, minWords: 1, maxWords: 8, maxSuffixLen: 4, maxWordLen: 6 },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet || 'abcdefghij';
      const rootCount = randInt(rng, cfg.minRoots ?? 1, cfg.maxRoots ?? 5);
      const roots = new Set();
      while (roots.size < rootCount) roots.add(randString(rng, randInt(rng, 1, cfg.maxRootLen ?? 4), alphabet));
      const rootList = [...roots];
      const wordCount = randInt(rng, cfg.minWords ?? 1, cfg.maxWords ?? 8);
      const words = [];
      for (let i = 0; i < wordCount; i += 1) {
        if (rng() < 0.6 && rootList.length) {
          const r = rootList[randInt(rng, 0, rootList.length - 1)];
          const suffix = randString(rng, randInt(rng, 0, cfg.maxSuffixLen ?? 4), alphabet);
          words.push(r + suffix);
        } else {
          words.push(randString(rng, randInt(rng, 1, cfg.maxWordLen ?? 6), alphabet));
        }
      }
      return [rootList.join(' '), words.join(' ')];
    },
    statement:
      'You are given a dictionary of word `roots` and a `sentence` (a space-separated list of words). For every word in the sentence, if any dictionary root is a prefix of it, replace that word with the **shortest** such root. Words with no matching root are left unchanged. Return the resulting sentence.\n\nFor example, if `roots` contains `"cat"` and the sentence contains `"cattle"`, `"cattle"` becomes `"cat"`.',
    constraints:
      '- `0 <= dictionary.length <= 1000` (an empty dictionary leaves every word in the sentence unchanged)\n- `1 <= roots[i].length <= 100`\n- `1 <= sentence.length` (number of words) `<= 1000`\n- All roots and sentence words consist only of lowercase English letters.\n- If multiple roots match a word as a prefix, the **shortest** matching root is used (ties broken by shortest length only -- a word cannot have two matching roots of the same length that are both prefixes, since one would then be a prefix of the other).',
    inputFormat: 'Line 1: the dictionary roots, space-separated (may be an empty line). Line 2: the sentence, as space-separated words.',
    outputFormat: 'The resulting sentence, space-separated, on a single line.',
    hints: [
      'For a single word, checking every root against it with `.startswith()` works, but repeating that scan for every word against every root is slow when both lists are large.',
      'Insert all the roots into a Trie once. Then for each sentence word, walk the trie one character at a time -- the moment you reach a node marked as a completed root, you have found the shortest matching root for that word (a shorter path to a match is found before any longer one).',
      "If the walk falls off the trie (no child for the next character) before hitting a completed root, the word has no matching root and stays unchanged.",
    ],
    solutionApproach:
      'Build a Trie from the dictionary roots. For each word in the sentence, walk the trie character by character while building up the traversed prefix; as soon as the current trie node is marked as a completed root, that prefix is the shortest matching root, so replace the word with it immediately. If the walk exhausts the word\'s characters (or the trie path breaks) without ever hitting a completed root, the original word is kept. This is O(total root length) to build the trie plus O(total sentence length) to process every word, versus the naive O(words * roots * average length).',
    pythonSolutionCode:
      "def replace_words(roots, sentence):\n    trie = {}\n    for root in roots:\n        node = trie\n        for ch in root:\n            node = node.setdefault(ch, {})\n        node['#'] = root\n\n    def shortest_root(word):\n        node = trie\n        for ch in word:\n            if ch not in node:\n                return word\n            node = node[ch]\n            if '#' in node:\n                return node['#']\n        return word\n\n    return ' '.join(shortest_root(w) for w in sentence.split())\n",
    solve: (dictLine, sentenceLine) => {
      const roots = dictLine.trim().length ? dictLine.trim().split(/\s+/) : [];
      const root = {};
      for (const r of roots) {
        let node = root;
        for (const ch of r) {
          node.children = node.children || {};
          node = node.children[ch] = node.children[ch] || {};
        }
        node.end = true;
      }
      const words = sentenceLine.trim().length ? sentenceLine.trim().split(/\s+/) : [];
      const replaced = words.map((word) => {
        let node = root;
        let prefix = '';
        for (const ch of word) {
          if (!node.children || !node.children[ch]) return word;
          prefix += ch;
          node = node.children[ch];
          if (node.end) return prefix;
        }
        return word;
      });
      return replaced.join(' ');
    },
    exampleExplanation: (args, result) => `Every replaceable word in "${args[1]}" is swapped for its shortest matching root, giving "${result}".`,
    edgeCases: [
      { args: ['cat bat rat', 'the cattle was rattled by the battery'], kind: 'edge' },
      { args: ['a b c', 'aadsfasf absbs bbab cadsfafs'], kind: 'edge' },
      { args: ['cat', 'cats dog cattle'], kind: 'edge' },
      { args: ['a', 'a'], kind: 'edge' },
      { args: ['', 'hello world'], kind: 'edge' },
      { args: ['ab abc', 'abcd'], kind: 'edge' },
    ],
  },

  {
    legacyProblemName: 'Longest Word in Dictionary',
    shape: 'string_array_to_value_or_array',
    shapeConfig: { outputType: 'string', minN: 3, maxN: 10, maxLen: 8, alphabet: 'abcde' },
    genArgs: (rng, cfg) => {
      const alphabet = cfg.alphabet || 'abcde';
      const n = randInt(rng, cfg.minN ?? 3, cfg.maxN ?? 10);
      const words = new Set();
      for (let i = 0; i < n; i += 1) {
        if (rng() < 0.6 && words.size) {
          const arr = [...words];
          const base = arr[randInt(rng, 0, arr.length - 1)];
          if (base.length < (cfg.maxLen ?? 8)) {
            words.add(base + alphabet[randInt(rng, 0, alphabet.length - 1)]);
            continue;
          }
        }
        words.add(alphabet[randInt(rng, 0, alphabet.length - 1)]);
      }
      if (rng() < 0.3) words.add(randString(rng, randInt(rng, 2, cfg.maxLen ?? 8), alphabet));
      return [[...words]];
    },
    statement:
      'Given an array of `words`, find the longest word in it that can be built one character at a time by other words already present in `words` -- meaning every proper prefix of the word (of length 1 up to length-1) must itself also appear somewhere in `words`.\n\nIf there is a tie for longest, return the lexicographically smallest of the tied words. If no such word exists, return an empty string.',
    constraints:
      '- `1 <= words.length <= 1000`\n- `1 <= words[i].length <= 30`\n- `words[i]` consists of lowercase English letters.\n- A single-character word never needs a prefix, so it always qualifies as "buildable".\n- Ties for the longest length are broken by returning the lexicographically smallest qualifying word (this is the canonical tie-break used to grade this problem).',
    inputFormat: 'Line 1: word count `N`. Next `N` lines: one word each.',
    outputFormat: 'A single line: the longest buildable word (lexicographically smallest if tied), or an empty line if none qualifies.',
    hints: [
      "A word only counts if you could have typed it one letter at a time and had every intermediate prefix already sitting in the dictionary -- check that condition directly for each candidate.",
      'Put every word into a hash set first, so checking whether a given prefix string exists in the dictionary is an O(1) lookup.',
      'For each word, walk its prefixes of length 1, 2, ..., length-1 and confirm each is in the set; among all words that pass, keep the longest, breaking ties by picking the lexicographically smaller string.',
    ],
    solutionApproach:
      "Put all words into a hash set for O(1) membership checks. For each word, check every proper prefix (length 1 through length-1) against the set; the word is 'buildable' only if all of them are present (a length-1 word trivially passes, since it has no proper prefix to check). Track the best buildable word seen so far, preferring strictly longer words, and on equal length preferring the lexicographically smaller one. This is O(total characters across all words) since each prefix check is O(1) and prefixes are only as long as the word itself.",
    pythonSolutionCode:
      "def longest_word(words):\n    word_set = set(words)\n    best = ''\n    for w in words:\n        if all(w[:i] in word_set for i in range(1, len(w))):\n            if len(w) > len(best) or (len(w) == len(best) and w < best):\n                best = w\n    return best\n",
    solve: (words) => {
      const wordSet = new Set(words);
      let best = '';
      for (const w of words) {
        let buildable = true;
        for (let i = 1; i < w.length; i += 1) {
          if (!wordSet.has(w.slice(0, i))) {
            buildable = false;
            break;
          }
        }
        if (!buildable) continue;
        if (w.length > best.length || (w.length === best.length && w < best)) best = w;
      }
      return best;
    },
    exampleExplanation: (args, result) =>
      result
        ? `"${result}" is the longest word that can be built one character at a time from other entries in the dictionary.`
        : 'No word in the dictionary can be fully built one character at a time from its own prefixes.',
    edgeCases: [
      { args: [['w', 'wo', 'wor', 'worl', 'world']], kind: 'edge' },
      { args: [['a', 'banana', 'app', 'appl', 'ap', 'apply', 'apple']], kind: 'edge' },
      { args: [['a']], kind: 'edge' },
      { args: [['ab']], kind: 'edge' },
      { args: [['a', 'ab', 'abc', 'abd']], kind: 'edge' },
      { args: [['x', 'y', 'z']], kind: 'edge' },
    ],
  },
];
