---
name: rpa-uipath-build
plugin: rpa-uipath
depth: Standard
keywords:
  - new bot
  - greenfield
  - build bot
  - reframework scaffold
  - uipath new project
description: Build a new UiPath bot from scratch (PDD, SDD, REFramework/XAML, Workflow Analyzer)
skeleton: off
existing_code: false
runner: true
guard_policy: off
sensors: on
learnings: on
summary_confirmation: on
plan_approval: on
collaborators: off
---

# rpa-uipath-build scope

Standard depth for building a new UiPath bot from scratch (greenfield): from
PDD through SDD, project scaffold and workflows, to test cases and Workflow
Analyzer check.

## Why these stages, why skip those

- **Requirements Analysis** writes the PDD (As-Is / To-Be, process steps,
  business rules, exceptions). When continuing from `rpa-uipath-discovery`,
  the existing PDD and assessment are reused.
- **Functional Design** writes the SDD (solution architecture, target
  framework and expression language, workflow map, REFramework states,
  queue/config contract, exception matrix).
- **Code Generation** scaffolds the new UiPath project and generates the
  workflows.
- **Build and Test** writes the test cases and runs the Workflow Analyzer
  check.

Ideation is skipped: run `rpa-uipath-discovery` first when the business case
and ROI are not settled yet. Reverse Engineering is skipped: there is no
existing bot codebase to read. Operation is skipped: the
core stages there target AWS, not Orchestrator.

## Membership

Core stages join this scope through this plugin's contributions
(`adds.scopes`): requirements-analysis, functional-design, code-generation,
build-and-test. Initialization always runs.
