---
target: code-generation
plugin: rpa-uipath
adds:
  scopes:
    - rpa-uipath-enhance
fragments:
  - anchor: before-step:4
    order: 100
---

## fragment: before-step:4

### Step 3b (rpa-uipath): Generating UiPath workflows

When the work is a UiPath automation:

- If a `uipath-rpa` skill is available, load it and follow it for every
  `.xaml` / `.cs` edit; it carries the authoring rules that keep XAML valid.
- If a `uipath-core` skill is available, use its generators to create a new
  `.xaml` file or a REFramework scaffold instead of writing one by hand. When
  both skills are available, `uipath-core` creates new files and `uipath-rpa`
  governs edits to existing workflows. When only one is available, follow it
  for both.
- Change only the workflows named in the SDD `## Workflow Map`.
- Give every activity a descriptive display name (Workflow Analyzer flags
  defaults such as "Assign" or "Try Catch").
- Read settings from the Config dictionary and credentials from Orchestrator
  Assets; never hard-code either.
- Throw `BusinessRuleException` for business exceptions and let system
  exceptions reach the REFramework retry.
- When the `uip` CLI is on PATH, run `uip rpa analyze <project-dir> --output json`
  after the edits and fix every `Error` / `Critical` finding before the
  completion handoff.
