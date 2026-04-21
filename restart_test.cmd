@echo off
REM Reset de test/ (backend :8000 + frontend :3000)
REM Uso: restart_test.cmd

setlocal enabledelayedexpansion

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
  echo  matando PID %%a en :8000
  taskkill //F //PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
  echo  matando PID %%a en :3000
  taskkill //F //PID %%a >nul 2>&1
)

timeout /t 1 /nobreak >nul

echo.
echo [2/3] Levantando backend (FastAPI :8000)...
start "eligetuplan-backend" cmd /k "cd /d %cd%\test\backend && python main.py"

echo [3/3] Levantando frontend (Next.js :3000)...
start "eligetuplan-frontend" cmd /k "cd /d %cd%\test\frontend && npm run dev"

echo.
echo Listo. Dos ventanas nuevas abrieron con los logs.
echo   Backend  --^> http://localhost:8000/docs
echo   Frontend --^> http://localhost:3000/comparar/isapres
echo.
echo Para detener: cierra las 2 ventanas o re-corre restart_test.cmd
