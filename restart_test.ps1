# Reset de test/ (backend :8000 + frontend :3000)
# Uso: .\restart_test.ps1

$ErrorActionPreference = "SilentlyContinue"
$ROOT = Get-Location
$BACKEND_DIR = "$ROOT\test\backend"
$FRONTEND_DIR = "$ROOT\test\frontend"

function Kill-Port {
  param([int]$Port)
  $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
  if (-not $pids) {
    Write-Host "  :$Port libre"
    return
  }
  foreach ($pid in $pids) {
    Write-Host "  matando PID $pid en :$Port"
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "[1/3] Liberando puertos..."
Kill-Port 8000
Kill-Port 3000
Start-Sleep -Seconds 1

Write-Host "[2/3] Levantando backend (FastAPI :8000)..."
Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/c", "cd $BACKEND_DIR && python main.py"

Write-Host "[3/3] Levantando frontend (Next.js :3000)..."
Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/c", "cd $FRONTEND_DIR && npm run dev"

Write-Host ""
Write-Host "Listo. Dos ventanas nuevas abrieron con los logs."
Write-Host "  Backend  -> http://localhost:8000/docs"
Write-Host "  Frontend -> http://localhost:3000/comparar/isapres"
Write-Host ""
Write-Host "Para detener: cierra las 2 ventanas o re-corre .\restart_test.ps1"
