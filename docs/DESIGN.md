# DESIGN: Sinemic visual system

This file is the single source of truth for how the app looks. Kilo must follow it on every page. Fill in the blanks from your inspiration research (section 2) before the first Kilo session.

## 1. Brand
- Name: Sinemic
- One-line tagline: Build with any AI. Keep the project's memory. Verify every change.
- Tone: calm, clear, honest. Plain words. No hype.
- Audience: students and early builders who use AI to build software.

## 2. Inspiration research (fill in)

Save screenshots in `design/inspiration/` with short names, for example `01-landing-calm.png`.

For each inspiration, write one row. Borrow ideas, never copy someone else's logo, illustrations, text, or exact layout.

| File | What I like | What to borrow | What not to copy |
|---|---|---|---|
| 01-landing-calm.png | generous spacing, one big headline | hero layout, spacing | exact illustration style |
| (add more) | | | |

## 3. Design tokens (fill in, then copy into design/tokens.json)

Colors (hex, no alpha):
- Primary (brand): `#______`
- Primary hover: `#______`
- Accent (for success and highlights): `#______`
- Background: `#______`
- Surface (cards): `#______`
- Text primary: `#______`
- Text muted: `#______`
- Border: `#______`
- Danger (errors): `#______`
- Warning (skipped, quota): `#______`
- Success (passed): `#______`

Fonts (Google Fonts names):
- Headings: `______`
- Body: `______`
- Code: `______` (default: JetBrains Mono)

Scale:
- Border radius: 12px for cards, 8px for buttons and inputs
- Spacing unit: 4px, use 8, 16, 24, 32, 48
- Shadow for cards: soft, one layer
- Transition: 200ms ease-out

## 4. Components to build first (R1)
- Button: primary, secondary, ghost. Loading and disabled states.
- Card: surface color, border, radius, padding 24px.
- Badge: passed (success), failed (danger), skipped (warning), verified, implemented, proposed.
- Toast: success, error, info. Auto-dismiss after 5 seconds. Close button.
- Step indicator: five steps, current step highlighted, completed steps checked.
- Empty state: icon, one sentence, one action button.
- Input and textarea: clear focus ring in primary color.
- Diff view: added lines in success tint, removed lines in danger tint, monospace font.

## 5. Layout rules
- Max content width: 1200px on landing pages, full width in the workspace.
- Workspace: three columns on desktop (left 280px, centre flexible, right 360px). Stacks to one column under 768px.
- Header: 64px tall, logo text on the left, links on the right.
- Buttons: minimum touch target 40px.

## 6. Writing rules for UI text
- Short sentences. Active voice.
- Errors: say what happened, then what to do. Example: "Free daily limit reached for this model. Try another model, or add your own OpenRouter key."
- Never show raw JSON, stack traces, or key values.
- Never use the words "guaranteed", "flawless", or "zero errors".

## 7. Things Kilo must not do
- Do not use a color bar or accent stripe as decoration.
- Do not center body text. Center titles only.
- Do not use more than two font families.
- Do not add a new color outside the tokens.
- Do not copy inspiration screenshots into the app as images.
