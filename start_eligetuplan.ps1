# ============================================================
# START ELIGETUPLAN — Inicia backend + tunnel con un solo click
# ============================================================
# Uso: hacer doble click en este archivo o ejecutar desde PowerShell:
#      .\start_eligetuplan.ps1
#
# Este script:
#   1. Inicia el backend FastAPI en localhost:8000
#   2. Inicia el tunnel de Cloudflare para api.elige-tuplan.cl
#   3. Muestra la URL del backend y el estado
#
# Presiona Ctrl+C en esta ventana para detener AMBOS procesos.
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  EligeTuPlan — Iniciando Backend + Tunnel" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Agregar cloudflared al PATH ---
$env:Path = "C:\Users\Hp;$env:Path"

# --- Verificar que cloudflared existe ---
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: cloudflared no encontrado." -ForegroundColor Red
    Write-Host "Descargalo de: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Verificar que python existe ---
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: python no encontrado." -ForegroundColor Red
    Write-Host "Instala Python 3.12+ desde https://python.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Variables de entorno para produccion ---
$env:SUPABASE_URL    = if ($env:SUPABASE_URL)    { $env:SUPABASE_URL }    else { Read-Host "Ingresa SUPABASE_URL" }
$env:SUPABASE_KEY    = if ($env:SUPABASE_KEY)    { $env:SUPABASE_KEY }    else { Read-Host "Ingresa SUPABASE_KEY" }
$env:ALLOWED_ORIGINS = if ($env:ALLOWED_ORIGINS) { $env:ALLOWED_ORIGINS } else {
    "https://elige-tuplan.cl,https://www.elige-tuplan.cl"
}

# --- Paths ---
$BackendDir   = "C:\Users\Hp\Documents\Eligetuplan\test\backend"
$TunnelConfig = "C:\Users\Hp\Documents\Eligetuplan\production\tunnel\config.yml"

# --- Iniciar backend ---
Write-Host "[1/2] Iniciando FastAPI backend en http://localhost:8000..." -ForegroundColor Green

$backendProcess = Start-Process -FilePath "python" `
    -ArgumentList "-B", "main.py" `
    -WorkingDirectory $BackendDir `
    -PassThru `
    -NoNewWindow:$false

Start-Sleep -Seconds 3

# Verificar que el backend esta corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   Backend: OK (" -ForegroundColor Green -NoNewline
        Write-Host "http://localhost:8000" -ForegroundColor Cyan -NoNewline
        Write-Host ")" -ForegroundColor Green
    }
} catch {
    Write-Host "   Backend: esperando..." -ForegroundColor Yellow
}

# --- Iniciar tunnel ---
Write-Host "[2/2] Iniciando Cloudflare Tunnel para api.elige-tuplan.cl..." -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  EligeTuPlan esta ONLINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  https://elige-tuplan.cl" -ForegroundColor Cyan
Write-Host "  API:       https://api.elige-tuplan.cl/api/v1/health" -ForegroundColor Cyan
Write-Host "  Local:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Presiona Ctrl+C para detener TODO" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Ejecutar tunnel en foreground (bloquea hasta Ctrl+C)
cloudflared tunnel --config $TunnelConfig run eligetuplan

# Si el tunnel se detiene, matar el backend tambien
Write-Host ""
Write-Host "Deteniendo backend..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
Write-Host "EligeTuPlan detenido." -ForegroundColor Yellow