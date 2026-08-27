---
name: backend-service-patterns
description: "Stack-agnostic backend layering and data-access discipline -- thin request handlers, a service layer that owns business logic, a repository/data-access layer that owns queries, and schema-change hygiene. Apply when implementing or reviewing server-side API/service code in any backend framework or database."
---

# Backend Service Patterns

Transferable backend principles, independent of which specific framework
(Express, Fastify, NestJS, Django, Rails, Spring, ...) or database
(Postgres, MySQL, Mongo, ...) the project actually uses. If the project has
its own more specific skill/doc for its actual framework, prefer that for
framework-specific API detail and use this skill for the underlying
principles it's built on.

## Layering

Three responsibilities, kept separate even in a small codebase:

- **Handler/route layer** — parses the request, validates its shape (see
  `typed-contracts`), calls exactly one service method, and shapes the
  response. No business logic, no direct database access here. A handler
  with an `if` that isn't a pure HTTP-shape check, or a query embedded
  directly in it, is a layering violation.
- **Service layer** — owns business logic and orchestration. Depends on
  data-access interfaces, not concrete database clients, so it can be
  tested without a real database.
- **Data-access/repository layer** — owns queries and persistence. Never
  reaches back up to call a service or a handler.

Dependencies point inward only: handler → service → data-access. A
data-access module importing from the service layer, or a service
importing a web-framework type, is exactly the violation this layering
exists to prevent.

## Query and schema discipline

- Always use parameterized queries or an ORM's parameter binding — never
  string-concatenate user input into a query.
- Schema changes go through the project's migration mechanism, never a
  hand-edited migration file or a direct `ALTER` against a running
  database outside that mechanism.
- Add an index when a query filters or joins on a column at meaningful
  scale; don't index speculatively on columns nothing queries by.
- Keep transactions scoped to the smallest unit of work that must be
  atomic — a transaction spanning an external network call (an email send,
  a third-party API call) is a common source of long-held locks.

## Dependency injection

Construct concrete adapters/repositories/clients in one designated
composition point (a container, a factory module, or the framework's own
DI mechanism) — not scattered `new ConcreteThing()` calls throughout
service code. This is what makes the service layer testable against a
fake/mock data-access implementation.

## Secrets and configuration

Read secrets and environment configuration through one chokepoint (a
config/secrets module), never `process.env` (or the language's
equivalent) scattered across business logic — this is what makes it
possible to audit where secrets flow and to swap the source (env var,
secrets manager, vault) without touching business logic.

## Applying this skill

- When writing a new route/handler: check it does only parse → call one
  service method → shape response.
- When writing a new service method: check it depends on an interface, not
  a concrete adapter, and contains no framework-specific request/response
  types.
- When writing a new query: check it's parameterized and goes through the
  data-access layer, not inlined in a handler or service.
- When reviewing a diff: grep for `new ` followed by an adapter/repository
  class name outside the designated composition point, and for direct
  `process.env` (or equivalent) reads outside the config/secrets module.
