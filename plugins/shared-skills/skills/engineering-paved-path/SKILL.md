---
name: engineering-paved-path
description: "Stack-agnostic structural rules for layered application code -- inward-only dependencies, thin boundary layers, one composition root for dependency injection, a secrets chokepoint, an I/O-free core, and no duplicated shared contracts. Applied proactively by implementer while writing code, and audited against by architecture-reviewer after the fact. Each rule is named so a finding can cite it directly."
---

# Engineering Paved Path

A small set of structural rules, independent of language, framework, or
project layout, that most well-factored layered applications converge on.
This skill has two consumers with different jobs against the same rules:

- **`implementer`** applies these proactively, while writing code, as
  default good practice.
- **`architecture-reviewer`** audits already-written code against them
  after the fact, citing the specific rule name and a `file:line` for any
  violation found.

If the target repo has its own documented architecture rules that differ
from or extend these, the repo's own rules win — this skill is a sensible
default for a repo that has none yet, not an override of an existing,
deliberate local convention.

## Rules

### `inward-only-dependencies`

Layer order, outermost to innermost: **Presentation → Infrastructure →
Application → Domain** (naming varies by project — routes/controllers,
adapters/repositories, services/use-cases, domain/core are common
synonyms for the same four roles). A file in an inner layer must not
import from an outer layer:

- Domain/core code must not import a web framework, an ORM/database
  client, or any adapter.
- Application/service code must not import a web-framework request/
  response type or a concrete infrastructure client directly — only
  interfaces the infrastructure layer implements.
- Infrastructure/adapter code must not import from the application or
  presentation layer.
- Presentation/route code may import only from the application layer and
  its own input-validation schemas.

Check by resolving each import in a file to the layer its path/package
belongs to, and confirming the direction is inward-only.

### `thin-boundary-layer`

A presentation-layer handler (route, controller, resolver) does at most:
validate the input's shape, call exactly one application-layer method,
and shape the response. A conditional that isn't a pure input-shape check,
a direct database/query call, or business-object construction inside a
handler is a violation — that logic belongs one layer in.

### `di-discipline`

Concrete adapters, repositories, and clients are constructed in exactly
one composition point (a container, a factory module, or the framework's
own DI mechanism) — never instantiated ad hoc inside application/service
code. This is what makes the application layer testable against a
fake/mock without touching the real infrastructure.

### `secrets-chokepoint`

Secrets and sensitive environment configuration are read through exactly
one designated module — never accessed directly (raw environment-variable
reads, hardcoded fallbacks) from business logic scattered across the
codebase. This is what makes it possible to audit where secrets flow and
swap their source without touching business logic.

### `isolated-core`

If the project has a "pure core" module (business rules, a domain model,
a calculation/decision engine meant to be usable independently of any
specific transport or storage), that module must have **zero direct
I/O** — no filesystem, network, or database calls — only through an
injected interface the outer layers implement. A pure-core module that
imports a database driver or an HTTP client directly has lost the
property that made it "pure."

### `no-duplicated-shared-contracts`

A type, schema, or interface shared across two or more modules/packages
has exactly one authoritative definition, imported everywhere it's used.
A hand-copied redeclaration in a second location — even if currently
identical — is a violation: it will drift the first time one copy is
edited and the other isn't. If the project's tooling makes a true shared
import genuinely impossible across a boundary (e.g. two independently
packaged apps), a documented, deliberately-mirrored copy is an accepted
fallback — an *undocumented* duplicate is not.

## Applying this skill

**As `implementer`:** before finishing a work item that adds a new module,
handler, or shared type, check it against the rules above for the layer(s)
it touches.

**As `architecture-reviewer`:** for each rule, in order, check the files in
scope; record a violation as `rule: <name>`, the offending `file:line`,
the verbatim offending line, and a one-sentence recommendation. A rule
with no violation found in scope is not reported as a finding — see
"Verified clean" in `architecture-reviewer`'s own report format.

## What this skill does not cover

Security review (injection, secrets exposure as an attack surface — see a
project's security-review process), correctness/test-quality review, and
code style are explicitly out of scope for these rules — a violation
found while checking one of these six rules should not be broadened into
a general code-quality comment.
