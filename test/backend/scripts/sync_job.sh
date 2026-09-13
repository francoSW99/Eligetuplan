#!/bin/sh
# Entry point del Cloud Run Job "sync-data" (región southamerica-west1).
#
# Por qué existe: tu7.cl responde 200 con cuerpo vacío a las IPs de GitHub Actions,
# así que el sync semanal ya no puede correr en el runner. GitHub (sync-data.yml) sigue
# siendo el orquestador: lanza este job, lee de Cloud Logging las líneas SYNC_SUMMARY /
# SYNC_EXIT y hace el resumen, el issue y el flush de caché como antes.
#
# Env del job: SUPABASE_URL (env var) y SUPABASE_SERVICE_ROLE_KEY (Secret Manager).
#
# Reintento: hasta 3 veces SOLO si el código es 1 (error real, p.ej. tu7 lento/caído).
# Código 0 (ok) y 2 (guardarraíl intencional) NO se reintentan.

cd /app || exit 1

attempts=3
code=1
i=1
while [ "$i" -le "$attempts" ]; do
  python scripts/sync_all.py > /tmp/summary.json
  code=$?
  echo "intento $i/$attempts → código $code" >&2
  if [ "$code" != "1" ]; then
    break
  fi
  if [ "$i" -lt "$attempts" ]; then
    echo "Código 1 (error, probable tu7.cl caído/lento). Reintento en 90s…" >&2
    sleep 90
  fi
  i=$((i + 1))
done

# Una sola línea cada una → fáciles de filtrar en Cloud Logging.
echo "SYNC_SUMMARY $(tr -d '\n' < /tmp/summary.json)"
echo "SYNC_EXIT $code"
exit "$code"
