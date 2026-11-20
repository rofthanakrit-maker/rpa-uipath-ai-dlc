---
name: rpa-uipath-discovery
plugin: rpa-uipath-ai-dlc
depth: Standard
keywords:
  - process assessment
  - rpa discovery
  - automation candidate
  - pdd
description: Assess a candidate UiPath process and write its PDD (no build)
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

# rpa-uipath-discovery scope

Standard depth for the start of an RPA engagement: decide whether a process is
worth automating, then write the PDD the business signs off. Nothing is built.

## Why these stages, why skip those

- **Intent Capture** - the process, its owner, and the pain point.
- **Feasibility & Constraints** - applications, access, Citrix, compliance.
- **Scope Definition** - what is in and out, which cases stay with people.
- **RPA Process Assessment** (this plugin) - fit score, ROI, go / no-go.
- **Requirements Analysis** - the PDD.

Everything after the PDD is skipped. After sign-off, carry on in the same work
with `/aidlc --scope rpa-uipath-build` (new bot) or `/aidlc --scope rpa-uipath-enhance`
(changing an existing bot).

## Membership

Core stages join through this plugin's contributions (`adds.scopes`):
intent-capture, feasibility, scope-definition, requirements-analysis. The
assessment stage lists this scope in its own `scopes:`. Initialization always
runs.
