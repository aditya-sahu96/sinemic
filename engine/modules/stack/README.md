# modules/stack

## Inputs
- `projectPath: string` - absolute or relative path to a project root.

## Outputs
- `StackInfo` with `languages`, `primaryLanguage`, `framework`, `manifests`, `confidence`.

## Detection rules
- Manifests only: `package.json`, `pyproject.toml`, `requirements.txt`, `setup.py`, `go.mod`.
- `package.json` => typescript if `tsconfig.json` or any `.ts`/`.tsx` file exists, else javascript.
- Python manifests => python.
- `go.mod` => go.
- Framework: nextjs (package.json depends on "next"), django (requirements/pyproject mention django), gin (go.mod mentions gin-gonic/gin), else null.
- Confidence: high (manifest + matching source files), medium (manifest only), low (none).

## Limits
- Detection is manifest-based; no source parsing. Confidence reflects presence of source files only.

## How to test
`npm test` (vitest) and `npm run typecheck`.
