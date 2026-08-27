# SDD Plugins — Specification (draft v1 — implemented)

Draft based on the original conversation, revised once the reference repo
(`D:\htdocs\devDigest`, local) landed and the four plugins were actually built
under `plugins/`. Sections below are marked **Resolved**/**Implemented** where
this pass settled them; remaining `TBD` items are in §12.

## 1. Goals

Four plugins, live under `plugins/` and registered in
`.claude-plugin/marketplace.json`:

| Plugin (kebab-case) | Category | Contents |
|---|---|---|
| `sdd-workflow` | Spec Driven Development | Agents: `spec-creator`, `implementation-planner`, `implementer`, `test-writer`, `plan-verifier`, `doc-writer`. Skills: `run-plan` (orchestrator), `run` (workflow retro, manual), plus 6 stack-agnostic domain skills (`backend-service-patterns`, `frontend-component-patterns`, `typed-contracts`, `security-baseline`, `diagramming`, `session-insights-log`). `README.md` + `CHANGELOG.md`. |
| `researcher` | standalone | Agent: `researcher` |
| `architecture-reviewer` | standalone | Agent: `architecture-reviewer` |
| `shared-skills` | dependency (reusable) | Skill: `engineering-paved-path` — see §3 |

Bigger than the original 4-agent/1-skill sketch in §1's first draft: the
reference repo's real SDD chain includes `test-writer` and `doc-writer` and
an orchestrator skill (`run-plan`), and the user asked to port the **full**
flow rather than the simplified version (see §8).

## 2. Per-plugin folder layout — as built

```
plugins/sdd-workflow/
├── .claude-plugin/plugin.json      # dependencies: ["shared-skills"]
├── agents/
│   ├── spec-creator.md
│   ├── implementation-planner.md
│   ├── implementer.md
│   ├── test-writer.md
│   ├── plan-verifier.md            # spec-compliance only — see §8
│   └── doc-writer.md
├── skills/
│   ├── run-plan/SKILL.md           # orchestrator: implementer → test-writer →
│   │                                #   plan-verifier → architecture-reviewer
│   │                                #   (if installed) → doc-writer → smoke
│   ├── run/SKILL.md                # "Run" = workflow retro, manual only
│   ├── backend-service-patterns/SKILL.md
│   ├── frontend-component-patterns/SKILL.md
│   ├── typed-contracts/SKILL.md
│   ├── security-baseline/SKILL.md
│   ├── diagramming/SKILL.md
│   └── session-insights-log/SKILL.md
├── README.md
└── CHANGELOG.md

plugins/researcher/
├── .claude-plugin/plugin.json
├── agents/researcher.md
└── README.md

plugins/architecture-reviewer/
├── .claude-plugin/plugin.json      # dependencies: ["shared-skills"]
├── agents/architecture-reviewer.md
└── README.md

plugins/shared-skills/
├── .claude-plugin/plugin.json
├── skills/engineering-paved-path/SKILL.md
└── README.md
```

`node scripts/validate-marketplace.mjs` and `claude plugin validate .` both
pass (only a pre-existing, expected `tags`-in-`plugin.json` warning, per this
repo's own `build-index.mjs` convention — see `docs/PLUGIN-GUIDELINES.md`).

## 3. Shared skills across plugins — resolved

[PLUGIN-GUIDELINES.md](./PLUGIN-GUIDELINES.md) forbids a plugin referencing
files outside its own folder — no import mechanism between plugin folders.

**Resolved:** `shared-skills` is a separate, standalone plugin holding one
skill, `engineering-paved-path` (written fresh — see §8, not ported from the
reference repo, which had no skill by that name). It is depended on by:

- `sdd-workflow` — `implementer` applies it proactively while writing
  layered code.
- `architecture-reviewer` — audits already-written code against the same
  named rules, citing them in findings.

`researcher` does **not** depend on `shared-skills` — it never invokes a
skill (confirmed in the reference repo's own agent definition and preserved
in the port). This settles the "TBD?" dependency question from the earlier
dependency-graph artifact: two solid edges into `shared-skills`
(`sdd-workflow`, `architecture-reviewer`), no edge from `researcher`.

The [MARKETPLACE-UI-SPEC.md §4.1](./MARKETPLACE-UI-SPEC.md) `dependencies`
chip mechanism renders both edges; installation is still manual —
installing `sdd-workflow` or `architecture-reviewer` does not auto-install
`shared-skills`.

## 4. SDD workflow — as implemented

```
spec-creator → implementation-planner → implementer → test-writer
                                                            │
                                                            ▼
                                                     plan-verifier
                                                    (spec compliance)
                                                            │
                                        (architecture-reviewer, separate
                                         plugin, optional — invoked by
                                         run-plan if installed)
                                                            │
                                                            ▼
                                                       doc-writer
                                                            │
                                            skill: run (workflow retro,
                                                     manual only)
```

- **spec-creator** (Opus) — turns a request into a Spec.
- **implementation-planner** (Opus) — turns the Spec into a Development
  Plan, confirming multi-agent vs. single-agent execution mode.
- **implementer** (Sonnet) — executes the plan.
- **test-writer** (Sonnet) — writes tests for what `implementer` shipped, as
  an independent pass (oracle derived from the plan/spec before reading the
  implementation).
- **plan-verifier** (Opus) — spec-compliance gate only now (see §8 for why
  architecture review moved out); non-hedgeable `VERDICT: PASS / FAIL /
  PASS WITH REQUIRED FIXES`.
- **architecture-reviewer** (Sonnet, separate plugin) — audits the diff
  against `engineering-paved-path`; `run-plan` invokes it as an optional
  phase when installed.
- **doc-writer** (Sonnet) — documents what shipped and passed, last in the
  chain.
- **run** skill — manual-only workflow retro.
- **run-plan** skill — orchestrates the implementer→...→doc-writer back
  half, with a 3-iteration-capped fix-loop on a failing verdict or a
  critical/high architecture finding.

**Resolved — handoff location & files:** each SDD cycle gets its own task
folder at the target repo's root — `.sdd/<task-slug>/`, holding `spec.md`,
`plan.md`, `verification-report.md`, `retro.md` as each stage produces them.
Committed alongside the code it documents, not gitignored. This replaces the
reference repo's own convention (global `SPEC-NN` IDs under `specs/`, plans
under `docs/plans/`) — that convention was devDigest-specific tooling
scaffolding (fixed module enum, sequential IDs across the whole repo), not
something that transfers cleanly to an arbitrary installer's repo.

## 5. Model assignment per agent

| Agent | Model | Why |
|---|---|---|
| `spec-creator` | **Opus** | Turning an ambiguous request into a spec is a judgment call — weighing trade-offs, filling gaps, deciding what's in/out of scope. |
| `implementation-planner` | **Opus** | Breaking a spec into a correct, ordered implementation plan requires architectural judgment, not just pattern-following. |
| `implementer` | Sonnet | Executing an already-decided plan is focused, well-scoped work. |
| `test-writer` | Sonnet | Deriving test cases from a plan/spec and wiring them to real code is bounded, not open-ended. |
| `plan-verifier` | Opus | Per-item compliance checking against a plan still benefits from careful judgment on ambiguous evidence, even though it applies no domain skill. |
| `doc-writer` | Sonnet | Documenting what shipped is bounded, not exploratory. |
| `researcher` | Sonnet | Research/lookup work is breadth, not depth. |
| `architecture-reviewer` | Sonnet | Review against stated, named rules — bounded, not exploratory. |

Rule of thumb: **if the task requires weighing trade-offs, use Opus; if the
path is clear, use Sonnet.** Set each agent's `model` field in its own
frontmatter — don't rely on parent/orchestrator inheritance.

## 6. Token & time budget

Unchanged from the original decision — file-based handoff (not conversation
replay), no unbounded fan-out (this is a linear pipeline), a capped
verify→revise loop (`run-plan`: max 3 iterations), lean specs/plans, and
durable rules living in skills/READMEs rather than repeated per-prompt. See
§4 for the concrete file contract this budget depends on.

## 7. Skill content sourcing — best-practices requirement (partially open)

**Standing requirement, unchanged:** every skill must be grounded in
researched practice, with sources noted, not invented from scratch.

**Status after this pass:** the six domain skills in `sdd-workflow`
(`backend-service-patterns`, `frontend-component-patterns`, `typed-contracts`,
`security-baseline`, `diagramming`, `session-insights-log`) and
`engineering-paved-path` in `shared-skills` were **generalized from the
reference repo's own equivalent skills** (a working, previously-used skill
catalog — itself grounded in named external sources in its own source
files) plus engineering judgment to keep them stack-agnostic, not built from
a fresh external best-practices search with citations recorded per skill.

`TBD`: a dedicated best-practices research + citation pass per skill, per
this section's standing requirement — not done in this implementation pass.
Track in §12.

## 8. Porting from the reference repo — what actually happened

Reference repo: `D:\htdocs\devDigest` (local, user-provided). Decisions made
while porting, in the order they came up:

- **`architecture-reviewer` was merged into `plan-verifier` in the source**
  (2026-08-07, "Phase 2"). Resolved: **split back into two agents** — a
  pre-merge eval fixture (`evals/agents/architecture-reviewer/fixtures/
  architecture-reviewer.md`) supplied the shape; `plan-verifier` in this
  marketplace is Phase-1/spec-compliance only.
- **"Engineering Paved Path" did not exist under that name** in the source
  (0 grep hits). Resolved: **written from scratch** as
  `shared-skills`'s `engineering-paved-path` — six named, stack-agnostic
  rules (`inward-only-dependencies`, `thin-boundary-layer`, `di-discipline`,
  `secrets-chokepoint`, `isolated-core`, `no-duplicated-shared-contracts`),
  generalized from the source's onion-architecture/DI/secrets rules rather
  than copied.
- **The source's real SDD chain is wider** than the original sketch (adds
  `test-writer`, `doc-writer`, and an `run-plan` orchestrator skill).
  Resolved: **ported the full flow**, not the simplified 4-agent version.
- **The source's stack-specific skill catalog** (framework/ORM/DB-specific:
  onion-architecture, a backend-framework skill, an ORM skill, a
  relational-DB-design skill, a meta-framework skill, a UI-framework skill,
  a component-layout skill, a component-testing skill, a static-typing
  skill, a schema-validation skill) contradicted the "works with any stack"
  goal. Resolved: **each skill was generalized individually**, then
  *consolidated* into six broader, non-duplicative skills
  (`backend-service-patterns`, `frontend-component-patterns`,
  `typed-contracts`, `security-baseline`, `diagramming`,
  `session-insights-log`) rather than one generalized file per original
  skill — a deliberate judgment call to avoid near-duplicate generic stubs;
  each ported agent's skill-catalog table still tells `implementer` to
  prefer the target repo's own framework-specific skill when one is
  installed, and use these for the transferable principles.
- **Multi-tool support (Cursor, etc.):** explicitly **deferred** — content
  is written natively for Claude Code (no extra tool-agnostic-wording
  effort spent this pass); a Cursor/other-tool distribution mechanism is a
  separate future initiative, not part of this port.
- **Generalization scan:** every ported file was grepped for
  `devDigest`/`dev-digest`/`DevDigest`, framework names, and hardcoded
  commands (`pnpm`, `vitest`, `arch:check`, etc.) — zero hits outside one
  intentional, neutral example list of framework names in
  `backend-service-patterns`.
- **README files:** each plugin's `README.md` was written for this
  marketplace, drawing structure from the reference repo's own
  `agents/README.md` (agent-table shape, handoff-chain diagram) where that
  content transferred directly; content specific to the old merged-agent
  rationale was replaced with this port's own split rationale (§4).

## 9. `sdd-workflow/README.md` — required sections (done)

All five original requirements are met: what SDD is and why the six agents
+ skills exist together; the workflow diagram in prose; one line per agent
(input/output); when to invoke `run`; the `shared-skills` dependency and
why it's a separate plugin rather than a `plan-verifier` phase.

## 10. Versioning per plugin

Per [RELEASES.md](./RELEASES.md), version lives in `plugin.json` (all four
at `0.1.0`). `sdd-workflow/CHANGELOG.md` records the `0.1.0` initial release
in human-readable form.

## 11. Marketplace registration — live

```json
{
  "plugins": [
    { "name": "sdd-workflow", "source": "./plugins/sdd-workflow" },
    { "name": "researcher", "source": "./plugins/researcher" },
    { "name": "architecture-reviewer", "source": "./plugins/architecture-reviewer" },
    { "name": "shared-skills", "source": "./plugins/shared-skills" }
  ]
}
```

Registered in `.claude-plugin/marketplace.json`; `node
scripts/build-index.mjs` indexes 21 items (agents + skills) across the 4
plugins without error.

## 12. Open items — pending your input

- [ ] **Best-practices citation pass (§7).** The domain skills and
      `engineering-paved-path` were generalized from the reference repo plus
      judgment, not from a fresh external best-practices search with
      per-skill citations. Still owed, per §7's standing requirement.
- [ ] **Try it end-to-end.** None of the six agents / two skills have been
      run against a real task yet — worth a smoke run (`spec-creator` →
      `run-plan`) before treating this as production-ready.
- [ ] **Cursor/multi-tool support** — deliberately deferred (§8); revisit as
      its own initiative if/when it's actually wanted.
- [ ] Decide whether the dependency-graph artifact from earlier in this
      session should be redeployed to reflect the now-resolved
      `shared-skills` edges (§3) — cosmetic, not blocking.

**Resolved this pass:** everything in §§1–11 above — plugin names, folder
layout, the shared-skills dependency model (confirmed: `sdd-workflow` and
`architecture-reviewer` depend on it, `researcher` doesn't), the `.sdd/`
handoff convention, model assignment, the full 6-agent/2-skill SDD chain
(including the `architecture-reviewer` split and the from-scratch
`engineering-paved-path` skill), the domain-skill consolidation, and the
deferred multi-tool scope — is now implemented under `plugins/`, registered
in `marketplace.json`, and passing both validation scripts.
