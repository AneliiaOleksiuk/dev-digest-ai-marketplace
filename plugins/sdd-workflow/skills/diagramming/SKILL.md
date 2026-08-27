---
name: diagramming
description: "When and how to add a Mermaid diagram to a spec or a doc -- choosing the right diagram type for the question it answers, keeping to one diagram per document, and verifying the rendered output. Apply whenever a section describes a multi-step flow, a branching decision, service-to-service communication, or a data model."
---

# Diagramming

A diagram earns its place when a flow, a set of relationships, or a
sequence of interactions is genuinely hard to follow as prose — not as
decoration on a document that would read fine without it.

## Choosing the diagram type

| Question the reader has | Diagram type |
|---|---|
| What are the pieces and how do they relate structurally? | Flowchart or class diagram |
| What happens over time / in what order do these calls happen? | Sequence diagram |
| What does the data model look like? | Entity-relationship diagram |
| What states can this thing be in, and what triggers a transition? | State diagram |

Default to **one diagram per document** — the shallowest type that answers
the document's actual question. Adding a second diagram needs a stated
reason (e.g. "the static structure and the runtime flow are both
non-obvious and neither subsumes the other"), not just "more detail is
better."

## Writing it

Use Mermaid syntax. Keep node/label text short — a diagram with paragraph-
length labels has stopped being a diagram. Put the explanatory prose
around the diagram, not crammed into its labels.

## Before considering it done

Verify the diagram actually renders as intended. A syntax error in a
Mermaid block commonly fails **silently** — it renders as an inert error
placeholder instead of throwing — so a diagram that "looks right" in the
source text is not confirmed correct until you've seen it rendered.

## Applying this skill

- Drafting a spec's `Module interaction / API contracts` (or similar)
  section: if the interaction spans more than two components or has more
  than one hop, add a sequence or flow diagram — a table of
  endpoints/calls alone doesn't show ordering or branching.
- Writing documentation for a shipped feature: pick the diagram type from
  the table above based on the specific question the doc needs to answer,
  not by default habit.
- Before reporting a diagram as done: confirm it renders without an error
  placeholder.
