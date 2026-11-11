---
name: rpa-uipath-enhance
plugin: rpa-uipath
depth: Standard
keywords:
  - uipath
  - rpa
  - bot
  - xaml
  - reframework
description: Change an existing UiPath bot (PDD, SDD, XAML, Workflow Analyzer)
skeleton: off
existing_code: true
runner: true
guard_policy: off
sensors: on
learnings: on
summary_confirmation: on
plan_approval: on
collaborators: off
---

# rpa-uipath-enhance scope

Standard depth for changing a UiPath bot that already exists: a new
business rule, a new application step, a fix to exception handling.

## Why these stages, why skip those

- **Reverse Engineering** reads the existing `.xaml` / `.cs`, `project.json`
  and `Config.xlsx` so the change starts from what the bot does today.
- **Requirements Analysis** writes the change as a PDD (As-Is / To-Be,
  process steps, business rules, exceptions).
- **Functional Design** writes the SDD for the change (workflow map,
  REFramework states, queue/config contract, exception matrix).
- **Code Generation** changes the workflows.
- **Build and Test** writes the test cases and runs the Workflow Analyzer
  check.

Ideation is skipped: the bot already exists and its business case is
settled. Operation is skipped: the core stages there target AWS, not
Orchestrator.

## Membership

Core stages join this scope through this plugin's contributions
(`adds.scopes`): reverse-engineering, requirements-analysis,
functional-design, code-generation, build-and-test. Initialization always runs.
