import fs from "node:fs";
import path from "node:path";
import type { StackInfo, LanguageId } from "../../contracts/types";

const SOURCE_EXTS: Record<LanguageId, string[]> = {
  typescript: [".ts", ".tsx"],
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  python: [".py"],
  go: [".go"],
};

function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function exists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function walkSourceFiles(root: string, exts: Set<string>, found: { count: number }): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "__pycache__") continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(full, exts, found);
    } else if (entry.isFile()) {
      if (exts.has(path.extname(entry.name).toLowerCase())) found.count++;
    }
  }
}

function hasSourceFiles(projectPath: string, langs: LanguageId[]): boolean {
  const exts = new Set<string>();
  for (const l of langs) for (const e of SOURCE_EXTS[l]) exts.add(e);
  if (exts.size === 0) return false;
  const found = { count: 0 };
  walkSourceFiles(projectPath, exts, found);
  return found.count > 0;
}

export function detectStack(projectPath: string): StackInfo {
  const manifests: string[] = [];
  const languages: LanguageId[] = [];
  let framework: string | null = null;

  const packageJsonPath = path.join(projectPath, "package.json");
  const pkgRaw = readText(packageJsonPath);
  if (pkgRaw !== null) {
    manifests.push("package.json");
    let isTs = false;
    if (exists(path.join(projectPath, "tsconfig.json"))) isTs = true;
    if (!isTs) {
      // check any .ts file
      const found = { count: 0 };
      walkSourceFiles(projectPath, new Set([".ts", ".tsx"]), found);
      if (found.count > 0) isTs = true;
    }
    const lang: LanguageId = isTs ? "typescript" : "javascript";
    languages.push(lang);
    try {
      const pkg = JSON.parse(pkgRaw) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      if (Object.prototype.hasOwnProperty.call(deps, "next")) framework = "nextjs";
    } catch {
      // ignore parse errors
    }
  }

  const hasPyManifest =
    exists(path.join(projectPath, "pyproject.toml")) ||
    exists(path.join(projectPath, "requirements.txt")) ||
    exists(path.join(projectPath, "setup.py"));
  if (hasPyManifest) {
    if (exists(path.join(projectPath, "pyproject.toml"))) manifests.push("pyproject.toml");
    if (exists(path.join(projectPath, "requirements.txt"))) manifests.push("requirements.txt");
    if (exists(path.join(projectPath, "setup.py"))) manifests.push("setup.py");
    languages.push("python");
    // framework django check
    const reqPath = path.join(projectPath, "requirements.txt");
    const reqRaw = readText(reqPath);
    if (reqRaw && /django/i.test(reqRaw)) {
      if (framework === null) framework = "django";
    }
    // also check pyproject.toml
    const pyprojectRaw = readText(path.join(projectPath, "pyproject.toml"));
    if (pyprojectRaw && /django/i.test(pyprojectRaw)) {
      if (framework === null) framework = "django";
    }
  }

  const goModPath = path.join(projectPath, "go.mod");
  const goModRaw = readText(goModPath);
  if (goModRaw !== null) {
    manifests.push("go.mod");
    languages.push("go");
    if (/gin-gonic\/gin/.test(goModRaw)) {
      if (framework === null) framework = "gin";
    }
  }

  // primary language: first in detection order
  const primaryLanguage: LanguageId | null = languages.length > 0 ? languages[0] : null;

  // confidence
  let confidence: StackInfo["confidence"] = "low";
  if (manifests.length > 0) {
    if (hasSourceFiles(projectPath, languages)) confidence = "high";
    else confidence = "medium";
  }

  return {
    languages,
    primaryLanguage,
    framework,
    manifests,
    confidence,
  };
}
