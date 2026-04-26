# restart_test.ps1 — Reinicia backend y frontend en background, sin VS Code
#
# Uso:
#   .\restart_test.ps1            # detiene y relanza ambos servidores
#   .\restart_test.ps1 -Stop      # solo detiene
#   .\restart_test.ps1 -Status    # muestra que esta corriendo

param(
    [switch]$Stop,
    [switch]$Status
)

$ErrorActionPreference = "SilentlyContinue"
$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = "$ROOT\test\backend"
$FRONTEND = "$ROOT\test\frontend"
$LOGS     = "$ROOT\logs"
$PYTHON   = "C:\Users\Hp\AppData\Local\Programs\Python\Python313\python.exe"

# Campos criticos del schema que SIEMPRE deben estar presentes tras arrancar.
# Si falta alguno, el backend esta sirviendo codigo stale.
$SCHEMA_REQUIRED_FIELDS = @("preference", "current_price_uf", "current_hospital_coverage", "current_ambulatory_coverage")

# ----- helpers de output ---------------------------------------------------

function Write-Step ([string]$Msg) { Write-Host ""; Write-Host "[$Msg]" -ForegroundColor Cyan }
function Write-OK   ([string]$Msg) { Write-Host "  $Msg" -ForegroundColor Green }
function Write-Warn ([string]$Msg) { Write-Host "  $Msg" -ForegroundColor Yellow }
function Write-Err  ([string]$Msg) { Write-Host "  $Msg" -ForegroundColor Red }
function Write-Hint ([string]$Msg) { Write-Host "  $Msg" -ForegroundColor DarkGray }

# ----- helpers de procesos -------------------------------------------------

function Get-PortPID ([int]$Port) {
    Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
}

function Stop-Port ([int]$Port) {
    $pids = Get-PortPID $Port
    if (-not $pids) { return $false }
    foreach ($p in $pids) {
        & taskkill.exe /F /T /PID $p 2>&1 | Out-Null
    }
    Start-Sleep -Milliseconds 1500
    $remaining = Get-PortPID $Port
    if ($remaining) {
        foreach ($p in $remaining) {
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 500
    }
    $stillThere = Get-PortPID $Port
    if ($stillThere) {
        foreach ($p in $stillThere) {
            & taskkill.exe /F /T /PID $p 2>&1 | Out-Null
        }
        Start-Sleep -Milliseconds 500
    }
    return $true
}

function Wait-Port ([int]$Port, [int]$TimeoutSec) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Get-PortPID $Port) { return $true }
        Write-Host "." -NoNewline
        Start-Sleep -Milliseconds 700
    }
    return $false
}

function Assert-Schema {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:8000/openapi.json" -TimeoutSec 5 -ErrorAction Stop
        $fields = $resp.components.schemas.MatchPlanRequest.properties
        $missing = @()
        foreach ($f in $SCHEMA_REQUIRED_FIELDS) {
            if (-not $fields.$f) {
                $missing += $f
            }
        }
        if ($missing.Count -gt 0) {
            Write-Err ("Schema STALE - campos faltantes: " + ($missing -join ', '))
            Write-Err "El backend esta sirviendo codigo viejo. Reinicia con .\restart_test.ps1"
            return $false
        }
        Write-OK "Schema OK - campos criticos presentes"
        return $true
    } catch {
        Write-Err ("No se pudo verificar schema: " + $_.Exception.Message)
        return $false
    }
}

# ===========================================================================
# Modo: -Status
# ===========================================================================
if ($Status) {
    Write-Host ""
    Write-Host "Estado entorno TEST" -ForegroundColor Cyan
    $bePIDs = Get-PortPID 8000
    $fePIDs = Get-PortPID 3000
    if ($bePIDs) { Write-OK   "Backend  :8000 corriendo (PID $($bePIDs -join ','))" }
    else         { Write-Warn "Backend  :8000 detenido" }
    if ($fePIDs) { Write-OK   "Frontend :3000 corriendo (PID $($fePIDs -join ','))" }
    else         { Write-Warn "Frontend :3000 detenido" }
    Write-Host ""
    return
}

# ===========================================================================
# Validar entorno
# ===========================================================================
if (-not (Test-Path $PYTHON)) {
    Write-Err "No se encuentra Python en: $PYTHON"
    exit 1
}
if (-not (Test-Path "$FRONTEND\package.json")) {
    Write-Err "No se encuentra package.json en: $FRONTEND"
    exit 1
}

# ===========================================================================
# Detener — matar TODOS los procesos en los puertos (incluidos zombies)
# ===========================================================================
Write-Step "Deteniendo servidores"
$wasBE = Stop-Port 8000
$wasFE = Stop-Port 3000
if ($wasBE) { Write-OK "Backend  :8000 detenido" } else { Write-Hint "Backend  :8000 ya estaba detenido" }
if ($wasFE) { Write-OK "Frontend :3000 detenido" } else { Write-Hint "Frontend :3000 ya estaba detenido" }

# Seguridad extra: matar CUALQUIER python.exe que siga en puerto 8000
Start-Sleep -Milliseconds 500
$zombies = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($zombies) {
    $zombiePids = $zombies | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
    Write-Warn "Matando $($zombiePids.Count) proceso(s) zombie en :8000"
    foreach ($zp in $zombiePids) {
        Stop-Process -Id $zp -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
}

if ($Stop) {
    Write-Host ""
    Write-OK "Listo. Servidores detenidos."
    Write-Host ""
    return
}

# ===========================================================================
# Preparar carpeta de logs + limpiar bytecode stale
# ===========================================================================
if (-not (Test-Path $LOGS)) {
    New-Item -ItemType Directory -Path $LOGS | Out-Null
}
$BE_LOG = "$LOGS\backend.log"
$FE_LOG = "$LOGS\frontend.log"

# Eliminar __pycache__ recursivamente en el backend para evitar .pyc stale
Remove-Item -Recurse -Force "$BACKEND\__pycache__" -ErrorAction SilentlyContinue

# ===========================================================================
# Lanzar backend (proceso oculto, log a archivo)
# -B = no escribir .pyc (PYTHONDONTWRITEBYTECODE)
# -u = unbuffered, evita que los logs queden atascados al redirigir
# ===========================================================================
Write-Step "Levantando backend (FastAPI :8000)"
$env:PYTHONDONTWRITEBYTECODE = "1"

Start-Process -FilePath $PYTHON `
    -ArgumentList "-B", "-u", "main.py" `
    -WorkingDirectory $BACKEND `
    -WindowStyle Hidden `
    -RedirectStandardOutput $BE_LOG `
    -RedirectStandardError "$BE_LOG.err" | Out-Null

Write-Host -NoNewline "  esperando "
if (Wait-Port 8000 60) {
    Write-Host ""
    Write-OK "Backend listo  -> http://localhost:8000/docs"
    Assert-Schema
} else {
    Write-Host ""
    Write-Err "Backend no respondio en 60s"
    Write-Hint "Revisa los logs (uvicorn escribe a stderr):"
    Write-Hint "  Get-Content `"$BE_LOG.err`" -Tail 50"
}

# ===========================================================================
# Lanzar frontend (proceso oculto, log a archivo)
# ===========================================================================
Write-Step "Levantando frontend (Next.js :3000)"
$NEXT_BIN = "$FRONTEND\node_modules\next\dist\bin\next"
if (-not (Test-Path $NEXT_BIN)) {
    Write-Err "No se encuentra Next: $NEXT_BIN"
    Write-Hint "Corre primero: cd test\frontend; npm install"
    exit 1
}
Start-Process -FilePath "node" `
    -ArgumentList $NEXT_BIN, "dev" `
    -WorkingDirectory $FRONTEND `
    -WindowStyle Hidden `
    -RedirectStandardOutput $FE_LOG `
    -RedirectStandardError "$FE_LOG.err" | Out-Null

Write-Host -NoNewline "  esperando "
if (Wait-Port 3000 90) {
    Write-Host ""
    Write-OK "Frontend listo -> http://localhost:3000"
} else {
    Write-Host ""
    Write-Err "Frontend no respondio en 90s"
    Write-Hint "Revisa: Get-Content `"$FE_LOG`" -Tail 50"
    Write-Hint "        Get-Content `"$FE_LOG.err`" -Tail 50"
}

# ===========================================================================
# Resumen
# ===========================================================================
Write-Step "Listo"
Write-Host "  Backend  -> http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:3000"      -ForegroundColor Green
Write-Host ""
Write-Hint "Logs en vivo (en otra terminal):"
Write-Hint "  Get-Content `"$BE_LOG.err`" -Wait -Tail 30   (backend, uvicorn usa stderr)"
Write-Hint "  Get-Content `"$FE_LOG`"     -Wait -Tail 30   (frontend)"
Write-Host ""
Write-Hint "Otros comandos:"
Write-Hint "  .\restart_test.ps1 -Status    (ver estado)"
Write-Hint "  .\restart_test.ps1 -Stop      (detener todo)"
Write-Host ""