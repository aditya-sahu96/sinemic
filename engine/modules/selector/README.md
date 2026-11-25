# modules/selector

## Inputs
- graph: SymbolGraph
- taskTargets: string[] (file paths or symbol ids)
- maxSymbols: number (default 25)

## Outputs
- Selection with symbols, callers, reasons, dropped.

## Limits
- Ranking: targets, direct neighbours, then indirect.

## How to test
`npm test`, `npm run typecheck`.
