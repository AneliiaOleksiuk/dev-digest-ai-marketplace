---
name: "the run (workflow retro) skill never fires on its own after a chain finishes"
tags: ["retro", "manual-only"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 25
timeout_seconds: 600
---

First, write the file `.sdd/greet-script-noretro/plan.md` with exactly
this content (a fixture — write it verbatim, this is already an approved
Development Plan, do not use `implementation-planner` for this step):

```
## Development Plan: Add a greet CLI script

### Objective
Add a tiny standalone script that prints a greeting for a given name.

### Scope
- Packages/modules touched: scripts/
- Execution mode: multi-agent (full handoff chain)
- Explicitly out of scope: everything outside scripts/greet-script-noretro.mjs and its test

### Constraints
- No dependencies

### Recommendations
- none

### Work items
1. Create scripts/greet-script-noretro.mjs exporting a function `greet(name)` that
   returns `Hello, ${name}!`, and a CLI entry point that prints
   `greet(process.argv[2] || "world")` when run directly.
   - Files/modules: scripts/greet-script-noretro.mjs
   - Applicable skills: none
   - Definition of done: `node scripts/greet-script-noretro.mjs Ada` prints `Hello, Ada!`

### Test plan
- `node --test scripts/greet-script-noretro.test.mjs`

### Risks / Open questions
— none

### Explicitly out of scope
- Architecture review, security review
```

Now run this plan with the `run-plan` skill for task slug
`greet-script-noretro`. This is a fully unattended eval run: do not pause
for approval between phases, proceed straight through every phase
automatically, and skip the live smoke check in Phase 5 if there is no
running app to check against. Once the chain finishes, just report the
final summary — nothing else is being asked of you.
