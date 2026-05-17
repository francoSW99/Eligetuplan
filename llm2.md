# Incidente: Backend caído — 12 de mayo 2026
## Síntoma
https://www.elige-tuplan.cl/comparar/isapres mostraba:
"Error al cargar los planes — No se pudo conectar con el servidor. 
Verifica que el backend este corriendo en el puerto 8000."
## Diagnóstico completo
### Problema 1: api.elige-tuplan.cl devuelve 404 (DNS/CNAME roto)
- Evidencia: curl directo a Cloud Run = 200 OK, curl a api.elige-tuplan.cl = 404
- Causa raíz: CNAME apuntaba al Cloudflare Tunnel (eliminado), 
  ahora apunta a Cloud Run pero con proxy naranja — Cloudflare intercepta 
  y Cloud Run no reconoce el Host header
- Solución: Domain mapping en Cloud Run + CNAME DNS only (gris)
- Estado: Pendiente
### Problema 2: NEXT_PUBLIC_API_URL no configurada en Vercel
- Evidencia: production/frontend/lib/api.ts:1 usa fallback "http://localhost:8000"
- Causa raíz: No existe .env.local ni variable en Vercel
- Estado: Pendiente
### Problema 3: Cloud Run crasheaba con 512Mi (resuelto parcialmente)
- Evidencia: Logs mostraban "The request was aborted — no available instance"
- Causa raíz: 7 caches en startup exceden 512Mi RAM → OOM kill
- Resolución manual: memory=1Gi, min-instances=1
- PENDIENTE: workflow todavía dice 512Mi/min-instances=0 — próximo deploy lo revierte
### Problema 4: ALLOWED_ORIGINS con placeholder
- Evidencia: Cloud Run env var incluía "tu-proyecto.vercel.app"
- Resolución: gcloud update con ^|^ separator — parcialmente corregido
- PENDIENTE: GitHub secret ALLOWED_ORIGINS aún puede tener el placeholder
### Problemas menores
- Duplicate /api/v1/prestadores endpoint (dead code)
- .env.example producción falta SUPABASE_SERVICE_ROLE_KEY y SIS_PERIOD
- Archivos de tunnel obsoletos
- Documentación desactualizada (ARCHITECTURE.md, CLAUDE.md)
## Acciones ya ejecutadas
1. Billing reactivado en GCP ✓
2. Cloud Run memory → 1Gi ✓  
3. Cloud Run min-instances → 1 ✓
4. Cloudflare Tunnel eliminado ✓
5. CNAME api → Cloud Run URL (con proxy naranja) ✓
6. ALLOWED_ORIGINS corregido en Cloud Run ✓
7. gcloud cloudflared process detenido localmente ✓
## Acciones pendientes
[Tabla con FASE 1-6, dependencias, responsabilidad, estado]
## Plan detallado FASE 1: Domain mapping en Cloud Run
[Paso 1-6 con comandos exactos y posibles outcomes]
## Arquitectura anterior vs nueva
[Diagramas de flujo antes/después]
## Archivos afectados y cambios necesarios
[Lista de archivos a modificar/eliminar]
## Costos estimados Cloud Run
[Tabla con free tier y costo estimado mensual]