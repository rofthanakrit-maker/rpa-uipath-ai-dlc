// Run: bun test
import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findProjects, isLegacy, parseAnalyze, run } from "../tools/aidlc-sensor-uipath-workflow-analyzer.ts";

function project(dir: string, json: object | string): string {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "project.json"), typeof json === "string" ? json : JSON.stringify(json));
  return dir;
}

const UIPATH = { name: "Bot", studioVersion: "24.10.0", targetFramework: "Windows" };

test("findProjects: nested projects, BOM, skips non-UiPath and hidden dirs", () => {
  const root = mkdtempSync(join(tmpdir(), "uipath-sensor-"));
  const a = project(join(root, "bots", "A"), UIPATH);
  const b = project(join(root, "B"), `﻿${JSON.stringify(UIPATH)}`);
  project(join(root, "dotnet"), { version: "1.0.0", frameworks: {} });
  project(join(root, ".local", "C"), UIPATH);
  project(join(root, "B", "nested"), UIPATH); // inside project B: not a separate project
  expect(findProjects(root).sort()).toEqual([b, a].sort());
});

test("findProjects: a non-UiPath project.json at the root does not hide sub-projects", () => {
  const root = project(mkdtempSync(join(tmpdir(), "uipath-sensor-")), { version: "1.0.0" });
  const a = project(join(root, "A"), UIPATH);
  expect(findProjects(root)).toEqual([a]);
});

test("isLegacy: explicit Legacy and missing targetFramework", () => {
  expect(isLegacy({ targetFramework: "Legacy" })).toBe(true);
  expect(isLegacy({ studioVersion: "20.10.0" })).toBe(true);
  expect(isLegacy(UIPATH)).toBe(false);
});

const ENVELOPE = {
  Result: "Success",
  Data: {
    Summary: { Error: 1, Critical: 1, Warning: 2 },
    Findings: [
      { Level: "Error", ErrorCode: "ST-NMG-001", Description: "bad name", FilePath: "Main.xaml" },
      { Level: "Critical", ErrorCode: "ST-SEC-007", Description: "secret", FilePath: "Main.xaml" },
      { Level: "Warning", ErrorCode: "ST-DBP-002", Description: "many args", FilePath: "A.xaml" },
      { Level: "Warning", ErrorCode: "ST-DBP-003", Description: "empty catch", FilePath: "B.xaml" },
    ],
  },
};

test("parseAnalyze: counts, lists only Error/Critical, survives log noise", () => {
  const noisy = `info: loading {project}\n${JSON.stringify(ENVELOPE, null, 2)}\ndone\n`;
  const r = parseAnalyze(noisy, "dir");
  expect(r.errors).toBe(2);
  expect(r.warnings).toBe(2);
  expect(r.findings.map((f) => f.code)).toEqual(["ST-NMG-001", "ST-SEC-007"]);
});

test("parseAnalyze: throws when uip gives no envelope or reports a failure", () => {
  expect(() => parseAnalyze("", "dir", "'uip' is not recognized\nmore")).toThrow("'uip' is not recognized");
  expect(() => parseAnalyze(JSON.stringify({ Result: "Failure", Message: "boom" }), "dir")).toThrow("boom");
});

test("run: passes other deliverables through, flags Legacy-only as not analyzed", () => {
  expect(run(["--output-path", "x/other.md"])).toEqual({ pass: true, findings_count: 0, projects: [] });
  expect(() => run([])).toThrow("--output-path is required");

  const root = mkdtempSync(join(tmpdir(), "uipath-sensor-"));
  project(join(root, "Old"), { studioVersion: "20.10.0", targetFramework: "Legacy" });
  const r = run(["--output-path", "a/build-and-test-summary.md"], { AIDLC_PROJECT_DIR: root });
  expect(r.pass).toBe(true);
  expect(r.note).toContain("nothing analyzed");
});
