# CLAUDE.md — Eligetuplan

Guía interna para asistentes IA trabajando en este repo. Complementa [README.md](README.md) con **convenciones no-obvias, comandos y gotchas**. No duplica la arquitectura (eso vive en el README).

> **Regla:** este archivo es pull-based. Solo entra info que (a) no se infiere del código, (b) afecta decisiones recurrentes, o (c) evita un error concreto. Si algo deja de ser cierto, se elimina en la misma sesión.

---

## Comandos frecuentes

**Frontend** (Next.js 16 + TS, en `test/frontend/`)
```bash
cd test/frontend
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

**Backend** (FastAPI, en `test/backend/`)
```bash
cd test/backend
python main.py     # http://localhost:8000
# Swagger UI:      http://localhost:8000/docs
```

**ETL — sync de datos SIS a Supabase**
```bash
cd test/backend
python scripts/sync_sis.py --period 202602
# --period es YYYYMM. Default leído de env var SIS_PERIOD.
```

**Base de datos**
- Migraciones en `test/database/migrations/NNN_*.sql` aplicadas **manualmente** en el SQL Editor de Supabase.
- `test/database/schema.sql` es la referencia de instalación fresca, NO se aplica en reruns.

---

## Secrets policy (crítico)

| Variable | Dónde vive | Quién la usa | Visibilidad |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `test/frontend/.env.local` | Bundle del frontend | **Pública** (visible al navegador) |
| `SUPABASE_URL` | `test/backend/.env` | `main.py` | Pública-ish |
| `SUPABASE_KEY` (anon) | `test/backend/.env` | `main.py` queries de lectura | Anon, RLS la restringe a SELECT |
| `SUPABASE_SERVICE_ROLE_KEY` | `test/backend/.env` | **Solo** `scripts/sync_sis.py` | **SECRETA** — bypassea RLS, nunca exponer al frontend |
| `SIS_PERIOD` | `test/backend/.env` | `scripts/sync_sis.py` | Pública |

**Reglas:**
- Todo lo que empieza con `NEXT_PUBLIC_` termina en el bundle del cliente. No poner ahí nada secreto.
- El `service_role_key` solo se usa en scripts del backend ejecutados manualmente. Jamás importarlo en código que corra en el frontend.
- `.env` y `.env.local` están en `.gitignore`. Verificar antes de cada commit.

---

## Next.js 16 — gotchas

Este repo usa Next.js 16.2.1 (App Router). Hay cambios vs versiones entrenadas por modelos comunes:

- **NO habilitar `cacheComponents`** en `next.config.ts`. Rompe el patrón actual del proyecto.
- `fetch()` ya **no cachea por default** — usar `{ next: { revalidate: N } }` explícito cuando se quiere caching.
- `searchParams` y `params` son `Promise` en Server Components: `const p = await searchParams`.
- Antes de escribir código nuevo con APIs que no estés 100% seguro, leer `test/frontend/node_modules/next/dist/docs/` — hay breaking changes no documentados afuera aún. Warning original está en [test/frontend/AGENTS.md](test/frontend/AGENTS.md).

**Patrón conservador recomendado para páginas data-driven:**
Server Component async → fetch con `revalidate` → Client Component hijo para interactividad. No mezclar SWR/React Query salvo necesidad real.

---

## Design tokens

| Token | Valor | Uso |
|---|---|---|
| Verde oscuro | `#0f514b` | Fondos oscuros, texto primario, botones secundarios |
| Verde acento | `#14dcb4` | CTAs, badges, bordes activos, highlights |
| Fondo neutro | `#eef2f5` | Background general |
| Fondo claro | `#f8fafc` | Páginas internas |
| Font | `Poppins` | Todo el sistema (cargado en `layout.tsx`) |

**Convenciones de componentes:**
- Cards: `rounded-2xl border border-slate-200 shadow-sm bg-white`
- Hover en cards: `hover:shadow-md` o `whileHover={{ y: -8 }}`
- Botones primarios: gradient `linear-gradient(135deg, #14dcb4, #0f9d8a)` + `hover:-translate-y-0.5`
- Pills / badges: `bg-[#14dcb4]/10 text-[#14dcb4]` o `bg-[#14dcb4]/20 text-white` sobre fondos oscuros
- Iconos: Lucide React (verificar disponibilidad en v1.0.1 antes de importar)
- Animaciones: Framer Motion (`whileHover`, `whileInView` con `viewport={{ once: true }}`, `AnimatePresence` para transiciones de pasos)

---

## Fuentes de datos — reglas

**Únicas fuentes permitidas:**
- **SIS (Superintendencia de Salud)** — datos oficiales, públicos, actualizados mensualmente
  - Planes: `https://datos.superdesalud.gob.cl/archivos/Planes%20de%20Salud/{YYYY}/Planes_de_salud_{YYYYMM}.zip`
  - Cobertura, factores, aranceles: mismo servidor, distintas carpetas bajo `/archivos/`
  - Formato: ZIP con CSV, encoding probable Latin-1/CP-1252
- **Google Sheets** — leads del formulario `/buscar` (vía Apps Script)

- Fuente base(donde nos debemos guiar): 'https://tu7.cl/Compara/Isapres/'



## Flujo `test/` → `production/`

- **Todo el desarrollo vive en `test/`**. Nunca editar `production/` mientras una feature está en QA.
- Promoción a `production/` solo tras validación manual del feature completo.
- No editar ambos entornos en la misma sesión — riesgo de divergencia.
- Cada entorno tiene su propio proyecto Supabase (no compartir base de datos entre ambos).

---

## Backward compatibility — endpoints críticos

`POST /api/v1/match-plan` es consumido por `/tu-mejor-plan` (wizard de 3 pasos). Al modificar el schema de `planes`:
- Nuevas columnas **siempre NULLABLE** para no romper INSERTs existentes.
- La query en `main.py` solo selecciona columnas que existían en el schema inicial.
- `_safe_float(..., 0.0)` en el scorer tolera valores NULL sin crashear.
- Antes de mergear cambios de schema: `curl -X POST .../match-plan` con payload de prueba debe seguir devolviendo 200 + 3 items.
