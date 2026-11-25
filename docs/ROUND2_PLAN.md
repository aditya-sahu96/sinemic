# ROUND 2 PLAN: Sinemic prototype

## Goal of round 2
Submit a working, user-friendly prototype through GitHub. Judges must be able to:
1. Understand the problem in under 30 seconds from the landing page.
2. Open the live demo and complete one full flow without help.
3. Read the README and run the project locally if they want.

Round 3 (final) adds the remaining features and the final test. Do not build round 3 features now.

## Scope for round 2

### Must work
- Landing page that states the problem, who it is for, and what Sinemic does.
- Projects page with the demo project.
- Workspace with the full flow: map, describe task, context preview, run model, diff, checks, approve, ledger.
- Model fallback shown clearly (even if one model is busy).
- Usage limits shown to the user (requests left today).
- Clear loading, empty, and error states everywhere.
- About page and Roadmap page.
- README with problem, solution, screenshots, live link, local setup, limits.

### Interaction quality (this is what makes it feel finished)
- Guided first-run: a short 3-step tour on first visit, skippable, remembered in localStorage.
- Step indicator in the workspace: 1 Map, 2 Describe, 3 Review, 4 Check, 5 Approve.
- Every button shows a loading state and disables itself while busy.
- Toast messages for success and failure, in plain language.
- Errors say what happened and what to do next. Never show raw JSON.
- Keyboard: Enter to run a task, Escape to close panels.
- Smooth transitions (150 to 250 ms), no layout jumps.
- Mobile layout works: the three columns stack.

### Not in round 2
- Authentication, billing, teams.
- Python and Go live checks on the public site (show them in the video only).
- Skills, MCP, CLI.
- Production security audit.

## Tasks, in order

| ID | Task | Time | Gate |
|---|---|---|---|
| R0 | Setup repo, engine copy, design tokens | 30 min | none |
| R1 | Design system: colors, type, buttons, cards, toasts, step indicator | 45 min | R0 |
| R2 | Landing, About, Roadmap pages | 40 min | R1 |
| R3 | Projects page and workspace shell | 30 min | R1 |
| R4 | Demo project and extraction API | 25 min | engine: stack, adapters |
| R5 | Context pack API and task panel | 25 min | engine: selector, context, ledger |
| R6 | Ledger view | 20 min | engine: ledger |
| R7 | Model run with usage limits and fallback | 35 min | engine: model, usage |
| R8 | Verify and approve | 30 min | engine: verifier, ledger |
| R9 | Diff and checks panels | 20 min | R8 |
| R10 | Interactions: tour, toasts, keyboard, loading states | 30 min | R3 to R9 |
| R11 | Mobile pass, empty states, error states | 20 min | R10 |
| R12 | Build, README, screenshots, deploy, GitHub submission | 40 min | all |

## Done means
- `npm run build` passes.
- Every task has its own commit with the task ID.
- The live link completes the full flow.
- The README has the problem, solution, screenshots, and a demo video link.
- The GitHub repository is public (or the judges have access), as the round 2 rules require.

## Honesty rules
- Say "prototype" in the UI and README. Never say "production ready".
- Mark mocked or limited parts clearly.
- Show skipped checks as skipped, never as passed.
- Never claim zero errors or guaranteed correctness.
