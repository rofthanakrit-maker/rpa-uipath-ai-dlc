---
target: functional-design
plugin: rpa-uipath
adds:
  scopes:
    - rpa-uipath-build
    - rpa-uipath-enhance
fragments:
  - anchor: after-step:4
    order: 100
---

## fragment: after-step:4

### Step 4b (rpa-uipath): Shape functional-spec.md as an SDD

When the work is a UiPath automation, `functional-spec.md` doubles as the
Solution Design Document for this Unit. Add these `##` sections:

1. `## Solution Architecture` - REFramework or not (and why), Dispatcher /
   Performer split, attended or unattended, `targetFramework` and expression
   language (VisualBasic / CSharp; neither can change after the project is
   created). For each application driven through the UI, say whether targets
   are captured from the live application or left as placeholder selectors
   marked `TODO Indicate` for a developer.
2. `## Workflow Map` - every `.xaml` / `.cs` file added or changed, its
   arguments (name, direction, type), and who invokes it. Show the call tree
   as a mermaid diagram.
3. `## State Machine` - for REFramework: what each state does for this
   process (Init, Get Transaction Data, Process Transaction, End Process).
4. `## Transaction Data Contract` - queue name, the `SpecificContent` keys
   with types, the `Reference` format, and unique-reference rules.
5. `## Configuration` - every `Config.xlsx` key (sheet, name, example value)
   and every Orchestrator Asset (name, type). Credentials only as Asset names.
6. `## Exception Matrix` - one row per exception: type (Business Rule /
   System), where it is thrown, retry or not, log message, notification.
7. `## Logging` - the log fields added per transaction. Never log PII
   (names, ID numbers, account numbers, emails); log a reference instead.
8. `## Shared Libraries Referenced` - each tenant library the change reuses
   (package ID, version), or `None` once the person confirms there is none.
   The `uipath-rpa` skill takes its package list from this section.

`rules.md` keeps the business rules from the PDD (`requirements.md`
`## Business Rules`), each linked to the workflow that enforces it.
