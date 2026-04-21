param(
  [switch]$Install = $true,
  [switch]$ValidateEnv = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($Install) {
  npm install
}

if ($ValidateEnv) {
  node --env-file=.env.local scripts/validate-env.mjs
}

npm run typecheck
npm run lint
npm run build

Write-Host "✅ NearYou local setup completed."
