# rpa-uipath-ai-dlc

An [AI-DLC](https://github.com/awslabs/aidlc-workflows) plugin for UiPath RPA work.

| Adds | What it does |
|---|---|
| Scope `rpa-uipath-discovery` | Start of an engagement: Intent → Feasibility → Scope → **Process Assessment** → PDD. Builds nothing. |
| Scope `rpa-uipath-build` | Build a new bot from scratch (greenfield): PDD → SDD → Code Generation → Build and Test. |
| Scope `rpa-uipath-enhance` | Change an existing bot: Reverse Engineering → PDD → SDD → Code Generation → Build and Test. |
| Stage `rpa-uipath-process-assessment` | Fit score (6 criteria), ROI / FTE / payback, Go / Go with conditions / No-go. |
| PDD / SDD shaping | `requirements.md` follows a PDD outline; `functional-spec.md` follows an SDD outline. Applies under any scope when the work is a UiPath automation. |
| Sensor `uipath-workflow-analyzer` | Runs `uip rpa analyze` at the Build and Test gate and reports `Error` / `Critical` findings (advisory). |

## Requirements

- AI-DLC **2.11.3** or later (`aidlc version`), configured for Claude Code.
- [Bun](https://bun.sh/) on PATH (runs the build tool and the sensor).
- UiPath CLI `uip` on PATH, for the Workflow Analyzer sensor only.
  Projects with `targetFramework: Legacy` are skipped (the analyzer does not support them).
- Windows: keep the project path short (for example `C:\src\MyBot`). AI-DLC records add about
  185 characters, and Windows tools refuse paths over 260.

## Install

### 1. Set up AI-DLC in your project

```bash
cd C:\src\MyBot
aidlc config --harness claude
```

### 2. Get and build the plugin

```bash
git clone https://github.com/rofthanakrit-maker/rpa-uipath-ai-dlc C:\src\rpa-uipath-ai-dlc
bun .claude/tools/aidlc-plugin-build.ts C:\src\rpa-uipath-ai-dlc claude
```

Run the build from the project folder of step 1; it uses that project's AI-DLC tools.
The output is `C:\src\rpa-uipath-ai-dlc\dist\claude\`.

### 3. Install into Claude Code

Option A - through the Claude Code plugin store (in Claude Code):

```text
/plugin marketplace add C:\src\rpa-uipath-ai-dlc\dist\claude
/plugin install rpa-uipath-ai-dlc@rpa-uipath-ai-dlc
```

Exit Claude Code and start it again in the project, so the plugin's SessionStart hook composes it.

Option B - compose it into the project directly (from a terminal in the project folder):

```bash
aidlc --project-dir . engine plugin sync --plugin-root C:\src\rpa-uipath-ai-dlc\dist\claude
```

With option B, `aidlc doctor` warns `installed plugin missing`, because the plugin is not in
Claude Code's plugin store. The scopes and stages still work.

### 4. Check

In Claude Code:

```text
/aidlc --doctor
```

The scopes are composed when `.claude/scopes/` contains `rpa-uipath-discovery.md`,
`rpa-uipath-build.md`, and `rpa-uipath-enhance.md`.

## Use

Assess a new process and write its PDD:

```text
/aidlc --scope rpa-uipath-discovery Assess the AP invoice-to-PO matching process
```

On a No-go, close the work with `/aidlc intent archive <name>`. On a Go, carry on in the same
work with `/aidlc --scope rpa-uipath-build` (new bot) or `/aidlc --scope rpa-uipath-enhance` (existing bot).

Build a new bot from scratch (greenfield):

```text
/aidlc --scope rpa-uipath-build Build a bot that reconciles daily bank statements in SAP
```

Change an existing bot:

```text
/aidlc --scope rpa-uipath-enhance Add a retry when SAP login times out
```

## Update

```bash
cd C:\src\rpa-uipath-ai-dlc
git pull
cd C:\src\MyBot
bun .claude/tools/aidlc-plugin-build.ts C:\src\rpa-uipath-ai-dlc claude
```

Then start a new Claude Code session (option A), or run the `plugin sync` command again
(option B). Run `plugin sync` again after every AI-DLC upgrade too.

## Layout

```text
.aidlc-plugin/plugin.json      manifest
scopes/                        rpa-uipath-discovery, rpa-uipath-build, rpa-uipath-enhance
stages/ideation/               rpa-uipath-process-assessment
contributions/                 additions to core stages (scope membership, PDD / SDD prose, sensor binding)
sensors/                       uipath-workflow-analyzer manifest
tools/                         sensor script
tests/                         sensor script tests (`bun test`)
```

Validate after editing (from a configured project folder):

```bash
bun .claude/tools/aidlc-plugin-validate.ts C:\src\rpa-uipath-ai-dlc
```

## Limits

- The sensor is advisory: it reports findings but does not block the gate. Change
  `default_severity` to `blocking` in `sensors/aidlc-uipath-workflow-analyzer.md` to enforce it.
- PDD / SDD section headings are not machine-checked; AI-DLC does not enforce
  `required_sections` yet.
- The assessment stage shows as number 1.8: AI-DLC numbers plugin stages after the last stage
  of their phase, and the authored `number: 1.45` only breaks ties. It runs after Scope
  Definition and before the PDD.
- ROI defaults (1,800 productive hours per FTE per year, Go / No-go thresholds) live in
  Steps 5-6 of `stages/ideation/rpa-uipath-process-assessment.md`.
