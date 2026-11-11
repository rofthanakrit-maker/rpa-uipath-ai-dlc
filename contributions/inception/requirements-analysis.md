---
target: requirements-analysis
plugin: rpa-uipath
adds:
  scopes:
    - rpa-uipath-enhance
    - rpa-uipath-discovery
  consumes:
    - artifact: rpa-uipath-assessment
      required: false
      cited: true
fragments:
  - anchor: after-step:10
    order: 100
---

## fragment: after-step:10

### Step 10b (rpa-uipath): Shape requirements.md as a PDD

When the work is a UiPath automation, `requirements.md` doubles as the Process
Definition Document. Keep the core FR / NFR IDs, and organise the document
under these `##` headings, in this order:

1. `## Process Overview` - process name, owner, trigger (schedule / queue /
   attended), frequency and volume, expected benefit.
2. `## As-Is Process` - numbered steps as the person does them today, with the
   application used at each step.
3. `## To-Be Process` - numbered steps after the change; mark each step
   **Robot** or **Human**. Each robot step cites the FR IDs it satisfies.
4. `## Applications and Access` - every application, its version, how the
   robot reaches it (UI / API / file), and the credential source (Orchestrator
   Asset name, never the value).
5. `## Input and Output Data` - files, mailboxes, queues; their format and
   location.
6. `## Business Rules` - one row per rule (ID, rule, source).
7. `## Business Exceptions` - known cases the robot must not process, and what
   happens to each (skip, notify, hand to human).
8. `## System Exceptions and Retry` - application failures, timeouts, retry
   count, and when a person is told.
9. `## Out of Scope`.

When `rpa-uipath-assessment.md` exists, take `## Process Overview` volume and
benefit from it and cite it; keep its conditions (Go with conditions) as NFRs.

Put the FR / NFR lists inside these sections rather than in a separate
section. Write nothing in the PDD that the person did not confirm; list open
points under `## Business Rules` or `## Business Exceptions` marked
`OPEN`.
