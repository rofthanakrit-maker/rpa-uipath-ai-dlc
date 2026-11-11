---
id: uipath-workflow-analyzer
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-uipath-workflow-analyzer.ts
default_severity: advisory
fire_on: gate
description: Runs UiPath Workflow Analyzer (uip rpa analyze) on the project and reports Error/Critical findings (rpa-uipath plugin, advisory)
category: code-quality
matches: "**/{aidlc-docs,intents}/**"
input_schema:
  output_path: string
  stage_slug: string
output_schema:
  pass: boolean
  findings_count: integer
  projects: array
timeout_seconds: 900
---

# uipath-workflow-analyzer sensor (rpa-uipath)

ADVISORY, gate-fired. Bound to `build-and-test` through the plugin's
contribution. The gate fires a sensor once per deliverable; this one acts only
on `build-and-test-summary.md` and passes every other file through, so the
analyzer runs once per gate.

It looks for `project.json` in the project directory, then in each direct
sub-directory, and runs `uip rpa analyze <dir> --output json` on each UiPath
project it finds.

- `pass: false` when any project has `Error` or `Critical` findings. Warnings
  are counted and listed, but do not fail.
- A `Legacy` project is skipped with a note: the analyzer does not support it.
- No `project.json` found: pass with a note.
- `uip` missing or the analyzer crashing: the script exits non-zero, which the
  dispatcher records as `SENSOR_COULD_NOT_RUN` (not a pass).

Kept advisory so a slow or broken analyzer never blocks the gate; switch
`default_severity` to `blocking` once the team trusts it.
