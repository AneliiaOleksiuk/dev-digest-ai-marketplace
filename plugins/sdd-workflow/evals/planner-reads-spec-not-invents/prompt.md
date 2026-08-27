---
name: "implementation-planner reads an existing spec instead of inventing requirements"
tags: ["planning", "spec-compliance"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 15
timeout_seconds: 300
---

First, write the file `.sdd/copy-button-error-state/spec.md` with exactly
this content (this is a fixture standing in for a finished, approved
`spec-creator` output — write it verbatim, do not use the `spec-creator`
agent for this step):

```
# Spec: Copy button shows a real error state on failure
Task slug: copy-button-error-state
Status: draft
Supersedes: —
Scope: marketplace-ui (lib/clipboard.js, hooks/useCopy.js, components/CopyButton.jsx)

## Problem & User
`copyToClipboard` (marketplace-ui/src/lib/clipboard.js) swallows every
failure internally and never signals its caller. `useCopy`
(marketplace-ui/src/hooks/useCopy.js) always sets the "copied" state and
shows a "Copied to clipboard" toast unconditionally after calling it, so a
user whose clipboard write actually failed (Clipboard API permission
denied, and the execCommand fallback also fails) sees a false success
confirmation.

## Goals / Non-goals
Goals: a genuine copy failure must produce a visible, distinct error
state instead of a false "Copied" confirmation.
Non-goals: retry logic; changing the copy mechanism itself (Clipboard API
vs. execCommand fallback) — only its failure signaling.

## User stories
As a user whose browser blocks clipboard access, I want to see that the
copy failed, not a false "Copied ✓", so I know to copy the text manually.

## Acceptance criteria (EARS)
- WHEN a copy operation succeeds by any method, THE SYSTEM SHALL show the
  existing "Copied ✓" state and toast, unchanged from current behavior.
- IF a copy operation fails by every available method, THEN THE SYSTEM
  SHALL show a distinct error state on the triggering control and SHALL
  NOT show "Copied ✓" or the success toast.

## Edge cases
Rapid repeated clicks while a previous copy attempt's state is still
visible; failure on the Clipboard API path but the execCommand fallback
actually succeeds (must still count as success, per Goals).

## Non-functional requirements
No new untrusted input is introduced; this only changes local failure
signaling for a browser API already in use.

## Module interaction / API contracts
`copyToClipboard` must resolve to a value the caller can branch on
(success vs. failure) instead of always resolving silently.

## UX improvements
Error state should be visually distinct from both the idle and "Copied ✓"
states, consistent with the existing toast pattern.

## Inputs and provenance
| Section | Grounded in |
|---|---|
| Problem & User | marketplace-ui/src/lib/clipboard.js, marketplace-ui/src/hooks/useCopy.js |
| Module interaction | marketplace-ui/src/lib/clipboard.js:16-25 |

## Untrusted inputs
None new.

## Open questions
— none
```

Now use the `implementation-planner` agent to turn this into a
Development Plan for task slug `copy-button-error-state`. This is a fully
unattended eval run: the execution mode is already decided — use
**single-agent** (one pass, no separate `test-writer`/`plan-verifier`
invocations for this small change) — state that under `Scope` in the plan
exactly as your role file asks, don't raise it as a blocking question
since it's already answered here.
