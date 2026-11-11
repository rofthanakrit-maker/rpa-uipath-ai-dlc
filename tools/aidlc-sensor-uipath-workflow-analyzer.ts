// aidlc-sensor-uipath-workflow-analyzer.ts — ADVISORY Workflow Analyzer gate (rpa-uipath plugin).
//
// Fired at the build-and-test gate once per deliverable. Acts only on
// build-and-test-summary.md (one run per gate); every other path passes through.
// Finds UiPath projects (project.json in cwd, else direct sub-directories) and
// runs `uip rpa analyze <dir> --output json`. Fails on Error/Critical findings.
// Self-contained: no import of AI-DLC's own libraries.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TRIGGER = "build-and-test-summary.md";
const ANALYZE_TIMEOUT_MS = 600_000;

interface Finding {
  level: string;
  code: string;
  description: string;
  file: string;
}

interface ProjectResult {
  dir: string;
  status: "analyzed" | "skipped-legacy";
  errors: number;
  warnings: number;
  findings: Finding[];
}

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function emit(result: object): never {
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(0);
}

function fail(msg: string): never {
  process.stderr.write(`aidlc-sensor-uipath-workflow-analyzer: ${msg}\n`);
  process.exit(1);
}

export function findProjects(root: string): string[] {
  if (existsSync(join(root, "project.json"))) return [root];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && existsSync(join(root, d.name, "project.json")))
    .map((d) => join(root, d.name));
}

function targetFramework(dir: string): string {
  try {
    return JSON.parse(readFileSync(join(dir, "project.json"), "utf-8")).targetFramework ?? "";
  } catch {
    return "";
  }
}

// Parses the `uip rpa analyze --output json` envelope into counts + findings.
export function parseAnalyze(stdout: string, dir: string): ProjectResult {
  const start = stdout.indexOf("{");
  if (start < 0) fail(`no JSON from uip rpa analyze for ${dir}`);
  let env: {
    Result?: string;
    Message?: string;
    Data?: {
      Summary?: Record<string, number>;
      Findings?: { Level: string; ErrorCode: string; Description: string; FilePath: string }[];
    };
  };
  try {
    env = JSON.parse(stdout.slice(start));
  } catch (e) {
    fail(`unparsable analyze output for ${dir}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (env.Result !== "Success" || !env.Data?.Summary) {
    fail(`uip rpa analyze failed for ${dir}: ${(env.Message ?? "unknown error").split("\n")[0]}`);
  }
  const s = env.Data.Summary;
  return {
    dir,
    status: "analyzed",
    errors: (s.Error ?? 0) + (s.Critical ?? 0),
    warnings: s.Warning ?? 0,
    findings: (env.Data.Findings ?? []).map((f) => ({
      level: f.Level,
      code: f.ErrorCode,
      description: f.Description,
      file: f.FilePath,
    })),
  };
}

function analyze(dir: string): ProjectResult {
  if (targetFramework(dir) === "Legacy") {
    return { dir, status: "skipped-legacy", errors: 0, warnings: 0, findings: [] };
  }
  const win = process.platform === "win32";
  // uip is an npm .cmd shim on Windows, which needs a shell; quote the path for it.
  const r = spawnSync("uip", ["rpa", "analyze", win ? `"${dir}"` : dir, "--output", "json"], {
    encoding: "utf-8",
    shell: win,
    timeout: ANALYZE_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) fail(`could not run uip: ${r.error.message}`);
  return parseAnalyze(r.stdout ?? "", dir);
}

export function main(argv: string[]): void {
  const outputPath = flag(argv, "--output-path");
  if (!outputPath) fail("--output-path is required");
  if (!outputPath.replace(/\\/g, "/").endsWith(`/${TRIGGER}`) && outputPath !== TRIGGER) {
    emit({ pass: true, findings_count: 0, projects: [] });
  }

  const dirs = findProjects(process.env.AIDLC_PROJECT_DIR ?? process.cwd());
  if (dirs.length === 0) {
    emit({ pass: true, findings_count: 0, projects: [], note: "no UiPath project.json found" });
  }
  const projects = dirs.map(analyze);
  const errors = projects.reduce((n, p) => n + p.errors, 0);
  emit({ pass: errors === 0, findings_count: errors, projects });
}

if (import.meta.main) main(process.argv.slice(2));
