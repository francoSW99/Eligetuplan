# EligetuPlan — Arquitectura Completa (v2.0)

---

## Propósito

Plataforma B2C para comparar **+1.800 planes de Isapre** en Chile. 100% gratuito. 3 flujos principales:

1. **Catálogo** (`/comparar/isapres`) — filtros avanzados sobre todos los planes
2. **Wizard "Tu Mejor Plan"** (`/tu-mejor-plan`) — Typeform de 3 pasos con scoring multi-objetivo
3. **Captura de leads** (`/buscar`) — formulario → Google Sheets

---

## Arquitectura Actual (Producción)

```
                              ┌─────────────────────────────┐
                              │     Cloudflare DNS        │
                              │   elige-tuplan.cl ────────┼──► Vercel (Frontend)
                              │   www.elige-tuplan.cl ───┤
                              │   api.elige-tuplan.cl ───┼──► Cloudflare Tunnel
                              └─────────────────────────────┘              │
                                                                         │
                                                      ┌────────────────┘
                                                      ▼
                                         ┌────────────────────────┐
                                         │  Tu PC (Local)        │
                                         │  FastAPI :8000        │
                                         │  cloudflared tunnel   │
                                         └────────────────────────┘
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │  Supabase (PostgreSQL) │
                                         │  (cloud, siempre on)   │
                                         └────────────────────────┘
```

| Componente | Hospedaje | Estado |
|---|---|---|
| **Frontend** | Vercel | ✅ Siempre online |
| **Backend API** | Tu PC + Cloudflare Tunnel | ⚠️ Solo cuando el PC está encendido |
| **Base de datos** | Supabase | ✅ Siempre online |
| **Dominio DNS** | Cloudflare | ✅ Siempre online |
| **Código fuente** | GitHub | ✅ Siempre seguro |

---

## Stack técnico

| Capa | Tecnología | Corre en |
|---|---|---|
| Frontend | Next.js 16.2.1 (App Router) + TypeScript + Tailwind v4 + Framer Motion | Vercel (producción), `localhost:3000` (desarrollo) |
| Backend | Python FastAPI + Uvicorn | Tu PC: `localhost:8000` → `api.elige-tuplan.cl` (via Cloudflare Tunnel) |
| Base de datos | Supabase (PostgreSQL) | Nube (siempre online) |
| DNS / Proxy | Cloudflare | Nube |
| ETL | Python scripts (`sync_sis.py`, `sync_tu7.py`) | Manual |
| Leads | Google Sheets vía Apps Script | `POST` directo |

---

## Folder Structure

```
Eligetuplan/
├── CLAUDE.md                     # Guía interna para IA
├── ARCHITECTURE.md              # Este archivo
├── .github/workflows/           # CI/CD (preparado para GCP)
│
├── test/                        # 🛠️ Desarrollo local
│   ├── frontend/                # Next.js App (dev)
│   │   ├── app/               # Páginas, componentes, layouts
│   │   ├── components/ui/      # Componentes UI
│   │   ├── lib/api.ts         # Funciones API client
│   │   └── public/            # Assets estáticos
│   │
│   └── backend/               # FastAPI (dev)
│       ├── main.py             # API endpoints
│       ├── requirements.txt    # Dependencias Python
│       └── scripts/           # ETL (sync_sis.py, sync_tu7.py)
│
└── production/               # 🚀 Producción
    ├── frontend/              # Vercel deploy (production/frontend)
    ├── backend/               # Preparado para GCP Cloud Run
    │   ├── Dockerfile         # Imagen Docker para Cloud Run
    │   ├── .dockerignore     # Excluye .env, __pycache__, etc.
    │   ├── main.py           # API con CORS configurado
    │   ├── requirements.txt  # Dependencias
    │   └── scripts/          # ETL (no necesarios en prod)
    │
    ├── tunnel/               # Cloudflare Tunnel config
    │   └── config.yml        # api.elige-tuplan.cl → localhost:8000
    │
    └── DEPLOY_GUIDE.md      # Guía paso a paso de deploy
```

---

## Variables de entorno

### Desarrollo (`test/`)

| Variable | Archivo | Propósito | Visibilidad |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `test/frontend/.env.local` | URL del backend para fetch() | **Pública** (JS bundle) |
| `SUPABASE_URL` | `test/backend/.env` | URL del proyecto Supabase | Pseudo-pública |
| `SUPABASE_KEY` | `test/backend/.env` | Anon key (RLS: solo SELECT) | Pseudo-pública |
| `ALLOWED_ORIGINS` | `test/backend/.env` | Orígenes CORS (CSV) | Config |
| `SIS_PERIOD` | `test/backend/.env` | Período default YYYYMM | Config |

### Producción (`production/`)

| Variable | Dónde se configura | Valor |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel Dashboard | `https://api.elige-tuplan.cl` |
| `SUPABASE_URL` | Cloud Run / .env | Tu URL de Supabase |
| `SUPABASE_KEY` | Cloud Run / .env | Tu anon key |
| `ALLOWED_ORIGINS` | Cloud Run / .env | `https://elige-tuplan.cl,https://www.elige-tuplan.cl` |

---

## Base de datos: 4 tablas

| Tabla | Columnas clave | Notas |
|---|---|---|
| `isapres` | `id`, `name`, `slug`, `logo_url`, `codigo_sis` | 7 isapres activas (2026) |
| `planes` | `id`, `isapre_id`, `codigo_plan` (unique), `price_uf`, `base_plan_uf`, `ges_isapre_uf`, `modalidad`, `hospitalia_texto`, `ambulatoria_texto`, `cobertura_hosp_max`, `cobertura_amb_max`, `id_zona`, `tu7_activo`, `comercializable`, `tipo_plan`, `pdf_plan`... | **~30 columnas** (expandido vía migraciones) |
| `clinicas` | `id`, `name`, `region` | Relación M:N con planes |
| `plan_clinica` | `plan_id`, `clinica_id` | Tabla pivote |

**RLS**: SELECT público (`USING true`). Escritura solo con `service_role_key`.

---

## Endpoints de la API

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/` | Bienvenida |
| `GET` | `/api/v1/health` | Health check — `{"status":"ok"}` |
| `POST` | `/api/v1/match-plan` | **Algoritmo core**: scoring multi-objetivo con perfil-usuario, devuelve Top 3 planes recomendados |
| `GET` | `/api/v1/planes-autocomplete` | Autocompletar planes por Isapre |
| `GET` | `/api/v1/planes` | Catálogo paginado con 15+ filtros |
| `GET` | `/api/v1/planes/{id}` | Detalle de un plan |
| `GET` | `/api/v1/isapres` | Lista isapres activas + conteo + factor GES |
| `GET` | `/api/v1/zonas` | Zonas geográficas + conteo |
| `GET` | `/api/v1/prestadores` | Clínicas únicas |
| `GET` | `/pdfs/*` | PDFs descargados (estáticos) |

---

## Algoritmo de scoring multi-objetivo

El endpoint `/api/v1/match-plan` usa un algoritmo de scoring de 4 componentes:

```
score = w1×affordability + w2×coverage + w3×value + w4×extras
```

### Pesos según preferencia del usuario

| Preferencia | w1 (Asequibilidad) | w2 (Cobertura) | w3 (Valor) | w4 (Extras) |
|---|---|---|---|---|
| `savings` | 55% | 20% | 20% | 5% |
| `balanced` | 35% | 35% | 25% | 5% |
| `coverage` | 15% | 55% | 25% | 5% |

### Perfil-aware scoring

- **Ingreso familiar**: Se suma ingreso del titular + pareja (si aplica)
- **Factor edad/sexo**: Ranges diferenciados por sexo
- **Cargas**: Peso por edad (<18: 0.7, 18-35: 1.0, 36-50: 1.2, 50+: 1.4)
- **Cobertura adaptativa**: Pesos hospitalario/ambulatorio ajustados por perfil (solo: 60/40, pareja: 50/50, cargas jóvenes: 45/55)
- **Bonus región**: +50 pts si el plan tiene clínica en la región preferida

### Resultado

- Se filtra a **Consalud** (sesgo de negocio)
- Percentiles de mercado calculados contra todo el mercado
- `reason_tag` personalizado por plan

---

## Frontend: páginas y componentes

### Páginas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Client | Hero con nav, slider logos, feature rows, stats |
| `/comparar/isapres` | Server + Client | Catálogo con filtros, grid de planes, modales |
| `/tu-mejor-plan` | Client | Wizard 3 pasos: plan actual → perfil → resultados con scoring |
| `/buscar` | Client | Lead capture form + WhatsApp |
| `/como-funciona` | Server | Estático |
| `/faq` | Server | Estático |

### Componentes UI clave

| Componente | Descripción |
|---|---|
| `SiteHeader` | Sticky, scroll-reveal en home, hamburger en mobile |
| `MobileNav` | Drawer de navegación para mobile (Sheet) |
| `MobileFilterSheet` | Filtros en drawer para mobile |
| `PulseFitHero` | Hero configurable con nav, CTA, collage de imágenes |
| `WhatsAppFab` | Botón flotante de WhatsApp con pulse animation |
| `ContactOptions` | WhatsApp para Consalud, form para otras isapres |
| `InfiniteSlider` | Carrusel infinito de logos |
| `LeadCaptureForm` | Formulario de captura de leads |

### Mobile UX

- **Hamburger menu**: Aparece en pantallas `< md:`
- **Filtros**: Sidebar desktop, drawer mobile
- **Hero**: Imágenes en fila horizontal en mobile, collage superpuesto en desktop
- **Wizard stepper**: Labels siempre visibles, cards en stack vertical
- **Bottom spacing**: `pb-24` en páginas con FAB para no tapar contenido

---

## Diseño y Tokens

| Token | Valor | Uso |
|---|---|---|
| Verde oscuro | `#0f514b` | Header, footer, textos, botones secundarios |
| Verde acento | `#14dcb4` | CTAs, badges, bordes activos, hover |
| Fondo neutro | `#eef2f5` | Background general |
| Fondo claro | `#f8fafc` | Páginas internas |
| Font | `Poppins` | Todo el sistema |

**Patrones**:
- Botones primarios: gradiente `135deg, #14dcb4 → #0f9d8a` + `hover:-translate-y-0.5`
- Cards: `rounded-2xl border-slate-200 shadow-sm bg-white` + `hover:shadow-md`
- Animaciones: Framer Motion (`whileHover`, `whileInView` con `once:true`, `AnimatePresence`)

---

## SEO y Metadatos

- `theme-color`: `#0f514b`
- `apple-mobile-web-app-capable`: enabled
- `apple-mobile-web-app-status-bar-style`: black-translucent
- Favicon: `app/icon.png` (genera automáticamente todos los tamaños)
- OpenGraph: configurado para compartir en redes sociales

---

## Deploy actual

### Frontend → Vercel

1. **Root Directory**: `production/frontend`
2. **Framework**: Next.js (auto-detectado)
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api.elige-tuplan.cl`

### Backend → Cloudflare Tunnel (temporal)

1. **Local**: Python FastAPI en `localhost:8000`
2. **Tunnel**: Cloudflare Tunnel conecta `api.elige-tuplan.cl` → `localhost:8000`
3. **Script**: `start_eligetuplan.ps1` para levantar todo con un click

### DNS → Cloudflare

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | cname.vercel-dns.com | DNS only (gris) |
| CNAME | `www` | cname.vercel-dns.com | DNS only (gris) |
| CNAME | `api` | 9789247e...cfargotunnel.com | Proxied (naranja) |

---

## Preparado para Cloud Run (futuro)

La carpeta `production/backend/` ya tiene todo listo para deployar a Google Cloud Run:

- `Dockerfile` — imagen Python 3.12 con uvicorn
- `.dockerignore` — excluye .env, __pycache__, venv
- `requirements.txt` — dependencias Python
- `.github/workflows/deploy-backend.yml` — CI/CD para Cloud Run

Cuando se active Cloud Run:
1. Crear proyecto en GCP
2. Habilitar Cloud Run, Artifact Registry, Cloud Build
3. Configurar secrets de Supabase
4. El workflow de GitHub Actions construirá y deployará automáticamente

---

## Comandos frecuentes

### Desarrollo local

```bash
# Frontend
cd test/frontend
npm run dev        # http://localhost:3000
npm run build
npm run lint

# Backend
cd test/backend
python -B main.py     # http://localhost:8000
# Swagger UI:         http://localhost:8000/docs

# Production (frontend + tunnel)
.\start_eligetuplan.ps1
```

### ETL — sync de datos

```bash
cd test/backend
python scripts/sync_sis.py --period 202602   # SIS
python scripts/sync_tu7.py                   # tu7.cl
python scripts/download_tu7_pdfs.py           # PDFs
```

### Vercel (producción)

- Deploy automático con cada push a `main`
- Root directory: `production/frontend`

---

## Isapres activas (2026)

| Código SIS | Slug | Nombre |
|---|---|---|
| 80 | `banmedica` | Banmédica |
| 99 | `consalud` | Consalud |
| 78 | `cruzblanca` | Cruz Blanca |
| 81 | `nuevamasvida` | Nueva Más Vida |
| 67 | `colmena` | Colmena Golden Cross |
| 107 | `vidatres` | Vida Tres |
| 108 | `esencial` | Esencial |

---

## Costos mensuales

| Servicio | Costo |
|---|---|
| Vercel (Hobby) | $0 |
| Cloudflare (Free) | $0 |
| Cloudflare Tunnel | $0 |
| Supabase (Free) | $0 |
| Dominio `.cl` | ~$1.250 CLP/mes |
| **Total** | **~$1.250 CLP/mes** |

*Backend en Cloud Run = $0/mes (free tier cubre todo el tráfico actual)*

---

## Migración a Google Cloud Run (Backend 24/7)

### Error del primer intento

El primer deploy a Cloud Run falló con:
```
Error response from daemon: unexpected error reading Dockerfile: 
read /var/lib/docker/tmp/docker-builder1264438167/backend: is a directory
```

**Causa**: Cloud Build buscaba un archivo `Dockerfile` pero encontró un directorio `backend/`.

**Solución**: Especificar correctamente el Dockerfile path y el build context al configurar el servicio.

---

### Configuración correcta en GCP Console

Al crear el servicio Cloud Run:

| Campo | Valor |
|---|---|
| **Dockerfile path** | `production/backend/Dockerfile` |
| **Build context** | `production/backend` |
| **Region** | `southamerica-west1` (Santiago) |
| **CPU** | 1 |
| **Memory** | 512 MiB |
| **Min instances** | 0 |
| **Max instances** | 3 |
| **Port** | 8080 |
| **Authentication** | Allow unauthenticated invocations |

---

### Secrets de GitHub (6 en total)

En el repositorio GitHub → Settings → Secrets and variables → Actions, agregar:

| Secret | Descripción | Ejemplo |
|---|---|---|
| `GCP_PROJECT_ID` | ID del proyecto GCP | `eligetuplan-prod` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Provider de Workload Identity | `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | Service Account para Cloud Run | `github-actions@eligetuplan-prod.iam.gserviceaccount.com` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Anon key pública de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ALLOWED_ORIGINS` | Orígenes CORS | `https://elige-tuplan.cl,https://www.elige-tuplan.cl` |

---

### Pasos para configurar Workload Identity (requerido)

1. **Crear Service Account** en GCP:
   - IAM → Service Accounts → Create
   - Name: `github-actions`
   - Role: `Cloud Run Admin` + `Artifact Registry Writer`

2. **Crear Workload Identity Pool**:
   - IAM → Workload Identity Pools → Create Pool
   - Name: `github-pool`
   - Provider: GitHub (seleccionar tu repo `francoSW99/Eligetuplan`)

3. **Agregar Service Account al Provider**:
   - Grant access to: `serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com`
   - Attributes: `attribute.repository=fran-coSW99/Eligetuplan`

4. **Copiar el Workload Identity Provider ID** (para el secret de GitHub)

---

### Workflow de GitHub Actions

El archivo `.github/workflows/deploy-backend.yml` ya está configurado para:
- Build de la imagen Docker desde `production/backend/`
- Push a Artifact Registry
- Deploy a Cloud Run con las environment variables
- Autenticación via Workload Identity

El workflow se dispara automáticamente con cada push a `main` que modifique `production/backend/**`.

---

### Checklist post-deploy

Después de que el deploy termine, verificar:

- [ ] `https://[SERVICE_URL]/api/v1/health` responde `{"status":"ok"}`
- [ ] `https://api.elige-tuplan.cl/api/v1/health` responde correctamente (si ya mapeaste el dominio)
- [ ] Los planes se cargan en `/comparar/isapres`
- [ ] El wizard `/tu-mejor-plan` devuelve resultados
- [ ] No hay errores en Cloud Run Logs
- [ ] Los logs de GitHub Actions muestran "Build successful"

---

### Desconectar Cloudflare Tunnel (opcional)

Una vez que Cloud Run esté funcionando:

1. Eliminar el CNAME `api` en Cloudflare DNS
2. O crear un nuevo CNAME `api` apuntando al URL de Cloud Run: `[SERVICE-NAME]-[HASH].southamerica-west1.run.app`
3. El backend stayá 24/7 sin necesidad de tu PC

---

_Last updated: Abril 2026 — v2.0 Production_