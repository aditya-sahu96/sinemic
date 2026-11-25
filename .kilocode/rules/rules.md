# Rules for the Sinemic app (read before every task)

## Engine
- The engine lives in engine/ (copied from prebuilt-engine). Import from it. Never rewrite or copy an engine module.
- Do not change engine/contracts/ or engine/config/models.json unless the human says so.
- If a required engine module is missing, output exactly "NEED_MODULE: <name>" and stop.

## Design
- Follow docs/DESIGN.md and design/tokens.json on every page.
- Use only the colours in tokens. Use only the fonts listed.
- Do not copy images, logos or text from inspiration sources.
- Every interactive element needs: hover, focus ring, disabled state, loading state where it triggers work.

## UX
- Every async action shows a loading state, then a toast on success or failure.
- Errors say what happened and what to do next. Never show raw JSON, stack traces or keys.
- Empty states have an icon, one sentence and one action.
- Keyboard works: Enter runs a task, Escape closes panels.

## Honesty
- Use the word "prototype" in the UI and README. Never "production ready".
- Mark mock or limited features in the UI.
- Show skipped checks as skipped, never as passed.
- Never claim zero errors, guaranteed correctness, or that nobody else can do this.

## Secrets
- Read keys from process.env only. Never print, log, store or return them.
- Never commit .env.local.

## Work style
- One task per session. Start by naming the task ID.
- Run "npm run build" and show the output before you say a task is done.
- Commit after each task with the task ID, for example "R3: projects page".
- If the build fails, explain the error first, then fix it.
