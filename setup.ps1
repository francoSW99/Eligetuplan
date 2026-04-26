# setup.ps1 — Iniciar sesion de trabajo en Eligetuplan
#
# Uso: .\setup.ps1   (al empezar a trabajar)
#
# Que hace:
#   1. Detiene procesos zombie en puertos 8000/3000 (si hay)
#   2. Limpia __pycache__ y levanta backend con -B (sin bytecode stale)
#   3. Valida que el schema del backend este actualizado
#   4. Levanta el frontend
#   5. Abre VS Code en el proyecto
#
# Al terminar el dia: .\restart_test.ps1 -Stop

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Levantar / reiniciar servidores (restart_test.ps1 ya tiene:
# - Kill agresivo de zombies, -B flag, PYTHONDONTWRITEBYTECODE, validacion de schema)
& "$ROOT\restart_test.ps1"

# Abrir VS Code en el proyecto
Write-Host ""
Write-Host "[Abriendo VS Code]" -ForegroundColor Cyan
& code $ROOT
Write-Host "  VS Code abierto en $ROOT" -ForegroundColor Green
Write-Host ""
Write-Host "  Tip: al terminar el dia corre  .\restart_test.ps1 -Stop" -ForegroundColor DarkGray
Write-Host "       para liberar los procesos en background." -ForegroundColor DarkGray
Write-Host ""