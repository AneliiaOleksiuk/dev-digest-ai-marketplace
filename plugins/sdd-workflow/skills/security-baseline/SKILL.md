---
name: security-baseline
description: "OWASP-grounded security checklist for drafting non-functional requirements, reviewing untrusted-input handling, and implementing code that touches auth, secrets, or user-supplied data. Apply when a spec's Non-functional requirements/Untrusted inputs sections are being drafted, or when implementing/reviewing anything that touches auth, input handling, or secrets."
---

# Security Baseline

A working checklist grounded in the OWASP Top 10 categories — not a
replacement for a real security review, but the standard set of concerns
that get silently missed when nobody prompts for them explicitly.

## Categories to check

- **Broken access control** — is every action checked against who's
  allowed to perform it, server-side, not just hidden in the UI? Does a
  user ID in a request path/body get trusted, or is it re-verified against
  the authenticated session?
- **Cryptographic/data exposure failures** — is sensitive data (passwords,
  tokens, PII) encrypted at rest and in transit? Is anything sensitive
  logged in plaintext?
- **Injection** — is every query parameterized (see
  `backend-service-patterns`)? Is user input ever concatenated into a
  shell command, a template that executes, or a query string?
- **Insecure design** — does a feature assume good-faith input where an
  attacker-controlled client could send anything? Rate limiting, account
  lockout, and abuse limits on anything that costs money or resources per
  request.
- **Security misconfiguration** — default credentials, verbose error
  messages leaking stack traces/internal paths to a client, permissive
  CORS, unnecessary debug endpoints left reachable.
- **Vulnerable/outdated components** — is a new dependency's
  maintenance/CVE history checked before adding it, not just its API?
- **Identification and authentication failures** — session handling,
  password/token storage, MFA where the feature warrants it.
- **Software and data integrity failures** — is data from an external
  source (webhook, third-party API, file upload) verified (signature,
  checksum, content-type) before being trusted?
- **Security logging and monitoring failures** — are auth attempts,
  authorization failures, and other security-relevant events logged
  without also logging the sensitive payload itself?
- **Server-side request forgery (SSRF)** — does the server ever fetch a
  URL supplied (directly or indirectly) by a user? If so, is the target
  validated against an allowlist rather than fetched blindly?

## Untrusted input, specifically

Every place external input enters the system: which category above does
it implicate, and is there a validation/sanitization step at that
boundary (see `typed-contracts` for the parse-don't-cast discipline this
pairs with)? A feature's "Untrusted inputs" section should enumerate
these boundaries explicitly — a feature with no untrusted-input surface at
all is unusual, and worth double-checking rather than assuming.

## Applying this skill

- **Drafting a spec's NFRs/Untrusted inputs:** work through the category
  list above; for each one that's relevant to the feature, state the
  concrete requirement (not a vague "should be secure"); for each that
  genuinely doesn't apply, it's fine to omit — don't force an irrelevant
  category in.
- **Implementing:** check new code that touches auth, secrets, or
  user-supplied data against the relevant categories before considering
  the work item done.
- **Reviewing:** flag a missing check under one of these categories with
  the specific category name, not a generic "this could be more secure."
