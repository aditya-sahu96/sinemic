# modules/model

## Inputs
- pack, task, providers (tried in order)

## Outputs
- ModelResult

## Limits
- OpenAI-compatible chat completions via fetch. Fallback on quota/network. No key logged.

## How to test
`npm test`, `npm run typecheck`.
