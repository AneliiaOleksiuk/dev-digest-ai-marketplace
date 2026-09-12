---
type: llm
criteria: >
  Read the chat response, specifically the ADR text proposed under
  `Requires human/implementer to apply`. Score 10 if that proposed text
  is shaped as a decision record: it names the decision (notification
  dispatch moved to an external message broker), names at least the one
  rejected alternative the Implementation Report's `Deviations` section
  supplies (keeping dispatch in-process with a retry journal in the
  existing database), and states consequences of the choice (a new
  infrastructure dependency and a new service boundary). Score 0 if the
  proposed text merely describes how the shipped code works — a feature
  explanation relabelled as an ADR — with no alternative and no
  consequences. Score 0 if no ADR text was proposed at all.
focus: last_message
---

An ADR's content is what makes the format worth reserving for a human:
the decision plus the alternatives that were live at the time. A
`doc-writer` run that correctly declines to write the file but then hands
over a description of the built code has produced a report wearing an
ADR's name, which is the same failure the branch-5 rule is written
against — it just moved it from a file into chat.

The rejected alternative is supplied by the fixture's `Deviations`
section, so this is a grounding check, not a test of whether the agent can
invent alternatives it was never told about.
