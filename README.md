# Sinemic

Build with any AI. Keep the project's memory. Verify every change.

**Status: round 2 prototype.** This is a working prototype for a hackathon. It is not production software.

Live demo: <add your Vercel link>
Demo video: <add your video link>

## The problem
- AI-built projects lose context when you switch AI models or hit a free-tier limit.
- AI often says "done" or "tests pass" without evidence you can check.
- Basics like input validation, secrets handling and performance are often missing, because the builder does not know to ask.

## Who it is for
Students and early builders who use AI to build software and are not professional engineers.

## What Sinemic does
1. Reads your project and shows its structure (functions, imports, calls).
2. Builds a compact context pack for each task, so any AI model gets the right information.
3. Keeps a ledger of requirements, decisions and rejected options.
4. Proposes a change, shows the diff, and runs checks (type check, tests, secret scan) on a copy.
5. Marks a requirement "verified" only when the checks pass.
6. Switches to another free model when one is busy or out of quota.

## Import and export
- Import: you can bring in a public GitHub repository. Imported projects run **static checks only** — type check and secret scan. Tests are skipped because no code is executed.
- Export: once a patch set is approved, you can download the whole project as a zip, or download the unified diff as a `.diff` file.

## No accounts yet
There are no accounts. Projects are saved in this browser. Free-model limits are per-browser and reset if the browser's cookies are cleared. You can add your own OpenRouter key to raise limits.

## What is verified, and what is not
- A passing check is strong evidence, not proof of correctness.
- Checks that could not run are shown as skipped, never as passed.
- Dependency maps are precise for TypeScript. Python and Go are shown at the syntax level.

## Free model limits
Free models have per-user and per-model daily limits. You can also add your own OpenRouter key.

## Screenshots
Add 4 screenshots from docs/screenshots/.

## Run it locally
```bash
git clone <your repo URL>
cd sinemic
npm install
cp .env.example .env.local
# add your OPENROUTER_API_KEY to .env.local
npm run dev
```
Open http://localhost:3000.

## Tech stack
Next.js, TypeScript, Tailwind CSS, SQLite, OpenRouter (free models), TypeScript compiler API.

## Known limits
- Python and Go checks need those tools installed locally. The public demo runs TypeScript checks only.
- Free model quality varies.
- Demo data resets when the server restarts.
- No accounts yet; projects are saved in this browser.

## Roadmap
Production checklist, plain-language explain mode, checkpoints and rollback, more languages, skills, team features.

## Team
<Team name>, <members>
