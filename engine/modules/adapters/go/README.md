# modules/adapters/go

## Inputs
- projectPath: string

## Outputs
- LanguageAdapter with id "go": detect, extract, checks.

## Limits
- Requires go toolchain. Edges for calls resolved: false. Imports resolved only for packages inside module.

## How to test
`npm test`, `npm run typecheck`. If go is missing, extract tests are skipped.
