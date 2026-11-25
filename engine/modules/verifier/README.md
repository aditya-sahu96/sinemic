# modules/verifier

## Inputs
- projectPath, patches, workDir, checks

## Outputs
- applyPatches returns patched copy path; verify returns VerifyResult; secretScan returns CheckResult.

## Limits
- verify runs checks in given projectPath (should be patched copy). Never modifies original.

## How to test
`npm test`, `npm run typecheck`.
