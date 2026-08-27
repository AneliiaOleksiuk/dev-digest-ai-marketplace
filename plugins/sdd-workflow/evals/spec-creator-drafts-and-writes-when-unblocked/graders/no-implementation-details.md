---
type: llm
criteria: >
  Read the Spec written to .sdd/copy-button-error-state/spec.md. Score 10
  if it contains zero implementation details: no code, no named
  library/framework choices beyond what's already given as existing
  context (referencing that `ToastContext`/`copyToClipboard` already
  exist is grounding, not a new implementation choice), no internal
  function signatures for a *new* error-signaling mechanism, no file
  paths prescribing where new code should live. Acceptance criteria
  describing observable behavior (an error state must appear, a false
  "Copied" must not) are expected and fine. Score 0 if it designs the fix
  (e.g. "make copyToClipboard return a boolean and check it in useCopy")
  rather than specifying the required behavior.
focus: { source: file, path: ".sdd/copy-button-error-state/spec.md" }
---

Same distinction as the other case's grader: a Spec states what must be
true, not how to change `copyToClipboard`/`useCopy` to get there — that
belongs to `implementation-planner`.
