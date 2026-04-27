# ============================================================
# START PRODUCTION — Backend + Cloudflare Tunnel
# ============================================================
# Run this script to start the backend and expose it via
# api.elige-tuplan.cl using Cloudflare Tunnel.
#
# PREREQUISITES:
#   1. Python 3.12+ installed
#   2. cloudflared installed (winget install Cloudflare.cloudflared)
#   3. Tunnel created: cloudflared tunnel create eligetuplan
#   4. DNS configured: cloudflared tunnel route dns eligetuplan api.elige-tuplan.cl
#   5. Credentials file saved to /etc/cloudflared/eligetuplan.json
#      (on Windows: C:\Users\<you>\.cloudflared\eligetuplan.json)
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Eligetuplan — Production Backend + Tunnel" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Path resolution ---
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$BackendDir  = Join-Path $ProjectRoot "production" "backend"

# --- Start FastAPI backend ---
Write-Host "[1/2] Starting FastAPI backend on port 8000..." -ForegroundColor Green

$env:SUPABASE_URL    = if ($env:SUPABASE_URL)    { $env:SUPABASE_URL }    else { Read-Host "Enter SUPABASE_URL" }
$env:SUPABASE_KEY    = if ($env:SUPABASE_KEY)    { $env:SUPABASE_KEY }    else { Read-Host "Enter SUPABASE_KEY" }
$env:ALLOWED_ORIGINS = if ($env:ALLOWED_ORIGINS) { $env:ALLOWED_ORIGINS } else {
    "https://elige-tuplan.cl,https://www.elige-tuplan.cl"
}

Start-Process -FilePath "python" `
              -ArgumentList "-B", "$BackendDir\main.py" `
              -WorkingDirectory $BackendDir `
              -NoNewWindow:$false

Start-Sleep -Seconds 3

# --- Start Cloudflare Tunnel ---
Write-Host "[2/2] Starting Cloudflare Tunnel for api.elige-tuplan.cl..." -ForegroundColor Green

# Check if cloudflared is installed
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "ERROR: cloudflared is not installed." -ForegroundColor Red
    Write-Host "Install it with: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
    Write-Host "Or download from: https://developers.cloudflare.com/cloudflare-one/connections/network-apps/all-com-platforms/" -ForegroundColor Yellow
    exit 1
}

# Check if tunnel config exists
$ConfigPath = Join-Path $ProjectRoot "production" "tunnel" "config.yml"
if (-not (Test-Path $ConfigPath)) {
    Write-Host ""
    Write-Host "ERROR: Tunnel config not found at $ConfigPath" -ForegroundColor Red
    exit 1
}

cloudflared tunnel --config $ConfigPath run eligetuplan

Write-Host ""
Write-Host "Backend and tunnel stopped." -ForegroundColor Yellow