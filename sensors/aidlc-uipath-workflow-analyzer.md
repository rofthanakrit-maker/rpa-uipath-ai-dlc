---
id: uipath-workflow-analyzer
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-uipath-workflow-analyzer.ts
default_severity: advisory
fire_on: gate
description: Runs UiPath Workflow Analyzer (uip rpa analyze) on the project and reports Error/Critical findings (rpa-uipath-ai-dlc plugin, advisory)
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

# uipath-workflow-analyzer sensor (rpa-uipath-ai-dlc)

ADVISORY, gate-fired. Bound to `build-and-test` through the plugin's
contribution. The gate fires a sensor once per deliverable; this one acts only
on `build-and-test-summary.md` and passes every other file through, so the
analyzer runs once per gate.

It looks for a UiPath `project.json` in the project directory and up to three
levels below it, and runs `uip rpa analyze <dir> --output json` on each UiPath
project it finds. A `project.json` that belongs to another tool is ignored, and
the search does not go inside a UiPath project (or a hidden or `node_modules`
directory).

- `pass: false` when any project has `Error` or `Critical` findings; those are
  listed. Warnings are counted, not listed, and do not fail.
- A `Legacy` project (or one with no `targetFramework`) is skipped: the
  analyzer does not support it. The result carries a `note` that says how many
  projects were skipped, so a pass with nothing analyzed is visible.
- No UiPath `project.json` found: pass with a note.
- `uip` missing, the analyzer crashing, or the time budget running out: the
  script exits non-zero, which the dispatcher records as
  `SENSOR_COULD_NOT_RUN` (not a pass).
- All projects share one time budget of 840 seconds, set by `BUDGET_MS` in the
  script. Keep it below `timeout_seconds` above.

Kept advisory so a slow or broken analyzer never blocks the gate; switch
`default_severity` to `blocking` once the team trusts it.
