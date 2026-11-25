# KILO PROMPTS for round 2

Paste the COMMON PREAMBLE first in every new Kilo session. Then paste one TASK prompt. Use Architect mode to plan and Code mode to build. Run the build yourself before you commit.

---

## COMMON PREAMBLE

```
Read these files in order before doing anything:
1. .kilocode/rules/rules.md
2. docs/ROUND2_PLAN.md
3. docs/DESIGN.md
4. design/tokens.json
5. engine/contracts/types.ts and engine/contracts/index.ts
6. engine/config/models.json

Rules for this session:
- Follow DESIGN.md and tokens.json. Do not invent colours or fonts.
- Import engine modules from engine/. Never rewrite them.
- If a required engine module is missing, output "NEED_MODULE: <name>" and stop.
- Build only the task named below. Do not touch other pages.
- When done, run "npm run build" and show the output.
- Then tell me the commit message to use.
```

---

## R0: Setup check

```
Task R0: confirm the project is ready.
- Check that engine/ contains contracts, modules, config and sample-repos.
- Check that design/tokens.json exists.
- Check that next.config.ts has serverExternalPackages: ["better-sqlite3"].
- Run "npm run build" and show the output.
Do not change any feature code yet.
Commit: "R0: project check".
```

---

## R1: Design system

```
Task R1: build the design system.
- Map design/tokens.json into app/globals.css as CSS variables, and into tailwind.config.ts.
- Build these components in components/ui/:
  Button (primary, secondary, ghost; loading and disabled states),
  Card, Badge (passed, failed, skipped, verified, implemented, proposed),
  Toast (success, error, info; auto-dismiss after 5 seconds; close button),
  StepIndicator (five steps: Map, Describe, Review, Check, Approve),
  EmptyState (icon, one sentence, one action),
  Input and Textarea (visible focus ring).
- Build a /design-check page that shows every component. This is for our review only.
- Follow the component rules in docs/DESIGN.md section 4.
Commit: "R1: design system".
```

---

## R2: Landing, About, Roadmap

```
Task R2: build the header layout, footer, and three pages.
- Header: "Sinemic" on the left, links Home, About, Projects, Roadmap on the right, mobile menu.
- Landing (/):
  Headline: "Build with any AI. Keep the project's memory. Verify every change."
  Problem block: "AI-built projects lose context when you switch models, say 'done' without proof, and skip basics like validation and secrets."
  Three cards: Project memory, Verified changes, Switch models without losing progress.
  Buttons: "Try the demo" (to /projects), "Learn more" (to /about).
  Label the page as a prototype.
- About (/about): the problem, how Sinemic works in plain language, what is verified and what is not, free model limits, link to Roadmap.
- Roadmap (/roadmap): list of planned features with status "Planned".
Commit: "R2: landing, about, roadmap".
```

---

## R3: Projects page and workspace shell

```
Task R3: build /projects and /projects/[id].
- /projects: list with one card "Sample: TypeScript checkout" and an "Open demo" button. Show an empty state if there are no projects.
- /projects/[id]: StepIndicator at the top. Three columns on desktop, stacked on mobile.
  Left: file and symbol list (placeholder until R4).
  Centre: task textarea, "Run task" button (disabled until a task is typed), context preview area.
  Right: tabs Diff, Checks, Ledger, each with an EmptyState.
Commit: "R3: projects and workspace".
```

---

## R4: Demo project and extraction

```
Task R4: build POST /api/projects/demo and POST /api/projects/[id]/extract.
- Demo route: copy engine/sample-repos/ts-checkout into data/projects/<id>. Return the project id.
- Extract route: detectStack, then getAdapter(language).extract(projectPath). Return the SymbolGraph.
- Set export const runtime = "nodejs".
- Left column shows the real symbol list. Show a loading state while extracting.
- Gate: needs engine/modules/stack and engine/modules/adapters. If missing, output NEED_MODULE and stop.
Commit: "R4: demo project and extraction".
```

---

## R5: Context pack

```
Task R5: build POST /api/projects/[id]/context and the task panel.
- Input: task text and target file paths.
- Call selectContext, openLedger(LEDGER_DB_PATH, projectId).read(), compilePack(..., 6000).
- Show the pack in the centre column. Show what was dropped and why, in plain words.
- Gate: needs engine/modules/selector, context, ledger.
Commit: "R5: context pack".
```

---

## R6: Ledger view

```
Task R6: build GET /api/projects/[id]/ledger and the Ledger tab.
- Seed the demo with REQ-001 "Discount above 1000" and REQ-002 "Total includes tax", and one decision with rejected options.
- Show requirements with status badges, decisions with chosen, rejected and reason, and the event list.
- Gate: needs engine/modules/ledger.
Commit: "R6: ledger view".
```

---

## R7: Model run with limits and fallback

```
Task R7: build POST /api/projects/[id]/run.
- Use openUsageStore and the models in engine/config/models.json (only chat models with status ok or untested).
- Remove any model the user has reached today's limit for, or where the global cap is reached.
- Call complete(pack, task, providers). On success, record the request and tokensUsed.
- Return: the proposed patches, which model answered, any error, and requests left today.
- If no model is left: "Free daily limit reached for today. Try again tomorrow, or add your own OpenRouter key."
- Show requests left in the UI as "3 of 10 requests left today".
- Gate: needs engine/modules/model, engine/modules/usage, engine/modules/context.
Commit: "R7: model run with limits".
```

---

## R8: Verify and approve

```
Task R8: build POST /api/projects/[id]/verify and POST /api/projects/[id]/approve.
- Verify: applyPatches to a copy under data/work/, then verify() with the TypeScript checks plus secretScan().
- Show skipped checks as skipped with the reason. Never as passed.
- Approve: only if the latest verify passed for this exact patch set. Write the patches to the project. Set status to implemented (actor "system"), then verified (actor "verifier").
- Gate: needs engine/modules/verifier, ledger, adapters.
Commit: "R8: verify and approve".
```

---

## R9: Diff and checks panels

```
Task R9: build the Diff and Checks tabs.
- Diff: each changed file, old against new, with added lines in success tint and removed lines in danger tint. Monospace font.
- Checks: each check with a Badge (passed, failed, skipped), the duration, and the first lines of output. Show the skip reason.
- Wire "Run task" to the flow: context, run, verify. Show the StepIndicator moving as each step completes.
Commit: "R9: diff and checks".
```

---

## R10: Interactions

```
Task R10: add the interaction layer.
- First-visit tour: three steps (Map, Describe, Approve), skippable, remembered in localStorage (wrap reads and writes in try/catch).
- Toasts for every action result.
- Enter runs the task. Escape closes open panels.
- Every button shows loading and is disabled while busy.
- Transitions 200ms ease-out on panels and tabs.
Commit: "R10: interactions".
```

---

## R11: Mobile and states

```
Task R11: check every page at 375px width.
- Columns stack under 768px. No horizontal scroll.
- Every page has an empty state, a loading state, and an error state.
- Fix any overflow or cramped buttons.
Commit: "R11: mobile and states".
```

---

## R12: Build and submit

```
Task R12: prepare the submission.
- Run "npm run build" and fix every error.
- Remove /design-check from the public build, or keep it behind a hidden route and note it in the README.
- Write README.md using docs/README_TEMPLATE.md.
- Take 4 screenshots for the README and save them in docs/screenshots/.
Commit: "R12: submission ready".
```

---

## Rules for every session
- One task per session. Name the task ID first.
- Run the build yourself before committing.
- If Kilo changes engine/ or config/, reject the change and restate the rule.
