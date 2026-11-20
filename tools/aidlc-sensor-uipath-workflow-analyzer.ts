// aidlc-sensor-uipath-workflow-analyzer.ts — ADVISORY Workflow Analyzer gate (rpa-uipath-ai-dlc plugin).
//
// Fired at the build-and-test gate once per deliverable. Acts only on
// build-and-test-summary.md (one run per gate); every other path passes through.
// Finds UiPath projects (project.json, up to MAX_DEPTH levels down) and runs
// `uip rpa analyze <dir> --output json` on each. Fails on Error/Critical findings.
// Self-contained: no import of AI-DLC's own libraries.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TRIGGER = "build-and-test-summary.md";
// One budget shared by every project. Keep it under the manifest's
// timeout_seconds (900) so the script reports its own timeout instead of being
// killed by the dispatcher.
const BUDGET_MS = 840_000;
const MAX_DEPTH = 3;
const FAILING_LEVELS = new Set(["error", "critical"]);

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

interface SensorResult {
  pass: boolean;
  findings_count: number;
  projects: ProjectResult[];
  note?: string;
}

type ProjectJson = Record<string, unknown>;

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

// Returns the parsed project.json when it belongs to a UiPath project, else null.
// Other tools also use the name project.json; those must not reach the analyzer.
export function readProject(dir: string): ProjectJson | null {
  try {
    // Studio can write project.json with a UTF-8 BOM, which JSON.parse rejects.
    const p = JSON.parse(readFileSync(join(dir, "project.json"), "utf-8").replace(/^﻿/, ""));
    const isUiPath =
      p !== null &&
      typeof p === "object" &&
      ["studioVersion", "schemaVersion", "targetFramework"].some((k) => typeof p[k] === "string");
    return isUiPath ? p : null;
  } catch {
    return null;
  }
}

// A UiPath project owns its sub-directories, so the search stops at the first
// project.json on each branch.
export function findProjects(dir: string, depth = MAX_DEPTH): string[] {
  if (readProject(dir)) return [dir];
  if (depth === 0) return [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "node_modules")
    .flatMap((d) => findProjects(join(dir, d.name), depth - 1));
}

// A project.json written before Studio 2021.10 has no targetFramework; it is Legacy.
export function isLegacy(project: ProjectJson): boolean {
  return project.targetFramework === undefined || project.targetFramework === "Legacy";
}

interface Envelope {
  Result?: string;
  Message?: string;
  Data?: {
    Summary?: Record<string, number>;
    Findings?: { Level: string; ErrorCode: string; Description: string; FilePath: string }[];
  };
}

// uip can print log lines around the envelope: try the whole output first, then
// each "{" that starts a line.
function parseEnvelope(stdout: string): Envelope | null {
  const end = stdout.lastIndexOf("}") + 1;
  const starts = [0, ...[...stdout.matchAll(/^\{/gm)].map((m) => m.index)];
  for (const start of starts) {
    try {
      const v = JSON.parse(stdout.slice(start, end));
      if (v !== null && typeof v === "object" && "Result" in v) return v;
    } catch {
      // not the envelope; try the next candidate
    }
  }
  return null;
}

// Parses the `uip rpa analyze --output json` envelope into counts + findings.
// Only Error / Critical findings are listed; warnings are counted.
export function parseAnalyze(stdout: string, dir: string, stderr = ""): ProjectResult {
  const env = parseEnvelope(stdout);
  if (!env) {
    const hint = stderr.trim().split("\n")[0];
    throw new Error(`no JSON from uip rpa analyze for ${dir}${hint ? `: ${hint}` : ""}`);
  }
  if (env.Result !== "Success" || !env.Data?.Summary) {
    throw new Error(`uip rpa analyze failed for ${dir}: ${(env.Message ?? "unknown error").split("\n")[0]}`);
  }
  const s = env.Data.Summary;
  return {
    dir,
    status: "analyzed",
    errors: (s.Error ?? 0) + (s.Critical ?? 0),
    warnings: s.Warning ?? 0,
    findings: (env.Data.Findings ?? [])
      .filter((f) => FAILING_LEVELS.has(String(f.Level).toLowerCase()))
      .map((f) => ({ level: f.Level, code: f.ErrorCode, description: f.Description, file: f.FilePath })),
  };
}

function analyze(dir: string, deadline: number): ProjectResult {
  const project = readProject(dir);
  if (!project || isLegacy(project)) {
    return { dir, status: "skipped-legacy", errors: 0, warnings: 0, findings: [] };
  }
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new Error(`time budget used up before analyzing ${dir}`);
  const win = process.platform === "win32";
  // uip is an npm .cmd shim on Windows, which needs a shell; quote the path for it.
  const r = spawnSync("uip", ["rpa", "analyze", win ? `"${dir}"` : dir, "--output", "json"], {
    encoding: "utf-8",
    shell: win,
    timeout: remaining,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw new Error(`could not run uip for ${dir}: ${r.error.message}`);
  return parseAnalyze(r.stdout ?? "", dir, r.stderr ?? "");
}

// Throws when the sensor could not run; the caller turns that into a non-zero exit.
export function run(argv: string[], env: Record<string, string | undefined> = process.env): SensorResult {
  const outputPath = flag(argv, "--output-path");
  if (!outputPath) throw new Error("--output-path is required");
  if (!outputPath.replace(/\\/g, "/").endsWith(`/${TRIGGER}`) && outputPath !== TRIGGER) {
    return { pass: true, findings_count: 0, projects: [] };
  }

  const root = env.AIDLC_PROJECT_DIR ?? process.cwd();
  if (!existsSync(root)) throw new Error(`project directory not found: ${root}`);
  const dirs = findProjects(root);
  if (dirs.length === 0) {
    return { pass: true, findings_count: 0, projects: [], note: "no UiPath project.json found" };
  }

  const deadline = Date.now() + BUDGET_MS;
  const projects = dirs.map((dir) => analyze(dir, deadline));
  const errors = projects.reduce((n, p) => n + p.errors, 0);
  const skipped = projects.filter((p) => p.status === "skipped-legacy").length;
  const result: SensorResult = { pass: errors === 0, findings_count: errors, projects };
  // A skipped project is not a checked project: say so next to the pass.
  if (skipped > 0) {
    result.note =
      skipped === projects.length
        ? "nothing analyzed: every project is Legacy, which the analyzer does not support"
        : `${skipped} Legacy project(s) skipped, not analyzed`;
  }
  return result;
}

if (import.meta.main) {
  try {
    process.stdout.write(`${JSON.stringify(run(process.argv.slice(2)))}\n`);
  } catch (e) {
    process.stderr.write(`aidlc-sensor-uipath-workflow-analyzer: ${e instanceof Error ? e.message : String(e)}\n`);
    process.exit(1);
  }
}
