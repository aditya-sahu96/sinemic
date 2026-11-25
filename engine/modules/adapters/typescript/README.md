# modules/adapters/typescript

## Inputs
- projectPath: string

## Outputs
- LanguageAdapter with id "typescript": detect, extract, checks.

## Limits
- Requires tsconfig.json. Edges for calls are best-effort based on AST (resolved flag may be false).

## How to test
`npm test`, `npm run typecheck`.
