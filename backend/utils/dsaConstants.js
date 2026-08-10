/**
 * Shared DSA constants & helpers for the in-app judge platform.
 */

export const DSA_LANGUAGES = [
  'python',
  'java',
  'javascript',
  'typescript',
  'cpp',
  'c',
  'go',
  'csharp',
  'ruby',
];

export const DSA_LANGUAGE_LABELS = {
  python: 'Python 3',
  java: 'Java',
  javascript: 'JavaScript (Deno)',
  typescript: 'TypeScript (Deno)',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  csharp: 'C#',
  ruby: 'Ruby',
};

/**
 * OnlineCompiler.io compiler ids
 * https://onlinecompiler.io/docs
 */
export const ONLINECOMPILER_LANGUAGE_MAP = {
  python: 'python-3.14',
  java: 'openjdk-25',
  javascript: 'typescript-deno',
  typescript: 'typescript-deno',
  cpp: 'g++-15',
  c: 'gcc-15',
  go: 'go-1.26',
  csharp: 'dotnet-csharp-9',
  ruby: 'ruby-4.0',
};

/** @deprecated use ONLINECOMPILER_LANGUAGE_MAP */
export const ONECOMPILER_LANGUAGE_MAP = ONLINECOMPILER_LANGUAGE_MAP;

export const DIFFICULTY_POINTS = { Easy: 10, Medium: 20, Hard: 30 };

export const CASE_KINDS = ['sample', 'typical', 'edge', 'stress', 'adversarial'];

export const MIN_EDGE_CASES = 20;
export const REQUIRED_TEST_COUNT = 50;

export function slugifyProblemName(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function normalizeStdout(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/g, '')
    .replace(/\n+$/g, '');
}

/**
 * Compares judge stdout against expected stdout under a problem's comparisonMode:
 * - 'exact' (default): normalized string equality
 * - 'float': line-by-line numeric equality within an epsilon (handles Pow(x,n), Median, etc.)
 * - 'canonical-sort-lines': sorts both sides' lines before comparing (handles 3Sum-style
 *   unordered results and the `unordered_listing` shape's combinatorial output)
 */
export function compareByMode(actual, expected, comparisonMode = 'exact', comparisonConfig = {}) {
  const a = normalizeStdout(actual);
  const e = normalizeStdout(expected);

  if (comparisonMode === 'float') {
    const eps = comparisonConfig?.epsilon ?? 1e-4;
    const aLines = a.split('\n');
    const eLines = e.split('\n');
    if (aLines.length !== eLines.length) return false;
    return aLines.every((line, i) => {
      const av = Number(line.trim());
      const ev = Number(eLines[i].trim());
      if (Number.isNaN(av) || Number.isNaN(ev)) return line.trim() === eLines[i].trim();
      return Math.abs(av - ev) <= eps;
    });
  }

  if (comparisonMode === 'canonical-sort-lines') {
    const sortLines = (text) => text.split('\n').map((l) => l.trim()).sort().join('\n');
    return sortLines(a) === sortLines(e);
  }

  return a === e;
}

export function getIstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function xpForDifficulty(difficulty) {
  return DIFFICULTY_POINTS[difficulty] || 10;
}

export function levelFromXp(xp) {
  const n = Math.max(0, Number(xp) || 0);
  return Math.floor(Math.sqrt(n / 10)) + 1;
}

/** Default empty starter snippets per language (overridden per problem). */
export function defaultStarterCode(title = 'Solution') {
  const safe = String(title).replace(/[^a-zA-Z0-9]/g, '') || 'Solution';
  return {
    python: `# ${title}\nimport sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    # TODO: implement\n    print(data[0] if data else "")\n\nif __name__ == "__main__":\n    solve()\n`,
    java: `// ${title}\nimport java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        // TODO: implement\n        System.out.println(line == null ? "" : line.trim());\n    }\n}\n`,
    javascript: `// ${title} — runs on Deno (OnlineCompiler)\nconst raw = await new Response(Deno.stdin.readable).text();\nconst input = raw.trim().split(/\\s+/);\n// TODO: implement\nconsole.log(input[0] || "");\n`,
    typescript: `// ${title} — runs on Deno (OnlineCompiler)\nconst raw = await new Response(Deno.stdin.readable).text();\nconst input: string[] = raw.trim().split(/\\s+/);\n// TODO: implement\nconsole.log(input[0] || "");\n`,
    cpp: `// ${title}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    string s;\n    if (!(cin >> s)) { cout << ""; return 0; }\n    // TODO: implement\n    cout << s;\n    return 0;\n}\n`,
    c: `// ${title}\n#include <stdio.h>\n#include <string.h>\nint main() {\n    char buf[1000001];\n    if (!fgets(buf, sizeof(buf), stdin)) { printf(""); return 0; }\n    // TODO: implement\n    printf("%s", buf);\n    return 0;\n}\n`,
    go: `// ${title}\npackage main\nimport (\n  "bufio"\n  "fmt"\n  "os"\n)\nfunc main() {\n  in := bufio.NewReader(os.Stdin)\n  line, _ := in.ReadString('\\n')\n  // TODO: implement\n  fmt.Print(line)\n}\n`,
    csharp: `// ${title}\nusing System;\nclass Program {\n  static void Main() {\n    var line = Console.ReadLine() ?? "";\n    // TODO: implement\n    Console.Write(line.Trim());\n  }\n}\n`,
    ruby: `# ${title}\nline = STDIN.read.to_s.strip\n# TODO: implement\nputs line.split.first || ""\n`,
  };
}

export function validateTestSuite(tests) {
  const errors = [];
  if (!Array.isArray(tests) || tests.length !== REQUIRED_TEST_COUNT) {
    errors.push(`Expected exactly ${REQUIRED_TEST_COUNT} tests, got ${tests?.length ?? 0}`);
  }
  const edgeCount = (tests || []).filter((t) => t.caseKind === 'edge').length;
  if (edgeCount < MIN_EDGE_CASES) {
    errors.push(`Need at least ${MIN_EDGE_CASES} edge cases, got ${edgeCount}`);
  }
  const stressCount = (tests || []).filter((t) => t.caseKind === 'stress').length;
  if (stressCount < 1) {
    errors.push('Need at least 1 stress case');
  }
  const sampleCount = (tests || []).filter((t) => t.isSample || t.caseKind === 'sample').length;
  if (sampleCount < 2) {
    errors.push('Need at least 2 sample cases');
  }
  return { ok: errors.length === 0, errors, edgeCount, stressCount, sampleCount };
}
