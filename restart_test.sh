#!/usr/bin/env bash
# Reset de test/ (backend :8000 + frontend :3000)
# Uso: ./restart_test.sh

set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/test/backend"
FRONTEND_DIR="$ROOT/test/frontend"

kill_port() {
  local port=$1
  local pids
  pids=$(netstat -ano | grep -E ":${port}[[:space:]]+.*LISTENING" | awk '{print $NF}' | sort -u)
  if [ -z "$pids" ]; then
    echo "  :${port} libre"
    return
  fi
  for pid in $pids; do
    echo "  matando PID $pid en :${port}"
    taskkill //F //PID "$pid" >/dev/null 2>&1 || true
  done
}

echo "[1/3] Liberando puertos..."
kill_port 8000
kill_port 3000
sleep 1

echo "[2/3] Levantando backend (FastAPI :8000)..."
cd "$BACKEND_DIR"
start "eligetuplan-backend" cmd //c "python main.py"

echo "[3/3] Levantando frontend (Next.js :3000)..."
cd "$FRONTEND_DIR"
start "eligetuplan-frontend" cmd //c "npm run dev"

echo ""
echo "Listo. Dos ventanas nuevas abrieron con los logs."
echo "  Backend  -> http://localhost:8000/docs"
echo "  Frontend -> http://localhost:3000/comparar/isapres"
echo ""
echo "Para detener: cierra las 2 ventanas o re-corre ./restart_test.sh"
