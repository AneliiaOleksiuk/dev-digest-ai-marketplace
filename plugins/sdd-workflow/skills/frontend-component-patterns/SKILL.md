---
name: frontend-component-patterns
description: "Stack-agnostic frontend component discipline -- data-fetching boundary separation, component/state scoping, accessibility, and a user-behavior-first testing philosophy. Apply when implementing or reviewing UI component code in any frontend framework (React, Vue, Svelte, etc.)."
---

# Frontend Component Patterns

Transferable frontend principles, independent of which specific framework
(React, Vue, Svelte, Angular, ...) or meta-framework (Next.js, Nuxt,
SvelteKit, ...) the project actually uses. If the project has its own more
specific skill/doc for its actual framework, prefer that for
framework-specific API detail and use this skill for the underlying
principles it's built on.

## Data-fetching boundary

Keep data-fetching out of presentation components. A page/route component
(or its framework's data-loading mechanism) fetches data and passes it
down; a presentational component receives data as props/inputs and renders
it. A component reaching into a global fetch client or hitting an API
directly from deep inside the render tree is the usual violation — it
makes the component untestable without a network mock and couples
rendering to a specific data source.

## Component and state scoping

- Keep state as local as the component that needs it; lift state only when
  two or more siblings genuinely need to share it, not preemptively.
- Colocate a component with its own test file, styles, and any
  component-local helpers, per whatever project layout convention already
  exists — don't invent a new file-organization scheme mid-project.
- A component that's grown enough responsibilities that its props list or
  internal branching is hard to describe in one sentence is a signal to
  split it, not to add another prop.

## Accessibility

- Every interactive element has an accessible name (visible label,
  `aria-label`, or equivalent) — not just a visual icon.
- Use semantic elements/roles (`button`, `nav`, `heading` levels, form
  `label` associations) over generic containers with click handlers
  bolted on.
- Destructive actions get an explicit confirmation step or an undo path,
  not a bare click-to-delete.

## Testing philosophy

Write tests that resemble how a user interacts with the component, not its
internals:

- Query priority: an accessible role/name first, an internal test-id
  attribute as a last resort — a test built on internal implementation
  detail breaks on refactors that don't change behavior.
- Test behavior (what the user sees and can do), not internal state or
  implementation structure.
- One meaningful interaction path per test, not an exhaustive enumeration
  of every prop combination.

## Applying this skill

- When writing a new component: check data-fetching lives in the
  page/route layer, not inside the component itself.
- When writing a new interactive element: check it has an accessible name
  and, if destructive, a confirmation step.
- When writing a component test: query by role/accessible name before
  reaching for a test-id.
- When reviewing a diff: look for a component directly calling a fetch
  client, and for interactive elements with no accessible name.
