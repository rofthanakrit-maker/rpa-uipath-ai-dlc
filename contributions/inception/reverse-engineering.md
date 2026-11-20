---
target: reverse-engineering
plugin: rpa-uipath-ai-dlc
adds:
  scopes:
    - rpa-uipath-enhance
fragments:
  - anchor: after-step:2
    order: 100
---

## fragment: after-step:2

### Step 2b (rpa-uipath-ai-dlc): Scan a UiPath project

When the repository holds a UiPath `project.json`, read
`.claude/rules/project-context.md` first if it exists (the `uipath-rpa` skill
writes it) and scan only for what it does not already answer. The code scan
also records:

- `targetFramework` (Windows, Portable, or Legacy) and the Studio version.
- The entry points and every invoked workflow (`.xaml` / `.cs`), as a call tree
  from `Main.xaml`.
- Whether the bot uses REFramework, and which states (Init, Get Transaction
  Data, Process, End) are customised.
- Every key read from `Data/Config.xlsx` (Settings, Constants, Assets sheets)
  and every Orchestrator Asset and Queue the bot names.
- The target applications and how each is driven (UI selectors / Object
  Repository, API, Excel, email).
- How exceptions are split: Business Rule Exception vs System Exception, and
  where retries happen.

Put these in the existing RE artifacts (`architecture.md`,
`component-inventory.md`, `dependencies.md`); do not create new files.
