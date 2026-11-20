---
target: build-and-test
plugin: rpa-uipath-ai-dlc
adds:
  scopes:
    - rpa-uipath-ai-dlc-build
    - rpa-uipath-ai-dlc-enhance
  sensors:
    - uipath-workflow-analyzer
fragments:
  - anchor: after-step:8
    order: 100
---

## fragment: after-step:8

### Step 8b (rpa-uipath-ai-dlc): UiPath test cases

When the work is a UiPath automation, the test instructions cover, for each
new or changed workflow:

- the happy path with one valid transaction;
- every row of the SDD `## Exception Matrix` (one Business Rule Exception and
  one System Exception at least), with the expected queue item status;
- each `Config.xlsx` key added, missing and present.

Each test case that is added as a workflow follows Given-When-Then and is
registered in `project.json` under `designOptions.fileInfoCollection`; when a
`uipath-rpa` skill is available, follow its testing guide for both.

Name the test data files and where they live. Record in
`build-and-test-summary.md` the result of the Workflow Analyzer check
(`uip rpa analyze`); the `uipath-workflow-analyzer` sensor re-runs it at the
gate and reports any `Error` or `Critical` finding.
