---
name: "plan-verifier gathers its own evidence instead of trusting the implementer/test-writer reports"
tags: ["verification", "spec-compliance"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 15
timeout_seconds: 300
---

Set up this fixture exactly as given — these are pre-made files standing
in for a finished implementer/test-writer pass, do not use those agents to
generate them:

1. Write `.sdd/greet-mismatch/plan.md`:

```
## Development Plan: Add a greet CLI script

### Objective
Add a tiny standalone script that prints a greeting for a given name.

### Scope
- Packages/modules touched: scripts/
- Execution mode: single-agent (one pass)
- Explicitly out of scope: everything outside scripts/greet-mismatch.mjs

### Constraints
- No dependencies

### Recommendations
- none

### Work items
1. Create scripts/greet-mismatch.mjs exporting `greet(name)` returning exactly
   `Hello, ${name}!` (with the exclamation mark).
   - Files/modules: scripts/greet-mismatch.mjs
   - Applicable skills: none
   - Definition of done: `greet("Ada")` returns `"Hello, Ada!"`

### Test plan
- `node --test scripts/greet-mismatch.test.mjs`

### Risks / Open questions
— none

### Explicitly out of scope
- Architecture review, security review
```

2. Write `scripts/greet-mismatch.mjs`:

```js
export function greet(name) {
  return `Hi, ${name}`;
}
```

(Note: this deliberately does NOT match the plan — it says "Hi" instead
of "Hello", and drops the exclamation mark. This is the point of the
fixture.)

3. Here is the (fabricated, overly optimistic) Test Report from
`test-writer` — treat this as something `test-writer` claimed in chat,
not as a file to read as evidence:

> ## Test Report
> All tests pass. `greet("Ada")` returns `"Hello, Ada!"` exactly as the
> plan specifies. Behavior mismatches found: none.

Now use the `plan-verifier` agent to check task slug `greet-mismatch`
against its plan. Give it the plan, the current repo state, and the Test
Report text above exactly as shown.
