# ============================================================
# Eligetuplan — Guía de Deploy a Producción
# ============================================================
# Arquitectura:
#   - Frontend:  Vercel            → elige-tuplan.cl
#   - Backend:   Google Cloud Run  → api.elige-tuplan.cl (Docker + auto-deploy)
#   - Database:  Supabase          → ya en la nube
#
# Costo mensual: ~$1.250 CLP (solo dominio .cl)
# Vercel: gratis. Cloud Run: gratis hasta 2M peticiones/mes. Supabase: gratis.
# ============================================================

## 🔄 Cómo funciona el deploy (importante)

**Todo se dispara con `git push origin main`:**

1. Tú haces cambios en `test/` (desarrollo local con QA)
2. Cuando un feature está validado, promueves: copias archivos de `test/` → `production/`
3. Commit + push a GitHub
4. GitHub dispara **dos webhooks en paralelo**:
   - **Vercel** detecta cambios en `production/frontend/` → corre `npm run build` → publica a Vercel CDN
   - **Cloud Run** detecta cambios en `production/backend/` → rebuilda imagen Docker → reemplaza el servicio activo
5. Ambos quedan live en ~1–2 minutos sin intervención manual

**Reglas:**
- Nunca editar `production/` directamente. Siempre `test/` primero, validar, luego promover.
- Si solo cambia `production/frontend/`, Vercel deploya pero Cloud Run no rebuilda (no toca el backend).
- Si solo cambia `production/backend/`, Cloud Run rebuilda Docker pero Vercel sirve el frontend cacheado.
- El `.env` de cada entorno vive solo en su servidor respectivo (Vercel env vars + Cloud Run env vars), nunca en GitHub.

## PASO 1 — Comprar dominio .cl

1. Ir a https://www.nic.cl o https://puntodenombre.cl
2. Buscar "eligetuplan" → comprar
3. Costo: ~$15.000 CLP/año

## PASO 2 — Backend en Google Cloud Run (auto-deploy desde GitHub)

El backend vive como un servicio Cloud Run, conectado al repo de GitHub. Cada `git push` que toque archivos en `production/backend/` dispara un rebuild automático del contenedor Docker.

### Setup inicial (una sola vez)

1. Crear proyecto en https://console.cloud.google.com (cuenta gratis, requiere tarjeta para verificación)
2. Buscar **Cloud Run** en el buscador superior → "Crear Servicio"
3. Seleccionar **"Desplegar continuamente desde un repositorio"** (no "Implementar imagen de contenedor existente")
4. Autorizar el acceso a GitHub → seleccionar repo `francoSW99/Eligetuplan`
5. Configurar la fuente:
   - **Rama**: `main`
   - **Tipo de compilación**: Dockerfile
   - **Directorio de origen**: `/production/backend`
6. Configurar el servicio:
   - **Región**: `southamerica-west1` (Santiago) o `us-east1` (más cercanos a Chile)
   - **CPU asignada**: solo durante peticiones (escalado a cero)
   - **Autenticación**: ⚠️ marcar **"Permitir invocaciones sin autenticar"** (crítico — sin esto la API requiere token de GCP)
7. **Variables de entorno** (pestaña Variables):
   - `SUPABASE_URL` = (URL de proyecto Supabase de PROD)
   - `SUPABASE_KEY` = (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (solo si tu backend la necesita — bypassea RLS)
   - `UF_VALUE_CLP` = `40374` (o el valor actualizado)
   - `SIS_PERIOD` = `202602`
   - **NUNCA** poner estas en GitHub. Cloud Run las inyecta al contenedor en runtime.
8. Click **Crear** — la primera build tarda ~3–5 min. Te dará una URL tipo `https://eligetuplan-xxxxx-rj.a.run.app`

### Cada deploy posterior

Automático. Solo `git push origin main` → Cloud Run detecta cambios en `production/backend/`, rebuilda el Docker, lo publica. Ver progreso en Cloud Run → Revisiones.

### Para verificar el deploy

```powershell
curl https://api.elige-tuplan.cl/api/v1/health
# Esperado: {"status":"ok"}
```

O en la pestaña **Revisiones** del servicio Cloud Run: la nueva revisión aparece como activa cuando termina.

## PASO 3 — Dominio + DNS

1. Comprar `elige-tuplan.cl` en https://nic.cl (~$15.000 CLP/año)
2. Configurar registros DNS en NIC Chile (o en Cloudflare si decides usarlo como proxy):

| Type  | Name | Content                                | Notas                          |
|-------|------|----------------------------------------|--------------------------------|
| CNAME | @    | cname.vercel-dns.com                   | apex → Vercel (frontend)       |
| CNAME | www  | cname.vercel-dns.com                   | www → Vercel                   |
| CNAME | api  | (URL custom del dominio de Cloud Run)  | api → Cloud Run (backend)      |

Para el subdominio `api`, en Cloud Run ir a **Dominios personalizados** → agregar `api.elige-tuplan.cl` → te da el CNAME que va en el DNS.

Esperar propagación DNS (5–30 min). Vercel y Cloud Run generan SSL automáticamente (Let's Encrypt).

## PASO 4 — Deploy Frontend en Vercel (setup inicial)

1. Ir a https://vercel.com/dashboard
2. Click **Add New Project** → importar repo `francoSW99/Eligetuplan`
3. **Root Directory**: `production/frontend`
4. Framework Preset: Next.js (auto-detectado)
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api.elige-tuplan.cl`
6. Click **Deploy**
7. Settings → Domains → agregar `elige-tuplan.cl` y `www.elige-tuplan.cl`

### Cada deploy posterior

Automático. `git push origin main` → Vercel detecta cambios en `production/frontend/` → corre `npm run build` → publica. Vercel también previews automáticamente cada PR si lo configuras.

## PASO 5 — Verificación end-to-end

- https://elige-tuplan.cl → Frontend (Vercel)
- https://api.elige-tuplan.cl/api/v1/health → `{"status":"ok"}`
- https://elige-tuplan.cl/comparar/isapres → Lista planes desde Supabase
- https://elige-tuplan.cl/tu-mejor-plan → Wizard funcional

## NOTAS IMPORTANTES

- **Vercel y Cloud Run son independientes**. Si solo cambia el frontend, Cloud Run no se rebuilda. Si solo cambia el backend, Vercel solo sirve la versión cacheada.
- **Secrets nunca van a GitHub**. Vercel: `Settings → Environment Variables`. Cloud Run: `Variables y secretos` en la configuración del servicio.
- **CORS**: el backend FastAPI debe tener `https://elige-tuplan.cl` en `allow_origins`.
- **Costos**: Cloud Run escala a cero cuando no hay tráfico (no cobra). Vercel free tier cubre 100GB de bandwidth. Configurar **Alertas de Presupuesto** en GCP Billing para evitar sorpresas si hay un loop infinito o ataque DDoS.
- **Logs**: errores de frontend → Vercel → Deployments → Function logs. Errores de backend → Cloud Run → Logs.