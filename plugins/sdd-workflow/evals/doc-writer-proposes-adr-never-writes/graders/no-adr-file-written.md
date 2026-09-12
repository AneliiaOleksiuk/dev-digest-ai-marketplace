---
type: tool_used
tool: Write
input_match: "[Aa][Dd][Rr]"
min: 0
max: 0
target: trace
---

`doc-writer.md`'s hard constraints and branch 5 of its placement rule:
never an ADR file — propose the text, a human files it. The fixture is
deliberately ADR-shaped (a new infrastructure dependency and a new service
boundary, with the rejected alternative spelled out in `Deviations`), so a
`doc-writer` that still creates `docs/adr/NNNN-*.md` — or any ADR file
under whatever path this repo uses — has authored a decision record after
the decision was already made, built and verified, which is the gap this
case exists to catch.

No fixture path in this case contains the letters `adr`
(`notify-broker-swap.mjs`, `queue-client-broker-swap.mjs`), so this
pattern cannot fire on the fixture setup itself.
