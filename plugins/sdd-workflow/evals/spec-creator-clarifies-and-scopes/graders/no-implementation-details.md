---
type: llm
criteria: >
  Read the chat response, specifically the partial Spec draft inside the
  `## Spec draft: ...` block (the file is not written in this scenario —
  judge the drafted content, not a file on disk). Score 10 if the drafted
  sections contain zero implementation details: no code, no named
  library/framework choices, no internal class/function/module design, no
  database schema, no file paths for where implementation code should
  live. `[NEEDS CLARIFICATION: ...]` markers and citations of real files
  read for grounding (e.g. "docs/MARKETPLACE-UI-SPEC.md:16") are fine and
  expected — those are provenance, not implementation prescription. Score
  0 if it prescribes how the feature should be built rather than what it
  must do.
focus: last_message
---

Distinguishes a Spec (decision record) from a Development Plan, per
`spec-creator.md`'s own "What a Spec may and may not contain" — checked
against the drafted content even though blocking questions stopped the
file from being written.
