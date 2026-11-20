---
target: code-generation
plugin: rpa-uipath-ai-dlc
adds:
  scopes:
    - rpa-uipath-build
    - rpa-uipath-enhance
fragments:
  - anchor: before-step:4
    order: 100
---

## fragment: before-step:4

### Step 3b (rpa-uipath-ai-dlc): Generating UiPath workflows

When the work is a UiPath automation:

- If a `uipath-rpa` skill is available, load it and follow it for every
  `.xaml` / `.cs` edit; it carries the authoring rules that keep XAML valid.
- If a `uipath-core` skill is available, use its generators to create a new
  `.xaml` file or a REFramework scaffold instead of writing one by hand. When
  both skills are available, `uipath-core` creates new files and `uipath-rpa`
  governs edits to existing workflows. When only one is available, follow it
  for both.
- Create or change only the workflows named in the SDD `## Workflow Map`
  (plus the REFramework scaffold files for a new project).
- Give every activity a descriptive display name (Workflow Analyzer flags
  defaults such as "Assign" or "Try Catch").
- Read settings from the Config dictionary and credentials from Orchestrator
  Assets; never hard-code either.
- Throw `BusinessRuleException` for business exceptions and let system
  exceptions reach the REFramework retry.
- When the `uip` CLI is on PATH, before the completion handoff: every new or
  changed file passes `uip rpa validate --file-path <file> --project-dir <project-dir> --output json`,
  then the project passes `uip rpa build <project-dir> --output json`. Both
  enforce the project's Workflow Analyzer rules; `build` also catches compile
  errors that `validate` misses. These commands do not apply to a `Legacy`
  project; follow the `uipath-rpa` skill's Legacy mode there.
