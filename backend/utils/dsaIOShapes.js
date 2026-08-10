/**
 * Shared stdin/stdout "shapes" for the DSA judge.
 *
 * Each shape is implemented ONCE and reused by many problems, so individual
 * problem specs (backend/utils/dsaProblems/*.js) only need to declare which
 * shape they use + provide the real `solve()` algorithm — not hand-write
 * stdin parsing / stdout formatting / starter-code boilerplate per problem
 * per language.
 *
 * decode/encode/format/gen run server-side in Node at content-authoring /
 * seed time to compute correct expectedStdout for every test case. `starter`
 * produces the boilerplate shown to the user in the code editor (not judged).
 */

function linesOf(stdin) {
  return String(stdin ?? '').split(/\r?\n/);
}

function tokInts(line) {
  return String(line ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);
}

export function formatByType(value, type = 'int') {
  switch (type) {
    case 'bool':
      return value ? 'true' : 'false';
    case 'float':
      return Number(value).toFixed(5);
    case 'string':
      return value == null ? '' : String(value);
    case 'intArray':
      return (value || []).join(' ');
    case 'stringArray':
      return (value || []).join('\n');
    default:
      return String(value);
  }
}

/* ---------------------------- deterministic RNG --------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function makeRng(seedStr) {
  return mulberry32(seedFromString(seedStr));
}

export function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randIntArray(rng, n, min, max) {
  return Array.from({ length: n }, () => randInt(rng, min, max));
}

export function randString(rng, n, alphabet = 'abcdefghijklmnopqrstuvwxyz') {
  let s = '';
  for (let i = 0; i < n; i += 1) s += alphabet[randInt(rng, 0, alphabet.length - 1)];
  return s;
}

export function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = randInt(rng, 0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(rng, arr, n) {
  return shuffle(rng, arr).slice(0, n);
}

/* ------------------------------ linked list -------------------------------- */

export function buildLinkedList(values) {
  let head = null;
  let tail = null;
  const nodes = [];
  for (const v of values) {
    const node = { val: v, next: null };
    nodes.push(node);
    if (!head) head = node;
    else tail.next = node;
    tail = node;
  }
  return { head, nodes };
}

export function serializeLinkedList(head, cap = 20000) {
  const out = [];
  let node = head;
  let guard = 0;
  while (node && guard < cap) {
    out.push(node.val);
    node = node.next;
    guard += 1;
  }
  return out;
}

/* ------------------------------- binary tree -------------------------------- */

export function buildTree(values) {
  const vals = values.filter((v) => v !== undefined);
  if (!vals.length || vals[0] === null) return null;
  const root = { val: vals[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (i < vals.length) {
      const lv = vals[i];
      i += 1;
      if (lv !== null && lv !== undefined) {
        node.left = { val: lv, left: null, right: null };
        queue.push(node.left);
      }
    }
    if (i < vals.length) {
      const rv = vals[i];
      i += 1;
      if (rv !== null && rv !== undefined) {
        node.right = { val: rv, left: null, right: null };
        queue.push(node.right);
      }
    }
  }
  return root;
}

export function serializeTree(root) {
  if (!root) return [];
  const out = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      out.push(null);
      continue;
    }
    out.push(node.val);
    queue.push(node.left);
    queue.push(node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function parseTreeLine(line) {
  return String(line ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t === 'null' || t === 'None' ? null : Number(t)));
}

function formatTreeLine(values) {
  return values.map((v) => (v === null ? 'null' : String(v))).join(' ');
}

/* --------------------------------------------------------------------------
 * Per-language I/O primitive tables
 * -------------------------------------------------------------------------- */

const IO = {
  python: {
    ext: 'python',
    prelude: "import sys\n_lines = sys.stdin.read().split('\\n')\n\n\ndef _line(i):\n    return _lines[i] if i < len(_lines) else ''\n\n\n",
    indent: '',
    declInt: (v, i) => `${v} = int((_line(${i}).strip() or '0'))`,
    declIntArray: (v, i) => `${v} = list(map(int, _line(${i}).split()))`,
    declString: (v, i) => `${v} = _line(${i})`,
    declFloat: (v, i) => `${v} = float((_line(${i}).strip() or '0'))`,
    printInt: (e) => `print(${e})`,
    printBool: (e) => `print("true" if ${e} else "false")`,
    printFloat: (e) => `print(f"{${e}:.5f}")`,
    printString: (e) => `print(${e})`,
    printIntArray: (e) => `print(' '.join(map(str, ${e})))`,
    printStringArray: (e) => `print('\\n'.join(${e}))`,
    todo: (msg) => `# TODO: ${msg}`,
    close: '',
  },
  javascript: {
    ext: 'javascript',
    prelude: "const __raw = await new Response(Deno.stdin.readable).text();\nconst _lines = __raw.split('\\n');\nfunction _line(i) { return _lines[i] || ''; }\n\n",
    indent: '',
    declInt: (v, i) => `const ${v} = parseInt((_line(${i}).trim() || '0'), 10);`,
    declIntArray: (v, i) => `const ${v} = _line(${i}).trim().split(/\\s+/).filter(Boolean).map(Number);`,
    declString: (v, i) => `const ${v} = _line(${i});`,
    declFloat: (v, i) => `const ${v} = parseFloat(_line(${i}).trim() || '0');`,
    printInt: (e) => `console.log(${e});`,
    printBool: (e) => `console.log(${e} ? 'true' : 'false');`,
    printFloat: (e) => `console.log(Number(${e}).toFixed(5));`,
    printString: (e) => `console.log(${e});`,
    printIntArray: (e) => `console.log(${e}.join(' '));`,
    printStringArray: (e) => `console.log(${e}.join('\\n'));`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '',
  },
  typescript: {
    ext: 'typescript',
    prelude: "const __raw = await new Response(Deno.stdin.readable).text();\nconst _lines: string[] = __raw.split('\\n');\nfunction _line(i: number): string { return _lines[i] || ''; }\n\n",
    indent: '',
    declInt: (v, i) => `const ${v}: number = parseInt((_line(${i}).trim() || '0'), 10);`,
    declIntArray: (v, i) => `const ${v}: number[] = _line(${i}).trim().split(/\\s+/).filter(Boolean).map(Number);`,
    declString: (v, i) => `const ${v}: string = _line(${i});`,
    declFloat: (v, i) => `const ${v}: number = parseFloat(_line(${i}).trim() || '0');`,
    printInt: (e) => `console.log(${e});`,
    printBool: (e) => `console.log(${e} ? 'true' : 'false');`,
    printFloat: (e) => `console.log(Number(${e}).toFixed(5));`,
    printString: (e) => `console.log(${e});`,
    printIntArray: (e) => `console.log(${e}.join(' '));`,
    printStringArray: (e) => `console.log(${e}.join('\\n'));`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '',
  },
  java: {
    ext: 'java',
    prelude:
      'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader __br = new BufferedReader(new InputStreamReader(System.in));\n        List<String> __lines = new ArrayList<>();\n        String __l;\n        while ((__l = __br.readLine()) != null) __lines.add(__l);\n        while (__lines.size() < 8) __lines.add("");\n\n',
    indent: '        ',
    declInt: (v, i) => `int ${v} = Integer.parseInt(__lines.get(${i}).trim().isEmpty() ? "0" : __lines.get(${i}).trim());`,
    declIntArray: (v, i) =>
      `String[] __${v}Toks = __lines.get(${i}).trim().isEmpty() ? new String[0] : __lines.get(${i}).trim().split("\\\\s+");\n        int[] ${v} = new int[__${v}Toks.length];\n        for (int __k = 0; __k < __${v}Toks.length; __k++) ${v}[__k] = Integer.parseInt(__${v}Toks[__k]);`,
    declString: (v, i) => `String ${v} = __lines.get(${i});`,
    declFloat: (v, i) => `double ${v} = Double.parseDouble(__lines.get(${i}).trim().isEmpty() ? "0" : __lines.get(${i}).trim());`,
    printInt: (e) => `System.out.println(${e});`,
    printBool: (e) => `System.out.println((${e}) ? "true" : "false");`,
    printFloat: (e) => `System.out.printf("%.5f%n", ${e});`,
    printString: (e) => `System.out.println(${e});`,
    printIntArray: (e) =>
      `StringBuilder __sb = new StringBuilder();\n        for (int __i = 0; __i < (${e}).length; __i++) { if (__i > 0) __sb.append(' '); __sb.append((${e})[__i]); }\n        System.out.println(__sb.toString());`,
    printStringArray: (e) => `for (String __s : ${e}) System.out.println(__s);`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '\n    }\n}\n',
  },
  cpp: {
    ext: 'cpp',
    prelude:
      '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    vector<string> __lines;\n    string __l;\n    while (getline(cin, __l)) __lines.push_back(__l);\n    while (__lines.size() < 8) __lines.push_back("");\n\n',
    indent: '    ',
    declInt: (v, i) => `int ${v} = stoi(__lines[${i}].empty() ? "0" : __lines[${i}]);`,
    declIntArray: (v, i) =>
      `vector<int> ${v};\n    { stringstream __ss(__lines[${i}]); int __x; while (__ss >> __x) ${v}.push_back(__x); }`,
    declString: (v, i) => `string ${v} = __lines[${i}];`,
    declFloat: (v, i) => `double ${v} = stod(__lines[${i}].empty() ? "0" : __lines[${i}]);`,
    printInt: (e) => `cout << (${e}) << endl;`,
    printBool: (e) => `cout << ((${e}) ? "true" : "false") << endl;`,
    printFloat: (e) => `cout << fixed << setprecision(5) << (${e}) << endl;`,
    printString: (e) => `cout << (${e}) << endl;`,
    printIntArray: (e) =>
      `{ auto& __a = (${e}); for (size_t __i = 0; __i < __a.size(); __i++) { if (__i) cout << ' '; cout << __a[__i]; } cout << endl; }`,
    printStringArray: (e) => `for (auto& __s : (${e})) cout << __s << endl;`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '\n    return 0;\n}\n',
  },
  c: {
    ext: 'c',
    prelude:
      '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n#define MAXLINES 64\n#define MAXLEN 200000\n\nstatic char __linebuf[MAXLINES][MAXLEN];\nstatic int __linecount = 0;\n\nint main() {\n    while (__linecount < MAXLINES && fgets(__linebuf[__linecount], MAXLEN, stdin)) {\n        size_t __n = strlen(__linebuf[__linecount]);\n        while (__n > 0 && (__linebuf[__linecount][__n - 1] == \'\\n\' || __linebuf[__linecount][__n - 1] == \'\\r\')) __linebuf[__linecount][--__n] = \'\\0\';\n        __linecount++;\n    }\n\n',
    indent: '    ',
    declInt: (v, i) => `int ${v} = (${i} < __linecount) ? atoi(__linebuf[${i}]) : 0;`,
    declIntArray: (v, i) =>
      `int ${v}[100000]; int ${v}_len = 0;\n    if (${i} < __linecount) { char __buf[MAXLEN]; strcpy(__buf, __linebuf[${i}]); char* __tok = strtok(__buf, " \\t"); while (__tok) { ${v}[${v}_len++] = atoi(__tok); __tok = strtok(NULL, " \\t"); } }`,
    declString: (v, i) => `char* ${v} = (${i} < __linecount) ? __linebuf[${i}] : "";`,
    declFloat: (v, i) => `double ${v} = (${i} < __linecount) ? atof(__linebuf[${i}]) : 0;`,
    printInt: (e) => `printf("%d\\n", ${e});`,
    printBool: (e) => `printf("%s\\n", (${e}) ? "true" : "false");`,
    printFloat: (e) => `printf("%.5f\\n", ${e});`,
    printString: (e) => `printf("%s\\n", ${e});`,
    printIntArray: (arrExpr, lenExpr) =>
      `for (int __i = 0; __i < ${lenExpr}; __i++) { if (__i) printf(" "); printf("%d", ${arrExpr}[__i]); }\n    printf("\\n");`,
    printStringArray: (e) => `printf("%s\\n", ${e});`,
    todo: (msg) => `/* TODO: ${msg} */`,
    close: '\n    return 0;\n}\n',
  },
  go: {
    ext: 'go',
    prelude:
      'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\t__scanner := bufio.NewScanner(os.Stdin)\n\t__scanner.Buffer(make([]byte, 1024*1024), 1024*1024)\n\tvar __lines []string\n\tfor __scanner.Scan() {\n\t\t__lines = append(__lines, __scanner.Text())\n\t}\n\t__get := func(i int) string {\n\t\tif i < len(__lines) {\n\t\t\treturn __lines[i]\n\t\t}\n\t\treturn ""\n\t}\n\n',
    indent: '\t',
    declInt: (v, i) => `${v}, _ := strconv.Atoi(strings.TrimSpace(__get(${i})))`,
    declIntArray: (v, i) =>
      `${v} := []int{}\n\tfor _, __t := range strings.Fields(__get(${i})) {\n\t\t__n, _ := strconv.Atoi(__t)\n\t\t${v} = append(${v}, __n)\n\t}`,
    declString: (v, i) => `${v} := __get(${i})`,
    declFloat: (v, i) => `${v}, _ := strconv.ParseFloat(strings.TrimSpace(__get(${i})), 64)`,
    printInt: (e) => `fmt.Println(${e})`,
    printBool: (e) => `if ${e} {\n\t\tfmt.Println("true")\n\t} else {\n\t\tfmt.Println("false")\n\t}`,
    printFloat: (e) => `fmt.Printf("%.5f\\n", ${e})`,
    printString: (e) => `fmt.Println(${e})`,
    printIntArray: (e) =>
      `__strs := make([]string, len(${e}))\n\tfor __i, __v := range ${e} {\n\t\t__strs[__i] = strconv.Itoa(__v)\n\t}\n\tfmt.Println(strings.Join(__strs, " "))`,
    printStringArray: (e) => `for _, __s := range ${e} {\n\t\tfmt.Println(__s)\n\t}`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '\n}\n',
  },
  csharp: {
    ext: 'csharp',
    prelude:
      'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        var __lines = new List<string>();\n        string __l;\n        while ((__l = Console.ReadLine()) != null) __lines.Add(__l);\n        Func<int, string> __get = (i) => i < __lines.Count ? __lines[i] : "";\n\n',
    indent: '        ',
    declInt: (v, i) => `int ${v} = int.TryParse(__get(${i}).Trim(), out var __${v}Tmp) ? __${v}Tmp : 0;`,
    declIntArray: (v, i) =>
      `int[] ${v} = __get(${i}).Trim().Length > 0 ? __get(${i}).Trim().Split(new[] { ' ', '\\t' }, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray() : new int[0];`,
    declString: (v, i) => `string ${v} = __get(${i});`,
    declFloat: (v, i) => `double ${v} = double.TryParse(__get(${i}).Trim(), out var __${v}Tmp2) ? __${v}Tmp2 : 0;`,
    printInt: (e) => `Console.WriteLine(${e});`,
    printBool: (e) => `Console.WriteLine((${e}) ? "true" : "false");`,
    printFloat: (e) => `Console.WriteLine((${e}).ToString("F5"));`,
    printString: (e) => `Console.WriteLine(${e});`,
    printIntArray: (e) => `Console.WriteLine(string.Join(" ", ${e}));`,
    printStringArray: (e) => `foreach (var __s in ${e}) Console.WriteLine(__s);`,
    todo: (msg) => `// TODO: ${msg}`,
    close: '\n    }\n}\n',
  },
  ruby: {
    ext: 'ruby',
    prelude: "_lines = STDIN.read.split(\"\\n\")\ndef _line(lines, i)\n  lines[i].to_s\nend\n\n",
    indent: '',
    declInt: (v, i) => `${v} = _line(_lines, ${i}).strip.to_i`,
    declIntArray: (v, i) => `${v} = _line(_lines, ${i}).strip.split.map(&:to_i)`,
    declString: (v, i) => `${v} = _line(_lines, ${i})`,
    declFloat: (v, i) => `${v} = _line(_lines, ${i}).strip.to_f`,
    printInt: (e) => `puts ${e}`,
    printBool: (e) => `puts(${e} ? "true" : "false")`,
    printFloat: (e) => `puts format("%.5f", ${e})`,
    printString: (e) => `puts ${e}`,
    printIntArray: (e) => `puts ${e}.join(' ')`,
    printStringArray: (e) => `puts ${e}.join("\\n")`,
    todo: (msg) => `# TODO: ${msg}`,
    close: '',
  },
};

const LANGS = Object.keys(IO);

/** Assemble starter code for the "simple" (scalar/array/string) shape family. */
function buildStarter(reads, outputKind, outputVar, title) {
  const out = {};
  for (const lang of LANGS) {
    const T = IO[lang];
    let body = T.prelude;
    reads.forEach((r, idx) => {
      const fn = { int: T.declInt, intArray: T.declIntArray, string: T.declString, float: T.declFloat }[r.kind];
      body += T.indent + fn(r.name, idx) + '\n';
    });
    body += '\n' + T.indent + T.todo(`Implement ${title}`) + '\n\n';
    if (outputKind === 'intArray' && lang === 'c') {
      body += T.indent + T.printIntArray(outputVar, `${outputVar}_len`) + '\n';
    } else {
      const printFn = {
        int: T.printInt,
        bool: T.printBool,
        float: T.printFloat,
        string: T.printString,
        intArray: T.printIntArray,
        stringArray: T.printStringArray,
      }[outputKind];
      body += T.indent + printFn(outputVar) + '\n';
    }
    body += T.close;
    out[lang] = body;
  }
  return out;
}

/** Generic fallback starter for structural shapes (tree/graph/list/ops/bespoke). */
function genericStarter(title, formatNote) {
  const out = {};
  for (const lang of LANGS) {
    const T = IO[lang];
    let body = T.prelude;
    body += T.indent + T.todo(`Implement ${title}. ${formatNote}`) + '\n';
    body += T.indent + (T.printString ? T.printString('""') : '') + '\n';
    body += T.close;
    out[lang] = body;
  }
  return out;
}

/* --------------------------------------------------------------------------
 * Shapes
 * -------------------------------------------------------------------------- */

export const SHAPES = {
  int_to_int: {
    decode: (stdin) => [Number(linesOf(stdin)[0] || 0)],
    encode: (n) => `${n}`,
    gen: (rng, cfg = {}) => [randInt(rng, cfg.min ?? 0, cfg.max ?? 1000)],
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `n = ${args[0]}`,
    starter: (title, cfg = {}) => buildStarter([{ kind: 'int', name: 'n' }], cfg.outputType || 'int', 'result', title),
  },

  int_array_to_value: {
    decode: (stdin) => [tokInts(linesOf(stdin)[0])],
    encode: (arr) => arr.join(' '),
    gen: (rng, cfg = {}) => [randIntArray(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10), cfg.min ?? -100, cfg.max ?? 100)],
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `nums = [${args[0].join(',')}]`,
    starter: (title, cfg = {}) =>
      buildStarter([{ kind: 'intArray', name: 'nums' }], cfg.outputType || 'int', 'result', title),
  },

  int_array_and_target_to_pair: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      return [tokInts(L[0]), Number(L[1] || 0)];
    },
    encode: (arr, target) => `${arr.join(' ')}\n${target}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 10);
      const arr = randIntArray(rng, n, cfg.min ?? -100, cfg.max ?? 100);
      const i = randInt(rng, 0, n - 1);
      let j = randInt(rng, 0, n - 1);
      if (j === i) j = (j + 1) % n;
      const target = arr[i] + arr[j];
      return [arr, target];
    },
    format: (result, cfg = {}) => {
      if (cfg.outputType === 'indexPair') return `${result[0]} ${result[1]}`;
      return formatByType(result, cfg.outputType || 'bool');
    },
    pretty: (args) => `nums = [${args[0].join(',')}], target = ${args[1]}`,
    starter: (title, cfg = {}) =>
      buildStarter(
        [{ kind: 'intArray', name: 'nums' }, { kind: 'int', name: 'target' }],
        cfg.outputType === 'indexPair' ? 'string' : cfg.outputType || 'bool',
        'result',
        title
      ),
  },

  int_array_to_int_array: {
    decode: (stdin) => [tokInts(linesOf(stdin)[0])],
    encode: (arr) => arr.join(' '),
    gen: (rng, cfg = {}) => [randIntArray(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10), cfg.min ?? -100, cfg.max ?? 100)],
    format: (result) => formatByType(result, 'intArray'),
    pretty: (args) => `nums = [${args[0].join(',')}]`,
    starter: (title) => buildStarter([{ kind: 'intArray', name: 'nums' }], 'intArray', 'result', title),
  },

  two_int_arrays_to_value: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      return [tokInts(L[0]), tokInts(L[1])];
    },
    encode: (a, b) => `${a.join(' ')}\n${b.join(' ')}`,
    gen: (rng, cfg = {}) => [
      randIntArray(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8), cfg.min ?? -50, cfg.max ?? 50),
      randIntArray(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8), cfg.min ?? -50, cfg.max ?? 50),
    ],
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `a = [${args[0].join(',')}], b = [${args[1].join(',')}]`,
    starter: (title, cfg = {}) =>
      buildStarter(
        [{ kind: 'intArray', name: 'a' }, { kind: 'intArray', name: 'b' }],
        cfg.outputType || 'int',
        'result',
        title
      ),
  },

  string_to_value: {
    decode: (stdin) => [linesOf(stdin)[0] || ''],
    encode: (s) => s,
    gen: (rng, cfg = {}) => [randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12), cfg.alphabet)],
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'bool'),
    pretty: (args) => `s = "${args[0]}"`,
    starter: (title, cfg = {}) => buildStarter([{ kind: 'string', name: 's' }], cfg.outputType || 'bool', 'result', title),
  },

  string_to_string: {
    decode: (stdin) => [linesOf(stdin)[0] || ''],
    encode: (s) => s,
    gen: (rng, cfg = {}) => [randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 12), cfg.alphabet)],
    format: (result) => formatByType(result, 'string'),
    pretty: (args) => `s = "${args[0]}"`,
    starter: (title) => buildStarter([{ kind: 'string', name: 's' }], 'string', 'result', title),
  },

  two_strings_to_value: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      return [L[0] || '', L[1] || ''];
    },
    encode: (a, b) => `${a}\n${b}`,
    gen: (rng, cfg = {}) => [
      randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10), cfg.alphabet),
      randString(rng, randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10), cfg.alphabet),
    ],
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'bool'),
    pretty: (args) => `a = "${args[0]}", b = "${args[1]}"`,
    starter: (title, cfg = {}) =>
      buildStarter(
        [{ kind: 'string', name: 'a' }, { kind: 'string', name: 'b' }],
        cfg.outputType || 'bool',
        'result',
        title
      ),
  },

  string_array_to_value_or_array: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      const n = Number(L[0] || 0);
      return [L.slice(1, 1 + n)];
    },
    encode: (arr) => `${arr.length}\n${arr.join('\n')}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      return [Array.from({ length: n }, () => randString(rng, randInt(rng, 1, cfg.maxLen ?? 8), cfg.alphabet))];
    },
    format: (result, cfg = {}) =>
      cfg.outputType === 'stringArray' ? formatByType(result, 'stringArray') : formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `strs = [${args[0].map((s) => `"${s}"`).join(', ')}]`,
    starter: (title, cfg = {}) =>
      genericStarter(title, 'Read N on line 1, then N strings (one per line). Output per the problem statement.'),
  },

  matrix_to_value_or_matrix: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      const [rows, cols] = tokInts(L[0]);
      const matrix = [];
      for (let r = 0; r < rows; r += 1) matrix.push(tokInts(L[1 + r]).slice(0, cols));
      return [matrix];
    },
    encode: (m) => `${m.length} ${m[0]?.length || 0}\n${m.map((r) => r.join(' ')).join('\n')}`,
    gen: (rng, cfg = {}) => {
      const rows = randInt(rng, cfg.minRows ?? 1, cfg.maxRows ?? 6);
      const cols = randInt(rng, cfg.minCols ?? 1, cfg.maxCols ?? 6);
      const matrix = Array.from({ length: rows }, () => randIntArray(rng, cols, cfg.min ?? 0, cfg.max ?? 9));
      return [matrix];
    },
    format: (result, cfg = {}) =>
      cfg.outputType === 'matrix' ? result.map((r) => r.join(' ')).join('\n') : formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `matrix = [${args[0].map((r) => `[${r.join(',')}]`).join(', ')}]`,
    starter: (title, cfg = {}) =>
      genericStarter(title, 'Line 1 is "rows cols", followed by `rows` lines of `cols` space-separated ints.'),
  },

  linked_list_to_linked_list: {
    decode: (stdin, cfg = {}) => {
      const L = linesOf(stdin);
      const values = tokInts(L[1]);
      const { head, nodes } = buildLinkedList(values);
      if (cfg.hasCycle) {
        const pos = Number(L[2]);
        if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];
      }
      return [head];
    },
    encode: (values, pos = -1, cfg = {}) => `${values.length}\n${values.join(' ')}${cfg.hasCycle ? `\n${pos}` : ''}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
      const values = randIntArray(rng, n, cfg.min ?? -100, cfg.max ?? 100);
      const pos = cfg.hasCycle ? randInt(rng, -1, n - 1) : -1;
      return [values, pos];
    },
    format: (result, cfg = {}) =>
      cfg.outputType === 'list' ? formatByType(serializeLinkedList(result), 'intArray') : formatByType(result, cfg.outputType || 'bool'),
    pretty: (args, cfg = {}) => `list = [${args[0].join(',')}]${cfg?.hasCycle && args[1] >= 0 ? `, pos = ${args[1]}` : ''}`,
    starter: (title) =>
      genericStarter(title, 'Line 1 is N, line 2 is N space-separated ints describing the linked list.'),
  },

  binary_tree_to_value_or_array_or_tree: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      return [buildTree(parseTreeLine(L[0]))];
    },
    encode: (values) => formatTreeLine(values),
    gen: (rng, cfg = {}) => {
      const maxNodes = cfg.maxNodes ?? 12;
      const values = [];
      let count = 0;
      const build = (depth) => {
        if (count >= maxNodes || depth > (cfg.maxDepth ?? 4) || rng() < (cfg.nullChance ?? 0.25)) {
          values.push(null);
          return;
        }
        values.push(randInt(rng, cfg.min ?? -50, cfg.max ?? 50));
        count += 1;
        build(depth + 1);
        build(depth + 1);
      };
      build(0);
      return [values];
    },
    format: (result, cfg = {}) => {
      if (cfg.outputType === 'tree') return formatTreeLine(serializeTree(result));
      if (cfg.outputType === 'array') return formatByType(result, 'intArray');
      return formatByType(result, cfg.outputType || 'int');
    },
    pretty: (args) => `tree = [${args[0].map((v) => (v === null ? 'null' : v)).join(',')}]`,
    starter: (title) =>
      genericStarter(title, 'Line 1 is the tree in level-order with "null" markers, e.g. "3 9 20 null null 15 7".'),
  },

  graph_edge_list_to_value: {
    decode: (stdin, cfg = {}) => {
      const L = linesOf(stdin);
      const [n, m] = tokInts(L[0]);
      const edges = [];
      for (let i = 0; i < m; i += 1) edges.push(tokInts(L[1 + i]));
      const extras = (cfg.extraParams || []).map((_, i) => Number(L[1 + m + i] || 0));
      return [n, edges, ...extras];
    },
    encode: (n, edges, extras = []) =>
      `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}${extras.length ? `\n${extras.join('\n')}` : ''}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 8);
      const maxEdges = cfg.maxEdges ?? n * 2;
      const m = randInt(rng, cfg.minEdges ?? 1, maxEdges);
      const edges = Array.from({ length: m }, () => [randInt(rng, 0, n - 1), randInt(rng, 0, n - 1)]);
      const extras = (cfg.extraParams || []).map((p) => randInt(rng, p.min ?? 0, p.max ?? n - 1));
      return [n, edges, extras];
    },
    format: (result, cfg = {}) => formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `n = ${args[0]}, edges = [${args[1].map((e) => `[${e.join(',')}]`).join(', ')}]`,
    starter: (title) =>
      genericStarter(title, 'Line 1 is "n m" (nodes, edges), followed by m lines of "u v" edges.'),
  },

  graph_to_graph: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      const [n, m] = tokInts(L[0]);
      const adj = Array.from({ length: n }, () => []);
      for (let i = 0; i < m; i += 1) {
        const [u, v] = tokInts(L[1 + i]);
        adj[u].push(v);
        adj[v].push(u);
      }
      return [n, adj];
    },
    encode: (n, edges) => `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 2, cfg.maxN ?? 6);
      const edgeSet = new Set();
      const edges = [];
      const maxEdges = cfg.maxEdges ?? n;
      for (let i = 0; i < maxEdges; i += 1) {
        const u = randInt(rng, 0, n - 1);
        const v = randInt(rng, 0, n - 1);
        if (u === v) continue;
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push([u, v]);
      }
      return [n, edges];
    },
    /** Canonical form: sort node adjacency lists so any structurally-equal clone formats identically. */
    format: (adj) => {
      const n = adj.length;
      const edgeSet = new Set();
      const edges = [];
      adj.forEach((neighbors, u) => {
        [...neighbors].sort((a, b) => a - b).forEach((v) => {
          const key = u < v ? `${u}-${v}` : `${v}-${u}`;
          if (edgeSet.has(key)) return;
          edgeSet.add(key);
          edges.push(u < v ? [u, v] : [v, u]);
        });
      });
      edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      return `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}`;
    },
    pretty: (args) => `n = ${args[0]}, edges = [${args[1].map((e) => `[${e.join(',')}]`).join(', ')}]`,
    starter: (title) =>
      genericStarter(title, 'Line 1 is "n m" (nodes, edges), followed by m lines of "u v" edges. Build then clone the graph.'),
  },

  intervals_to_intervals_or_value: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      const n = Number(L[0] || 0);
      const intervals = [];
      for (let i = 0; i < n; i += 1) intervals.push(tokInts(L[1 + i]));
      return [intervals];
    },
    encode: (intervals) => `${intervals.length}\n${intervals.map((iv) => iv.join(' ')).join('\n')}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 8);
      const intervals = Array.from({ length: n }, () => {
        const s = randInt(rng, cfg.min ?? 0, cfg.max ?? 50);
        const e = s + randInt(rng, 0, 10);
        return [s, e];
      });
      return [intervals];
    },
    format: (result, cfg = {}) =>
      cfg.outputType === 'intervals' ? result.map((iv) => iv.join(' ')).join('\n') : formatByType(result, cfg.outputType || 'int'),
    pretty: (args) => `intervals = [${args[0].map((iv) => `[${iv.join(',')}]`).join(', ')}]`,
    starter: (title) => genericStarter(title, 'Line 1 is N, followed by N lines of "start end" intervals.'),
  },

  k_and_array_to_value: {
    decode: (stdin) => {
      const L = linesOf(stdin);
      return [tokInts(L[0]), Number(L[1] || 0)];
    },
    encode: (arr, k) => `${arr.join(' ')}\n${k}`,
    gen: (rng, cfg = {}) => {
      const n = randInt(rng, cfg.minN ?? 1, cfg.maxN ?? 10);
      const arr = randIntArray(rng, n, cfg.min ?? -50, cfg.max ?? 50);
      const k = randInt(rng, 1, n);
      return [arr, k];
    },
    format: (result, cfg = {}) => (cfg.outputType === 'array' ? formatByType(result, 'intArray') : formatByType(result, cfg.outputType || 'int')),
    pretty: (args) => `nums = [${args[0].join(',')}], k = ${args[1]}`,
    starter: (title, cfg = {}) =>
      buildStarter(
        [{ kind: 'intArray', name: 'nums' }, { kind: 'int', name: 'k' }],
        cfg.outputType === 'array' ? 'intArray' : cfg.outputType || 'int',
        'result',
        title
      ),
  },

  unordered_listing: {
    /** cfg.inputKind: 'intArray' | 'string' | 'int'. Output: one item per line, exact-sorted-lines judged. */
    decode: (stdin, cfg = {}) => {
      const L = linesOf(stdin);
      if (cfg.inputKind === 'string') return [L[0] || ''];
      if (cfg.inputKind === 'int') return [Number(L[0] || 0)];
      return [tokInts(L[0])];
    },
    encode: (value, cfg = {}) => {
      if (cfg.inputKind === 'string') return value;
      if (cfg.inputKind === 'int') return `${value}`;
      return value.join(' ');
    },
    gen: (rng, cfg = {}) => {
      if (cfg.inputKind === 'string') return [randString(rng, randInt(rng, 1, cfg.maxN ?? 6), cfg.alphabet)];
      if (cfg.inputKind === 'int') return [randInt(rng, cfg.min ?? 1, cfg.max ?? 6)];
      return [randIntArray(rng, randInt(rng, 1, cfg.maxN ?? 6), cfg.min ?? -9, cfg.max ?? 9)];
    },
    /** Each result item -> one line; board leaves join rows with '|'. Problem sets comparisonMode='canonical-sort-lines'. */
    format: (results, cfg = {}) => {
      const leaf = cfg.leafKind || 'array';
      const lines = results.map((item) => {
        if (leaf === 'scalar') return String(item);
        if (leaf === 'board') return item.join('|');
        return item.join(',');
      });
      return lines.join('\n');
    },
    pretty: (args, cfg = {}) => (cfg?.inputKind === 'string' ? `s = "${args[0]}"` : cfg?.inputKind === 'int' ? `n = ${args[0]}` : `nums = [${args[0].join(',')}]`),
    starter: (title, cfg = {}) => {
      if (cfg.inputKind === 'string') return buildStarter([{ kind: 'string', name: 'input' }], 'stringArray', 'result', title);
      if (cfg.inputKind === 'int') return buildStarter([{ kind: 'int', name: 'n' }], 'stringArray', 'result', title);
      return buildStarter([{ kind: 'intArray', name: 'nums' }], 'stringArray', 'result', title);
    },
  },

  stateful_ops: {
    /** Each op line: "opName arg1 arg2 ...". solve() receives the parsed ops and returns an array of
     * result strings/values, one per query op (declared in cfg.queryOps), in call order. */
    decode: (stdin) => {
      const L = linesOf(stdin);
      const m = Number(L[0] || 0);
      const ops = [];
      for (let i = 0; i < m; i += 1) {
        const toks = String(L[1 + i] || '').trim().split(/\s+/).filter(Boolean);
        const [name, ...rawArgs] = toks;
        ops.push({ name, args: rawArgs.map((a) => (Number.isNaN(Number(a)) ? a : Number(a))) });
      }
      return [ops];
    },
    encode: (ops) => `${ops.length}\n${ops.map((op) => [op.name, ...op.args].join(' ')).join('\n')}`,
    gen: (rng, cfg = {}) => {
      if (typeof cfg.genOps === 'function') return [cfg.genOps(rng)];
      return [[]];
    },
    format: (results, cfg = {}) => results.map((r) => formatByType(r, cfg.resultType || 'auto')).join('\n'),
    pretty: (args) => `ops = [${args[0].map((o) => `${o.name}(${o.args.join(',')})`).join(', ')}]`,
    starter: (title) =>
      genericStarter(title, 'Line 1 is op count M; each of the next M lines is "opName arg1 arg2". Print one output line per query op, in order.'),
  },

  bespoke: {
    // Problem spec supplies decode/encode/format/gen/pretty/starter directly.
  },
};

export function getShape(id) {
  const shape = SHAPES[id];
  if (!shape) throw new Error(`Unknown DSA IO shape: ${id}`);
  return shape;
}

export { linesOf, tokInts, parseTreeLine, formatTreeLine };
