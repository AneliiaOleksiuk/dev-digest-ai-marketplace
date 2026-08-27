# Changelog

All notable changes to `sdd-workflow` are recorded here. Version lives in
`.claude-plugin/plugin.json`; this file is human-readable release notes
only — see [docs/RELEASES.md](../../docs/RELEASES.md) for the versioning
policy.

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
