# modules/adapters

## Inputs
- id: LanguageId

## Outputs
- getAdapter(id): LanguageAdapter for typescript/javascript/python/go.
- buildGraph(language, graph): SymbolGraph.

## Limits
- Unknown id throws.

## How to test
`npm test`, `npm run typecheck`.
