# researcher

A read-only research agent for two modes: **repository research**
(searching the current codebase for facts, patterns, and history) and
**external research** (documentation, standards, and public sources via
web search/fetch).

## Using it

Invoke [`researcher`](agents/researcher.md) whenever a task needs
investigation before anyone changes code — "find out how X works here",
"what does library Y recommend for Z", "check whether this pattern already
exists". It never edits or writes files, and it clarifies a vague request
before searching rather than guessing at scope.

Every claim in its report traces to something it actually read — a file
and line for repository research, a quoted source and URL for external
research. Both report shapes end with a `Not found` section, filled in
even when everything was answered, so a reader can tell what was
genuinely checked and came up empty from what was never asked.

## Standing on its own

This plugin has no dependency on any other plugin in this marketplace and
doesn't require `sdd-workflow` to be installed — it's useful on its own
for any investigation task. Other plugins in this marketplace (for
example `sdd-workflow`'s `spec-creator`) delegate to it when it's
installed alongside them, but don't require it.
