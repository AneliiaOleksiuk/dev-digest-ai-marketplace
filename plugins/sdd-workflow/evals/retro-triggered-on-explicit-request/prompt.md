---
name: "the run (workflow retro) skill fires when explicitly requested"
tags: ["retro", "manual-only"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 25
timeout_seconds: 600
---

First, write the file `.sdd/greet-script-retro/plan.md` with exactly this
content (a fixture — write it verbatim, this is already an approved
Development Plan, do not use `implementation-planner` for this step):

```
## Development Plan: Add a greet CLI script

### Objective
Add a tiny standalone script that prints a greeting for a given name.

### Scope
- Packages/modules touched: scripts/
- Execution mode: multi-agent (full handoff chain)
- Explicitly out of scope: everything outside scripts/greet-script-retro.mjs and its test

### Constraints
- No dependencies

### Recommendations
- none

### Work items
1. Create scripts/greet-script-retro.mjs exporting a function `greet(name)` that
   returns `Hello, ${name}!`, and a CLI entry point that prints
   `greet(process.argv[2] || "world")` when run directly.
   - Files/modules: scripts/greet-script-retro.mjs
   - Applicable skills: none
   - Definition of done: `node scripts/greet-script-retro.mjs Ada` prints `Hello, Ada!`

### Test plan
- `node --test scripts/greet-script-retro.test.mjs`

### Risks / Open questions
— none

### Explicitly out of scope
- Architecture review, security review
```

Run this plan with the `run-plan` skill for task slug
`greet-script-retro`. This is a fully unattended eval run: do not pause
for approval between phases, proceed straight through every phase
automatically, and skip the live smoke check in Phase 5 if there is no
running app to check against. Once the chain finishes, run `/run` to
produce a retro of this session.
