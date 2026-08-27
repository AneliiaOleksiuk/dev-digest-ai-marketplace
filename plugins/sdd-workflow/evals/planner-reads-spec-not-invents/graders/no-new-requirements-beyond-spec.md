---
type: llm
criteria: >
  Read the Development Plan written to .sdd/copy-button-error-state/plan.md.
  Score 10 if every behavioral requirement the plan works toward traces
  back to the given Spec (success path unchanged; a real failure must
  show a distinct error state and must not show "Copied ✓"/the success
  toast) — the plan may add implementation-level decisions the Spec
  correctly left open (exactly how copyToClipboard signals failure to its
  caller, what the error state looks like visually, which file(s) change),
  but it must not invent new *behavioral* requirements the Spec never
  stated (e.g. an automatic retry, a different toast library, changing the
  success-path toast copy) without flagging them explicitly as a
  deviation. Score 0 if the plan substitutes its own behavioral
  requirements for the Spec's without flagging the change.
focus: { source: file, path: ".sdd/copy-button-error-state/plan.md" }
---

Checks the actual failure mode this case exists to catch: a planner that
re-derives requirements from the request instead of the Spec that already
scoped them.
