# 🚀 Eligetuplan v2.0

> Plataforma B2C de comparación de planes de salud (Isapres) en Chile. **Mobile-First · Data-Driven · 100% Gratuito.**

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Monorepo](#estructura-del-monorepo)
- [Frontend](#frontend)
- [Backend — API de Scoring](#backend--api-de-scoring)
- [Algoritmo de Recomendación](#algoritmo-de-recomendación)
- [Base de Datos](#base-de-datos)
- [Cómo Correr el Proyecto](#cómo-correr-el-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Flujo de Desarrollo](#flujo-de-desarrollo)

---

## Descripción

**Eligetuplan** compara **+1.800 planes vigentes** de las **7 Isapres abiertas** de Chile usando un algoritmo de scoring multi-objetivo que pondera asequibilidad, cobertura, valor y perfil del usuario. El resultado se filtra intencionalmente a **Consalud** (sesgo de negocio documentado) pero los percentiles se calculan contra el mercado completo, dando justificación cuantitativa transparente.

**Flujo del usuario:**
1. **Home (`/`)** → Hero con nav sticky, feature rows con CTAs, slider de logos, stats section.
2. **Comparar Planes (`/comparar/isapres`)** → Catálogo con filtros avanzados por Isapre, modalidad, precio y cobertura.
3. **Tu Mejor Plan (`/tu-mejor-plan`)** → Wizard de 3 pasos: plan actual → perfil → resultados inteligentes con alternativas data-driven.
4. **Cotiza con un Ejecutivo (`/buscar`)** → Formulario de contacto + WhatsApp directo para Consalud.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|:---|:---|:---|
| **Frontend** | Next.js (App Router) + TypeScript | 16.2.1 |
| **Estilos** | Tailwind CSS v4 | Latest |
| **Animaciones** | Framer Motion | v12 |
| **Iconos** | Lucide React | v1 |
| **Backend API** | Python FastAPI | Latest |
| **Base de Datos** | Supabase (PostgreSQL) | Latest |
| **Hosting (target)** | Vercel + Render | — |

---

## Estructura del Monorepo

```
Eligetuplan/
├── .vscode/                     # Config VS Code compartida
├── images/                      # Assets fuente originales
├── logos/                        # Logos fuente de Isapres
├── CLAUDE.md                     # Guía interna para IA
├── ARCHITECTURE.md               # Arquitectura detallada
├── setup.ps1                     # Script de inicio (Windows)
├── restart_test.ps1              # Script restart con hardening
│
├── test/                         # 🛠️ Entorno de Desarrollo
│   ├── frontend/                 # Next.js App
│   │   ├── app/
│   │   │   ├── page.tsx              → Home (hero, features, stats)
│   │   │   ├── layout.tsx            → Layout + footer + WhatsApp FAB
│   │   │   ├── globals.css           → Estilos base + animaciones
│   │   │   ├── comparar/isapres/     → Catálogo de planes
│   │   │   ├── tu-mejor-plan/        → Wizard 3 pasos + resultados
│   │   │   ├── buscar/               → Lead capture
│   │   │   ├── como-funciona/        → Informativa
│   │   │   └── faq/                  → Preguntas frecuentes
│   │   └── components/ui/           # Componentes reutilizables
│   │       ├── pulse-fit-hero.tsx   → Hero dinámico
│   │       ├── site-header.tsx       → Header sticky con scroll-reveal
│   │       ├── whatsapp-fab.tsx       → FAB flotante WhatsApp
│   │       ├── contact-options.tsx    → WhatsApp para Consalud / Form para otras
│   │       ├── lead-capture-form.tsx  → Formulario de leads
│   │       └── infinite-slider.tsx   → Carrusel infinito
│   │
│   ├── backend/                  # FastAPI
│   │   ├── main.py                → API completa con scoring
│   │   └── requirements.txt      → Dependencias Python
│   │
│   └── database/                 # SQL de Supabase
│       └── schema.sql             → Schema completo + RLS
│
└── production/                   # 🚀 Entorno de Producción (pendiente)
```

---

## Frontend

### Diseño y Tokens

| Token | Valor | Uso |
|:---|:---|:---|
| Verde oscuro | `#0f514b` | Fondos oscuros, header, footer |
| Verde acento | `#14dcb4` | CTAs, badges, bordes activos, hover |
| Fondo neutro | `#eef2f5` | Background general |
| Fondo claro | `#f8fafc` | Páginas internas |
| Font | `Poppins` | Sistema completo |

### Componentes Clave

| Componente | Descripción |
|:---|:---|
| `SiteHeader` | Header sticky con nav links animados. Se oculta en home hasta scroll > 120px. |
| `WhatsAppFab` | FAB flotante esquina inferior derecha con ping animation. Visible en todas las páginas. |
| `ContactOptions` | Botón WhatsApp para Consalud + formulario para otras Isapres. |
| `PulseFitHero` | Hero reutilizable con logo, nav, título, subtítulo, CTAs y social proof. |
| `InfiniteSlider` | Carrusel infinito de logos con hover-slow. |

### Páginas

- **Home (`/`)** — Hero con nav + CTAs, slider de 7 logos, 3 feature rows horizontales con CTAs, stats section (7 Isapres, 1854+ planes, 16 regiones, 100% gratis).
- **Tu Mejor Plan (`/tu-mejor-plan`)** — Wizard 3 pasos. Paso 3: plan recomendado + alternativas inteligentes según preferencia, con justificación data-driven (reason_tag, percentiles, ahorro vs plan actual).
- **Comparar Planes (`/comparar/isapres`)** — Catálogo con filtros por Isapre, modalidad, precio, cobertura.
- **Buscar (`/buscar`)** — Lead capture form.

### Footer

4 columnas inspirado en tu7.cl: logo + descripción + íconos sociales, Isapres, Sitios de Interés, Contacto. Fondo `#092e2a`, disclaimer legal al fondo.

---

## Backend — API de Scoring

### Endpoints

| Método | Ruta | Descripción |
|:---|:---|:---|
| `GET` | `/` | Bienvenida |
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/plans-autocomplete` | Autocompletar planes por Isapre |
| `POST` | `/api/v1/match-plan` | **Core:** scoring multi-objetivo + recomendación |

### `POST /api/v1/match-plan`

**Request:**
```json
{
  "age": 30,
  "income_clp": 1200000,
  "dependents": 1,
  "preferred_region": "rm",
  "isapre": "consalud",
  "preference": "balanced",
  "limit": 6,
  "current_price_uf": 3.5,
  "current_hospital_coverage": 80.0,
  "current_ambulatory_coverage": 65.0,
  "sexo": "femenino",
  "tipo": "pareja",
  "sexo_pareja": "masculino",
  "edad_pareja": 32,
  "ingreso_pareja_clp": 800000,
  "cargas": [{"sexo": "masculino", "edad": 5}]
}
```

**Response (lista de `PlanResponse`):**
```json
[
  {
    "id": "uuid",
    "name": "Plan Conecta Clásico",
    "isapre_name": "Consalud",
    "isapre_slug": "consalud",
    "logo_url": "/logos/logo_consalud.png",
    "price_uf": 2.14,
    "match_score": 87.3,
    "hospital_coverage": 85.0,
    "ambulatory_coverage": 70.0,
    "reason_tag": "mujer joven — con pareja — en Región Metropolitana — gran valor",
    "savings_uf": -1.36,
    "savings_clp": -54380,
    "savings_pct": -38.9,
    "coverage_diff_hosp_pp": 5,
    "coverage_diff_amb_pp": 5,
    "market_percentile_value": 92.1,
    "market_percentile_coverage": 78.0,
    "market_percentile_price": 65.0,
    "market_total_plans": 1854,
    "score_breakdown": {
      "affordability": 82.0,
      "coverage": 81.0,
      "value": 92.1,
      "extras": 55.0,
      "weights": {"afford": 0.35, "coverage": 0.35, "value": 0.25, "extras": 0.05}
    }
  }
]
```

---

## Algoritmo de Recomendación

### Scoring Multi-Objetivo (4 componentes)

Cada plan recibe un **composite score** ponderado por la preferencia del usuario:

| Preferencia | Asequibilidad | Cobertura | Valor | Extras |
|:---|:---|:---|:---|:---|
| `savings` | 55% | 20% | 20% | 5% |
| `balanced` | 35% | 35% | 25% | 5% |
| `coverage` | 15% | 55% | 25% | 5% |

### Perfil-Aware (nuevo en v2.0)

- **Asequibilidad:** Calculada sobre ingreso familiar (titular + pareja), no solo titular
- **Age/sexo factor:** Rangos diferenciados por sexo (femenino < 35: 55, 35-50: 45, 50+: 35; masculino < 35: 60, 35-50: 50, 50+: 35)
- **Dependents:** Peso por edad de cada carga (< 18: 0.7, 18-35: 1.0, 36-50: 1.2, 50+: 1.4) en vez de count plano
- **Cobertura adaptativa:** Pesos hospitalario/ambulatorio ajustados por perfil (solo: 60/40, pareja: 50/50, cargas jóvenes: 45/55)
- **Pareja bonus:** +5 pts en extras si tipo = pareja
- **Region bonus:** +50 pts si el plan tiene clínica en la región preferida

### Filtrado por Preferencia

- **`savings`:** Solo planes más baratos que el plan actual del usuario
- **`coverage`:** Solo planes con cobertura combinada superior al plan actual
- **`balanced`:** Sin filtro adicional, ordena por composite score

### Resultado

Se filtran a Consalud, se ordenan según preferencia, y se devuelven hasta `limit` planes con percentiles de mercado, deltas vs plan actual, y `reason_tag` personalizado.

---

## Base de Datos

Supabase (PostgreSQL) con RLS habilitado. Tablas: `isapres`, `planes`, `clinicas`, `plan_clinica`. Los planes se sync desde SIS usando `scripts/sync_sis.py`.

Logo de Esencial actualizado en la tabla `isapres` (`logo_url = '/logos/esencial.png'`).

---

## Cómo Correr el Proyecto

### Quick Start (Windows)
```powershell
.\setup.ps1        # Inicia backend + frontend
.\restart_test.ps1 # Reinicia (con -Stop para detener)
```

### Manual

**Frontend:**
```bash
cd test/frontend
npm install
npm run dev        # http://localhost:3000
npm run build      # producción
```

**Backend:**
```bash
cd test/backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python main.py              # http://localhost:8000
                            # Swagger: http://localhost:8000/docs
```

---

## Variables de Entorno

| Variable | Dónde | Visibilidad |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | `test/frontend/.env.local` | Pública (bundle) |
| `SUPABASE_URL` | `test/backend/.env` | Pública-ish |
| `SUPABASE_KEY` (anon) | `test/backend/.env` | Anon, RLS la restringe |
| `SUPABASE_SERVICE_ROLE_KEY` | `test/backend/.env` | **SECRETA** — solo para scripts manuales |
| `SIS_PERIOD` | `test/backend/.env` | Pública |

> **Regla:** Todo lo que empieza con `NEXT_PUBLIC_` termina en el bundle del cliente. Nunca poner secrets ahí.

---

## Flujo de Desarrollo

- **Todo el desarrollo vive en `test/`**. No editar `production/` mientras una feature está en QA.
- Promoción a `production/` solo tras validación manual del feature completo.
- Migraciones en `test/database/migrations/` aplicadas **manualmente** en el SQL Editor de Supabase.
- `CLAUDE.md` tiene convenciones y gotchas para trabajo con IA.

---

*Última actualización: Abril 2026 — v2.0*