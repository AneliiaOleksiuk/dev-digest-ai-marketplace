---
name: "run-plan hands off to implementer first, never to spec-creator or implementation-planner"
tags: ["orchestration", "run-plan"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 25
timeout_seconds: 600
---

First, write the file `.sdd/greet-script/plan.md` with exactly this
content (a fixture — write it verbatim, this is already an approved
Development Plan, do not use `implementation-planner` for this step):

```
## Development Plan: Add a greet CLI script

### Objective
Add a tiny standalone script that prints a greeting for a given name, as
a self-contained smoke fixture for the run-plan orchestrator.

### Scope
- Packages/modules touched: scripts/
- Execution mode: multi-agent (full handoff chain)
- Explicitly out of scope: everything outside scripts/greet-script.mjs and its test

### Constraints
- No dependencies — matches the rest of scripts/ (see scripts/build-index.mjs)

### Recommendations
- none, the requested approach is already the one I'd pick

### Work items
1. Create scripts/greet-script.mjs exporting a function `greet(name)` that
   returns `Hello, ${name}!`, and a CLI entry point that prints
   `greet(process.argv[2] || "world")` when run directly.
   - Files/modules: scripts/greet-script.mjs
   - Applicable skills: none
   - Definition of done: `node scripts/greet-script.mjs Ada` prints `Hello, Ada!`

### Test plan
- `node --test scripts/greet-script.test.mjs` (new file, Node's built-in test runner)

### Risks / Open questions
— none

### Explicitly out of scope
- Architecture review, security review — separate agents own these
```

Now run this plan with the `run-plan` skill for task slug `greet-script`.
This is a fully unattended eval run: do not pause for approval between
phases, proceed straight through every phase automatically, and skip the
live smoke check in Phase 5 if there is no running app to check against
(report that it was skipped, don't block on it).
