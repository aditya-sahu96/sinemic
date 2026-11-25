# modules/adapters/python

## Inputs
- projectPath: string

## Outputs
- LanguageAdapter with id "python": detect, extract, checks.

## Limits
- Requires python. Edges for calls use resolved: false. Imports resolved only when target file exists.

## How to test
`npm test`, `npm run typecheck`. If python3 is missing, extract tests are skipped.
