# ============================================================
# deploy_to_prod.ps1
# ------------------------------------------------------------
# Promueve cambios de test/ → production/ con validación previa
# y push automatico a origin/main (que dispara Vercel + GCP).
#
# Uso:
#   .\deploy_to_prod.ps1 -Message "feat: descripcion"
#   .\deploy_to_prod.ps1 -Message "fix: bug X" -SkipBuild
#   .\deploy_to_prod.ps1 -Message "..." -NoPush
#   .\deploy_to_prod.ps1                      (modo interactivo)
# ============================================================

param(
  [string]$Message,
  [switch]$SkipBuild,
  [switch]$NoPush
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Write-Step($text) { Write-Host ""; Write-Host "==> $text" -ForegroundColor Cyan }
function Write-Ok($text)   { Write-Host "  [OK] $text" -ForegroundColor Green }
function Write-Warn($text) { Write-Host "  [!] $text" -ForegroundColor Yellow }
function Write-Err($text)  { Write-Host "  [X] $text" -ForegroundColor Red }

# 1. Verificar working tree limpio en production/ (queremos solo cambios en test/)
Write-Step "Verificando estado del repo"
$prodChanges = git diff --name-only -- production/
if ($prodChanges) {
  Write-Err "production/ ya tiene cambios sin commit. Resuelve esto antes de promover:"
  $prodChanges | ForEach-Object { Write-Host "    $_" }
  exit 1
}

# 2. Listar cambios en test/ (tracked modificados + archivos NUEVOS untracked)
#    git diff solo ve archivos ya rastreados; los nuevos se listan con ls-files --others.
$testTracked   = git diff --name-only HEAD -- test/
$testUntracked = git ls-files --others --exclude-standard -- test/
$testChanges   = @($testTracked) + @($testUntracked) | Where-Object { $_ } | Select-Object -Unique
if (-not $testChanges) {
  Write-Err "No hay cambios en test/ para promover."
  exit 1
}

Write-Ok ("{0} archivo(s) modificado(s) en test/:" -f $testChanges.Count)
$testChanges | ForEach-Object { Write-Host "    $_" }

# 3. Validaciones (TS + build) en test/frontend, solo si toca el frontend
$frontendChanges = $testChanges | Where-Object { $_ -like 'test/frontend/*' }
if ($frontendChanges -and -not $SkipBuild) {
  Write-Step "Validando test/frontend (tsc + build)"
  Push-Location test/frontend
  try {
    # Usar binarios locales directamente (npx desde PS es a veces inestable)
    $tscBin = "node_modules\.bin\tsc.cmd"
    if (-not (Test-Path $tscBin)) { Write-Err "No se encontro $tscBin. Corre 'npm install' en test/frontend."; exit 1 }
    & $tscBin --noEmit --skipLibCheck
    if ($LASTEXITCODE -ne 0) { Write-Err "TypeScript fallo. Aborto."; exit 1 }
    Write-Ok "TypeScript limpio"

    & npm.cmd run build | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Err "next build fallo. Aborto."; exit 1 }
    Write-Ok "Build de Next.js OK"
  } finally {
    Pop-Location
  }
} elseif ($SkipBuild) {
  Write-Warn "Saltando validaciones (-SkipBuild)"
}

# 4. Confirmar antes de copiar
if (-not $Message) {
  Write-Host ""
  $Message = Read-Host "Mensaje de commit para test/"
  if (-not $Message) { Write-Err "Mensaje vacio. Aborto."; exit 1 }
}

# 5. Copiar archivos test/ → production/
Write-Step "Copiando archivos a production/"
foreach ($f in $testChanges) {
  $dst = $f -replace '^test/', 'production/'
  $dstDir = Split-Path $dst -Parent
  if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
  Copy-Item $f $dst -Force
  Write-Host "    $f -> $dst"
}
Write-Ok ("{0} archivo(s) copiado(s)" -f $testChanges.Count)

# 6. Validar build de production si toca frontend
$prodFrontChanges = $frontendChanges | ForEach-Object { $_ -replace '^test/', 'production/' }
if ($prodFrontChanges -and -not $SkipBuild) {
  Write-Step "Validando production/frontend (build)"
  Push-Location production/frontend
  try {
    # Instalar deps por si package.json cambio (ej: dependencia nueva). Idempotente.
    & npm.cmd install | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Err "npm install en production fallo. Aborto."; exit 1 }

    & npm.cmd run build | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Err "Build de production fallo. Revisa el estado y revierte si es necesario."; exit 1 }
    Write-Ok "Build de production OK"
  } finally {
    Pop-Location
  }
}

# 7. Commits: test/ con el mensaje del usuario, production/ con mensaje estandar
Write-Step "Creando commits"
git add test/ | Out-Null
git commit -m $Message | Out-Null
$testSha = (git rev-parse --short HEAD).Trim()
Write-Ok "Commit test/: $testSha  $Message"

git add production/ | Out-Null
git commit -m "deploy: promocion de cambios de test a produccion" | Out-Null
$prodSha = (git rev-parse --short HEAD).Trim()
Write-Ok "Commit prod : $prodSha  deploy: promocion de cambios de test a produccion"

# 8. Push (a menos que -NoPush)
if ($NoPush) {
  Write-Warn "No push (-NoPush). Para deployar ejecuta: git push origin main"
  exit 0
}

Write-Step "Pusheando a origin/main"
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Err "git push fallo."; exit 1 }
Write-Ok "Push completado."

Write-Host ""
Write-Host "Deploy en progreso:" -ForegroundColor Green
if ($prodFrontChanges) {
  Write-Host "  Frontend  -> Vercel rebuild   (~1-2 min)  https://vercel.com/dashboard"
}
$prodBackChanges = $testChanges | Where-Object { $_ -like 'test/backend/*' }
if ($prodBackChanges) {
  Write-Host "  Backend   -> Cloud Run rebuild (~3-5 min) https://console.cloud.google.com/run"
}
Write-Host ""
