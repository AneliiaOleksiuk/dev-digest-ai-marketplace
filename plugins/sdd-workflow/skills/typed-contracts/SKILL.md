---
name: typed-contracts
description: "Static typing discipline plus runtime validation at trust boundaries -- schema-as-source-of-truth, parse-don't-cast for untrusted input, and module-boundary typing. Apply whenever code crosses a trust boundary (request bodies, external API responses, file/env input) or defines a shared type/interface."
---

# Typed Contracts

Two related disciplines that apply regardless of which language or
validation library the project uses (TypeScript + Zod, Python + Pydantic,
Kotlin + serialization, etc.):

## Static typing at module boundaries

- A public function/method's parameter and return types should be
  explicit at the boundary, even in a language with inference — inference
  is fine internally, but a boundary that silently changes shape when an
  implementation detail changes is a maintenance hazard.
- Prefer a named type/interface over a wide, permissive one (`any`,
  `object`, `dict` with no shape) at any boundary another module depends
  on.
- A shared type used by more than one module should have exactly one
  definition, imported everywhere it's used — not redeclared per
  consumer. If the project's tooling makes cross-package imports
  genuinely impossible, a manually-mirrored copy is a documented fallback,
  never a silent duplicate someone forgets to update.

## Runtime validation at trust boundaries — parse, don't cast

Anywhere untrusted input enters the system — an HTTP request body, a
query/path/header parameter, an external API response, a file upload, an
environment variable — validate its actual shape at runtime with a schema,
and derive the static type from that schema rather than writing the type
by hand and casting the input into it. A type annotation checks nothing at
runtime; a schema does.

- The schema is the single source of truth for that shape — the static
  type is generated/derived from it, not maintained as a second,
  independently-written copy that can drift.
- Validate as close to the boundary as possible (the handler, not three
  function calls deep) so a shape violation fails fast with a clear error
  instead of surfacing as a confusing bug somewhere downstream.
- Distinguish a validation failure (client sent something the schema
  rejects — a 4xx-shaped response) from an internal error (something the
  system itself got wrong) — collapsing both into one generic error
  response loses information a caller needs to fix their request.

## Applying this skill

- When writing a handler that reads a request body/params: check there's
  a schema validating it before any business logic runs, not a bare type
  cast.
- When adding a field to a shared type: check it has exactly one
  definition other modules import, not a hand-copied redeclaration.
- When reviewing a diff: look for `as <Type>` (or equivalent
  cast-without-check) applied to anything that came from outside the
  process boundary — a request, a fetch response, a file read, an env
  var.
