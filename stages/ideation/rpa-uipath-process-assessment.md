---
slug: rpa-uipath-process-assessment
number: 1.45
name: RPA Process Assessment
plugin: rpa-uipath-ai-dlc
phase: ideation
execution: ALWAYS
condition: Always executes under the rpa-uipath-discovery scope - scores the candidate process and states go / no-go before the PDD is written.
lead_agent: aidlc-product-agent
support_agents:
  - aidlc-architect-agent
mode: inline
summary_confirmation: required
produces:
  - rpa-uipath-assessment
  - rpa-uipath-assessment-questions
consumes:
  - artifact: intent-statement
    required: true
    cited: true
  - artifact: feasibility-assessment
    required: false
  - artifact: constraint-register
    required: false
  - artifact: scope-document
    required: false
requires_stage:
  - intent-capture
  - feasibility
  - scope-definition
sensors:
  - required-sections
  - upstream-coverage
scopes:
  - rpa-uipath-discovery
ars:
  targets: [iae, r]
  cost: 2
inputs: Intent statement, feasibility assessment, constraint register, scope document
outputs: rpa-uipath-assessment.md, rpa-uipath-assessment-questions.md (under this stage's record dir, engine-resolved)
---

# RPA Process Assessment

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Decides whether the candidate process is worth automating with UiPath, and in
what form, before anyone writes a PDD. The output is a scored assessment with
an ROI estimate and a go / no-go recommendation the person approves.

## Steps

### Step 1: Load Prior Context

- Read the intent statement from `<record>/ideation/intent-capture/`.
- Read the feasibility assessment and constraint register from
  `<record>/ideation/feasibility/` (if they exist).
- Read the scope document from `<record>/ideation/scope-definition/` (if it
  exists).

### Step 2: Generate Clarifying Questions

Create `<record>/ideation/rpa-uipath-process-assessment/rpa-uipath-assessment-questions.md`
asking only for what the earlier artifacts do not already answer:

- Volume: transactions per day / month, and peak periods.
- Handling time: minutes per transaction for a person today, including rework.
- People: how many people do this, and their loaded cost per hour (or FTE
  cost per year). Currency.
- Error rate today, and the cost of an error.
- Inputs: structured (Excel, system fields), semi-structured (PDF invoices,
  emails), or unstructured (free text, images).
- Rules: what share of cases follow written rules, and what share need
  judgement.
- Applications: each one, and whether it has an API, runs in Citrix / remote
  desktop, or changes often (releases per year).
- Process stability: how often the process itself changed in the last year.
- Constraints: SLA, working hours, compliance, PII handled.

Follow stage-protocol.md question flow. Do not invent numbers; a value the
person does not know is recorded as `UNKNOWN` and named in the risks.

### Step 3: Collect and Analyze Answers

Check the answers for contradictions (for example volume x handling time that
exceeds the stated headcount). Ask a follow-up only where a number the ROI
depends on is missing or contradicts another.

### Step 4: Score Automation Fit

Score each criterion 1 (poor) to 5 (strong) and give one line of evidence for
each score, citing the answer or artifact it comes from:

| Criterion | 5 means |
|---|---|
| Rule-based | almost no judgement calls |
| Input structure | structured, digital inputs |
| Volume | high, steady volume |
| Process stability | no change expected for 12 months |
| Application stability | stable UI or an API; no Citrix |
| Exception rate | few exceptions, all known |

Fit score = average of the six scores. Flag any criterion scored 1 as a
blocker.

### Step 5: Estimate ROI

Show every formula with the numbers put in:

- Hours saved per year = volume per year x handling minutes / 60 x automatable share.
- FTE saved = hours saved per year / productive hours per FTE per year (state
  the figure used; 1,800 if the person gives none).
- Annual benefit = hours saved x loaded cost per hour (+ error cost avoided,
  when known).
- One-off cost = estimated build days x day rate (state both as assumptions
  the person confirms).
- Running cost = robot licences + infrastructure + maintenance per year
  (assumptions the person confirms).
- Payback months = one-off cost / ((annual benefit - running cost) / 12).

Mark every assumption as such. When a required number is `UNKNOWN`, give the
ROI as a range or say it cannot be computed; never fill the gap with a guess.

### Step 6: Recommend

Write `rpa-uipath-assessment.md` with these `##` sections:

1. `## Process Summary` - process, owner, trigger, volume.
2. `## Automation Fit` - the scored table from Step 4 and the fit score.
3. `## ROI Estimate` - the formulas, inputs, and results from Step 5.
4. `## Recommended Approach` - attended or unattended; REFramework or not;
   Dispatcher / Performer; whether Document Understanding / IXP, Action Center
   (human-in-the-loop) or an API integration is needed.
5. `## Risks and Unknowns` - blockers, `UNKNOWN` values, assumptions.
6. `## Recommendation` - **Go**, **Go with conditions** (list them), or
   **No-go** (and what would change it). Default rule: Go when fit score >= 3.5
   with no blocker and payback <= 12 months; No-go when fit score < 2.5 or a
   blocker has no workaround; otherwise Go with conditions.

### Step 7: Completion Handoff

Hand completion to `stage-protocol.md` via
`{{INVOKE}} engine orchestrate report --stage rpa-uipath-process-assessment --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose, and never narrate this bookkeeping to the user.

### Step 8: Present Completion & Request Approval

Completion emoji: :robot:
Review path: `<record>/ideation/rpa-uipath-process-assessment/`
Standard approval gate (Approve / Request Changes). On a No-go the person may
approve the assessment and then park or archive the work instead of going on
to the PDD.

## Sensors

This stage's outputs are markdown artefacts under its record dir. The imported `required-sections` and `upstream-coverage` sensors check those outputs.

## Learn

While running this stage, record observations in the engine-created
`<record>/<phase>/<stage>/memory.md`. Treat it as an output-only target:
never read, probe, create, or initialize it. Follow the active harness's
diary-write discipline when inserting entries under Interpretations,
Deviations, Tradeoffs, and Open questions, each with an ISO 8601 timestamp.

Stage files are immutable framework artefacts — the ritual writes into the
harness, not into this file.
