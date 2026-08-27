---
name: "spec-creator drafts and writes the same turn when nothing is genuinely blocking"
tags: ["spec-creation", "happy-path"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 15
timeout_seconds: 300
---

We need a Spec for a small, already-scoped bug/gap: the "Copy" buttons in
`marketplace-ui` (e.g. `CopyButton.jsx`, via `useCopy.js` calling
`copyToClipboard` in `lib/clipboard.js`) always show a "Copied ✓" state
and a "Copied to clipboard" toast, even when the underlying copy actually
failed (e.g. the Clipboard API is blocked by browser permissions and the
`execCommand` fallback also fails) — `copyToClipboard` currently swallows
every failure silently and never signals the caller. We want a real
failure to show a visible error state instead of a false "Copied"
confirmation. Use the `spec-creator` agent to draft this Spec.

Task slug: `copy-button-error-state`.

This is a fully unattended eval run — no further reply will come after
this message. This feature is fully scoped and grounded in real code you
can read directly (the three files named above and the existing
`ToastContext` pattern) — there is no design asset because none is needed
for an error-state tweak to an existing control. If, after drafting, you
have genuinely no blocking gaps per your own "Blocking questions" rule,
treat this message as explicit advance approval: proceed to call `Write`
for `.sdd/copy-button-error-state/spec.md` within this same turn, exactly
as your hard constraints allow once a draft has zero blocking questions.
Only stop short of writing if something about this specific request is
actually blocking — don't manufacture a reason to stop just because no
human will reply.
