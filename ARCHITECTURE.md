# EligetuPlan — Arquitectura Completa

### Propósito
Plataforma B2C para comparar **+500 planes de Isapre** en Chile. 100% gratuito. 3 flujos principales:
1. **Catálogo** (`/comparar/isapres`) — filtros avanzados sobre todos los planes
2. **Wizard "Tu Mejor Plan"** (`/tu-mejor-plan`) — Typeform de 3 pasos que recomienda Top 3 por scoring
3. **Captura de leads** (`/buscar`) — formulario → Google Sheets

---

### Stack técnico

| Capa | Tecnología | Corre en |
|---|---|---|
| Frontend | Next.js 16.2.1 (App Router) + TypeScript + Tailwind v4 + Framer Motion | `localhost:3000` |
| Backend | Python FastAPI + Uvicorn | `localhost:8000` |
| Base de datos | Supabase (PostgreSQL) | Nube |
| ETL | Python scripts (`sync_sis.py`, `sync_tu7.py`) | Manual |
| Leads | Google Sheets vía Apps Script | `POST` directo |

---

### Cómo se conecta todo

```
SIS (gob.cl) ──ZIP──► sync_sis.py ──upsert──► Supabase ◄──upsert── sync_tu7.py ◄── API tu7.cl
                                                    │
                                              (anon key, RLS)
                                                    │
                                                    ▼
                                            FastAPI (:8000)
                                                    │
                                              HTTP fetch()
                                                    │
                                                    ▼
                                          Next.js (:3000) ──POST──► Google Sheets (leads)
```

- **Frontend → Backend**: `fetch()` directo a `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- **Backend → Supabase**: SDK `supabase` con **anon key** (solo SELECT, RLS restringe)
- **ETL → Supabase**: SDK con **service_role_key** (bypassea RLS, INSERT/UPDATE)
- **Leads → Google Sheets**: `POST` con `mode: 'no-cors'` a URL de Apps Script

---

### Base de datos: 4 tablas

| Tabla | Columnas clave | Notas |
|---|---|---|
| `isapres` | `id`, `name`, `slug`, `logo_url`, `codigo_sis` | 7 isapres activas (2026) |
| `planes` | `id`, `isapre_id`, `codigo_plan` (unique), `price_uf`, `base_plan_uf`, `ges_isapre_uf`, `modalidad`, `hospitalaria_texto`, `ambulatoria_texto`, `cobertura_hosp_max`, `cobertura_amb_max`, `id_zona`, `tu7_activo`, `comercializable`, `tipo_plan`, `pdf_plan`... | **~24 columnas** (expandido vía 4 migraciones) |
| `clinicas` | `id`, `name`, `region` | Relación M:N con planes |
| `plan_clinica` | `plan_id`, `clinica_id` | Tabla pivote |

**RLS**: SELECT público (`USING true`). Escritura solo con `service_role_key`.

---

### Endpoints de la API

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/v1/match-plan` | **Algoritmo core**: recibe `{age, income_clp, dependents, preferred_region}`, devuelve Top 3 con score |
| `GET` | `/api/v1/planes` | Catálogo paginado con 12+ filtros (isapre, modalidad, zona, precio CLP, cobertura %, prestador, parto, búsqueda...) |
| `GET` | `/api/v1/planes/{id}` | Detalle de un plan |
| `GET` | `/api/v1/isapres` | Lista isapres activas + conteo + factor GES |
| `GET` | `/api/v1/zonas` | Zonas geográficas + conteo |
| `GET` | `/api/v1/prestadores` | Clínicas únicas (parseadas de textos de cobertura) |
| `GET` | `/pdfs/*` | Archivos PDF descargados (servidos estáticos) |

---

### Algoritmo de scoring (`_score_plan`)

```python
estimated_budget = max((income × 0.07) / 38_000, 1.0)   # 7% legal en UF
affordability = max(0, 100 - |price - budget| × 20)
dependents_bonus = min(dependents, 4) × 1.5
age_bonus = 2.0 (si < 35), 1.0 (si < 50), -1.0 (si 50+)

score = 0.45×affordability + 0.35×hospital% + 0.20×ambulatory% + dependents + age
       + 5.0 si hay match de región  →  cap [0, 100]
```

El Top 3 se muestra como: **Más Económico**, **Recomendado** (mejor score), **Mejor Cobertura**.

---

### Flujo de datos ETL

1. **`sync_sis.py`** — Descarga ZIP de `superdesalud.gob.cl`, parsea CSV pipe-delimited (39 columnas, Latin-1), upsert isapres + planes. Usa `codigo_plan` como clave de conflicto. Idempotente.
2. **`sync_tu7.py`** — Consulta `POST tu7.cl/Api/data/planes/`, enriquece planes con: precio base, GES, zona, texto de coberturas, PDFs, y calcula `cobertura_hosp_max` / `cobertura_amb_max`.
3. **`download_tu7_pdfs.py`** — Descarga PDFs desde `tu7.cl/pdf/` con 8 hilos concurrentes.

---

### Frontend: páginas y componentes

| Ruta | Tipo | Componentes clave |
|---|---|---|
| `/` | Client | `PulseFitHero`, `InfiniteSlider`, feature cards, stats |
| `/comparar/isapres` | **Server** (SSR) + Client | `page.tsx` (fetch inicial) → `isapres-client.tsx` (764 líneas, filtros, grid, modales) → `plan-card.tsx` |
| `/tu-mejor-plan` | **Client** | Wizard 3 pasos con `AnimatePresence`, `POST /match-plan` |
| `/buscar` | Client | `LeadCaptureForm` con gradient header |
| `/como-funciona` | Server | Estático |
| `/faq` | Server | Estático |

**Componentes UI compartidos**: `SiteHeader` (sticky, se oculta en `/`), `LeadCaptureForm` (reusable con props `contextPlan`, `compact`, `onClose`), `PulseFitHero` (configurable con nav, CTA, imágenes).

---

### Convenciones de diseño
- **Tokens**: `#0f514b` (verde oscuro), `#14dcb4` (verde acento), `#eef2f5` (fondo), `#f8fafc` (páginas internas)
- **Font**: Poppins (cargado en `layout.tsx`)
- **Botones primarios**: gradiente `135deg, #14dcb4 → #0f9d8a` + `hover:-translate-y-0.5`
- **Cards**: `rounded-2xl border-slate-200 shadow-sm bg-white` + `hover:shadow-md`
- **Animaciones**: Framer Motion (`whileHover`, `whileInView` con `once:true`, `AnimatePresence`)

---

### Secretos y entornos

- **Desarrollo**: 100% en `test/` (nunca editar `production/` simultáneamente)
- **`.env` y `.env.local`**: en `.gitignore`, jamás commitear
- **`service_role_key`**: solo en scripts ETL del backend, NUNCA en frontend
- **Variables `NEXT_PUBLIC_*`**: visibles en el bundle del cliente
- **Mock fallback**: si Supabase no está disponible, `/match-plan` devuelve 3 planes mock para no romper el frontend

---

### Variables de entorno

| Variable | Archivo | Propósito | Visibilidad |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `test/frontend/.env.local` | URL del backend para fetch() | **Pública** (JS bundle) |
| `SUPABASE_URL` | `test/backend/.env` | URL del proyecto Supabase | Pseudo-pública |
| `SUPABASE_KEY` | `test/backend/.env` | Anon key (RLS: solo SELECT) | Pseudo-pública |
| `SUPABASE_SERVICE_ROLE_KEY` | `test/backend/.env` | Service role (bypassea RLS) | **SECRETA** |
| `ALLOWED_ORIGINS` | `test/backend/.env` | Orígenes CORS (CSV) | Config |
| `SIS_PERIOD` | `test/backend/.env` | Período default YYYYMM | Config |
| `UF_VALUE_CLP` | `test/backend/.env` | Tasa UF→CLP (default 39,987) | Config |

---

### Isapres activas (2026)

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

### Zonas geográficas (mapeo tu7)

| ID | Nombre |
|---|---|
| 1 | Norte |
| 3 | Octava |
| 4 | Quinta |
| 5 | RM |
| 6 | Sur |
| 8 | Regional - CB / Colmena |
| 9 | Centro |

---

### Comandos frecuentes

**Frontend:**
```bash
cd test/frontend
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

**Backend:**
```bash
cd test/backend
python main.py     # http://localhost:8000
# Swagger UI:      http://localhost:8000/docs
```

**ETL — sync de datos SIS a Supabase:**
```bash
cd test/backend
python scripts/sync_sis.py --period 202602
```

**ETL — enriquecimiento desde tu7:**
```bash
cd test/backend
python scripts/sync_tu7.py
```

**ETL — descarga de PDFs:**
```bash
cd test/backend
python scripts/download_tu7_pdfs.py
```
