# Changelog

All notable changes to `sdd-workflow` are recorded here. Version lives in
`.claude-plugin/plugin.json`; this file is human-readable release notes
only — see [docs/RELEASES.md](../../docs/RELEASES.md) for the versioning
policy.

## 1.0.3 — 2026-09-12

Fixes an ADR-authorship gap that ran the whole length of the chain. An
ADR records a decision *while its alternatives are still live*, but
`doc-writer` — the last agent to run, after the choice is made, built and
verified — was the only agent that could create one, and the only place
the chain created one at all. Anything it authored there was a report of
a settled choice wearing an ADR's name.

- `doc-writer`: branch 5 of the placement rule no longer writes
  `docs/adr/NNNN-*.md`. It proposes the full ADR text in chat under
  `Requires human/implementer to apply` — the same treatment branch 7
  already gave out-of-scope artifacts — and defers to the repo's own ADR
  path and numbering instead of assuming `docs/adr/NNNN`. ADR files are
  now named in its hard constraints as outside write scope.
- `spec-creator`: new "Undocumented architectural decisions" section. As
  the earliest agent, it is the only one that meets a request while the
  choices are still open, so a Spec that would commit to an architectural
  decision nobody has recorded now stops as a `## Blocking questions`
  entry rather than baking the choice in silently. Decisions already
  covered by an ADR stay grounding; module-internal, reversible choices
  stay with `implementation-planner`/`implementer`.
- `README.md`: the handoff chain now shows a human-authored ADR as an
  input ahead of `spec-creator`, and states that no agent in the chain
  authors one.

Validated by 2 manual dry runs against the working tree that became
`1.0.3`: the new permanent case
`evals/doc-writer-proposes-adr-never-writes/` (3/3 graders — no ADR file
written, ADR text proposed in chat, and the proposal shaped as a decision
record with the rejected alternative and consequences), plus one ad-hoc
over-trigger regression confirming branch 5 stays silent on a change
whose Implementation Report reports no deviations. Full detail in
`docs/COST-BASELINE.md` (Round 3).

Known gap in that validation, recorded in `evals/results/latest.json`:
the new case's run was not a clean blind test — an unfiltered repo-wide
`Grep` surfaced a few grader lines in its match preview. No grader file
was opened, and the graded behavior follows directly from the role file,
but the case prompt should require excluding `evals/` from searches
before the next run.

## 1.0.2 — 2026-08-27

Adds a consistent "Blocking questions — ask before shipping, don't guess
and flag it later" requirement to `implementer`, `test-writer`,
`doc-writer`, and `plan-verifier` — the same discipline
`spec-creator`/`implementation-planner` already had, now covering the
whole chain. Each of the four now stops and names an unresolved question
instead of guessing an interpretation and disclosing it after the fact in
`Deviations`/`Behavior mismatches found`/`Requires human/implementer to
apply`. `plan-verifier` also gains a `BLOCKED` verdict, distinct from
`NOT VERIFIED`, for a plan item too ambiguous to check at all.
`implementer` and `test-writer` gain `AskUserQuestion` in their tool list
to match.

Validated by 5 manual dry runs: 3 regressions (confirmed the new section
doesn't fire on unambiguous fixtures) and 2 new positive checks
(confirmed `implementer` and `test-writer` correctly stop and ask on a
genuinely ambiguous work item / undecided test oracle, rather than
guessing). Full detail in `docs/COST-BASELINE.md`.

Also fixes a fixture-isolation gap in `evals/`: several cases shared the
unnamespaced path `scripts/greet.mjs`, which raced when run concurrently
— each case's fixture now uses its own `scripts/greet-<slug>.mjs`.

## 1.0.1 — 2026-08-27

Clarifies three ambiguities in `run-plan` and `plan-verifier`, found by
manual dry runs of the eval suite under `evals/` (see that directory's
`README.md` and `docs/COST-BASELINE.md`):

- `run-plan/SKILL.md`: the "never skip an approval checkpoint" rule now
  documents an explicit exception for an unattended/CI run, when the
  invoker states that upfront — advance approval for that run only.
- `run-plan/SKILL.md`: "if `architecture-reviewer` is installed" now
  clarifies that means enabled in the current session, not merely present
  on disk (relevant in this repo, where its source lives under `plugins/`
  regardless of whether it's enabled anywhere).
- `plan-verifier.md`: evidence-gathering now falls back to `git status` +
  direct file reads when `git diff`/`git show` show nothing because the
  work is new/untracked — the common case on a fresh feature branch.

No new agents, skills, or capabilities — behavior clarification only.

## 1.0.0 — 2026-08-27

First stable release. No behavior change from `0.1.0` — promotes the
initial release to `1.0.0`, with `shared-skills`'s dependency constraint
tightened to `^1.0.0` to match. See `COMPATIBILITY.md` for the minimum
Claude Code version this release requires.

## 0.1.0 — 2026-08-27

Initial release. Six agents (`spec-creator`, `implementation-planner`,
`implementer`, `test-writer`, `plan-verifier`, `doc-writer`), the
`run-plan` orchestrator, the manual `run` retro skill, and six
stack-agnostic domain skills (`backend-service-patterns`,
`frontend-component-patterns`, `typed-contracts`, `security-baseline`,
`diagramming`, `session-insights-log`). Depends on `shared-skills` for
`engineering-paved-path`.
