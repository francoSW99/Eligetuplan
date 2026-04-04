# 🚀 Eligetuplan

> Plataforma B2C de comparación de planes de salud (Isapres) en Chile. **Mobile-First · SEO-Optimized · 100% Gratuito.**

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Monorepo](#estructura-del-monorepo)
- [Frontend (`/test/frontend`)](#frontend-testfrontend)
  - [Páginas y Rutas](#páginas-y-rutas)
  - [Componentes UI Reutilizables](#componentes-ui-reutilizables)
  - [Diseño y Estilos](#diseño-y-estilos)
- [Backend (`/test/backend`)](#backend-testbackend)
  - [Endpoints de la API](#endpoints-de-la-api)
  - [Modelos de Datos (Pydantic)](#modelos-de-datos-pydantic)
  - [Configuración y CORS](#configuración-y-cors)
- [Base de Datos (`/test/database`)](#base-de-datos-testdatabase)
  - [Esquema Relacional](#esquema-relacional)
  - [Seguridad (Row Level Security)](#seguridad-row-level-security)
- [Entorno de Producción (`/production`)](#entorno-de-producción-production)
- [Cómo Correr el Proyecto](#cómo-correr-el-proyecto)
- [Estado del Desarrollo](#estado-del-desarrollo)

---

## Descripción del Proyecto

**Eligetuplan** es un clon funcional de las características core de Isapre de **QuePlan.cl**. Permite a los usuarios comparar más de 500 planes de salud vigentes de todas las Isapres de Chile, con un flujo 100% online y gratuito.

**Flujo principal del usuario:**
1. **Home (`/`)** → Landing con hero dinámico y captura de leads.
2. **Comparar (`/comparar/isapres`)** → Catálogo con filtros avanzados.
3. **Tu Mejor Plan (`/tu-mejor-plan`)** → Wizard multi-paso tipo Typeform para perfilar al usuario.
4. **Buscar (`/buscar`)** → Buscador por código, nombre o Isapre con filtros al instante.

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|:---|:---|:---|:---|
| **Frontend** | Next.js (App Router) + TypeScript | 16.2.1 | SSR para SEO, enrutamiento dinámico, type safety |
| **Estilos** | Tailwind CSS | v4 | Mobile-first, utility classes |
| **Componentes** | Shadcn UI + `@base-ui/react` | Latest | Accesibles, componibles y rápidos |
| **Animaciones** | Framer Motion | v12 | Animaciones fluidas y micro-interacciones |
| **Iconos** | Lucide React | v1 | Iconos SVG coherentes y livianos |
| **Backend API** | Python FastAPI | Latest | Alto rendimiento para algoritmos de scoring numérico |
| **Base de Datos** | Supabase (PostgreSQL) | Latest | Relacional, RLS nativo, cliente Python oficial |
| **Hosting (target)** | Vercel (Frontend) + Render (Backend) | — | CI/CD automático desde GitHub |

---

## Estructura del Monorepo

```
Eligetuplan/
├── llm.md                      # Especificaciones del proyecto para el agente IA
├── logos/                      # Assets globales (logos de Isapres)
├── components/                 # Componentes globales compartidos
│
├── test/                       # 🛠️ Entorno de Desarrollo / QA
│   ├── frontend/               # App Next.js (variables de entorno de test)
│   │   ├── app/                # App Router (páginas)
│   │   │   ├── page.tsx              → Home (/)
│   │   │   ├── layout.tsx            → Layout global + nav
│   │   │   ├── globals.css           → Estilos base
│   │   │   ├── comparar/isapres/     → Catálogo de planes (/comparar/isapres)
│   │   │   ├── tu-mejor-plan/        → Wizard de perfil (/tu-mejor-plan)
│   │   │   ├── buscar/               → Buscador (/buscar)
│   │   │   ├── como-funciona/        → Página informativa
│   │   │   └── faq/                  → Preguntas frecuentes
│   │   ├── components/ui/      # Componentes reutilizables
│   │   │   ├── pulse-fit-hero.tsx    → Hero dinámico con nav y cards
│   │   │   ├── infinite-slider.tsx   → Carrusel infinito animado
│   │   │   └── button.tsx            → Botón de Shadcn UI
│   │   ├── lib/utils.ts        # Utilidades (cn, etc.)
│   │   ├── public/logos/       # Logos de Isapres (imágenes estáticas)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/                # API FastAPI
│   │   ├── main.py             → App principal con todos los endpoints
│   │   ├── requirements.txt    → Dependencias Python
│   │   └── venv/               → Entorno virtual Python
│   │
│   └── database/               # SQL de Supabase
│       └── schema.sql          → Schema completo + RLS policies
│
└── production/                 # 🚀 Entorno de Producción (espejo de test)
    ├── frontend/               # (pendiente de promoción desde test)
    ├── backend/
    └── database/
```

---

## Frontend (`/test/frontend`)

### Páginas y Rutas

#### `/` — Home (`app/page.tsx`)
Landing page principal de la plataforma. Compuesta por tres secciones:

1. **Hero Dinámico (`PulseFitHero`):** Componente hero reutilizable con navegación, CTA, social proof (avatars + contador de usuarios) y un carrusel auto-animado de tarjetas de Isapres.
2. **Feature Cards:** 3 tarjetas con hover animation (`framer-motion` con `whileHover`) que explican los valores: *Encuentra tu plan*, *Compara opciones*, *Asesoría gratuita*.
3. **Infinite Slider de Logos:** Carrusel de logos de las 6 Isapres vigentes (Banmédica, Consalud, Cruz Blanca, Nueva Más Vida, Colmena, Vida Tres) con velocidad ajustada al hacer hover.
4. **Stats Section:** Sección oscura con métricas destacadas (+500 planes, 100% gratuito, $45k ahorro mensual promedio).

#### `/tu-mejor-plan` — Wizard Multi-Paso (`app/tu-mejor-plan/page.tsx`)
Flujo de perfil del usuario tipo Typeform, **completamente con estado local React** usando `useState` y animaciones de transición entre pasos con `AnimatePresence` de Framer Motion.

| Paso | Descripción |
|:---|:---|
| **Paso 1: Tu Plan Actual** | Select de Isapre actual, nombre del plan, precio mensual en UF |
| **Paso 2: Tu Perfil** | Toggle Solo/Pareja, sexo, edad, ingreso líquido, cargas dinámicas (agregar/quitar), región y email |
| **Paso 3: Resultados** | 3 tarjetas: *Más Económico*, *Recomendado* (destacada y escalada), *Mejor Cobertura* |

**Características de UX destacadas:**
- `AnimatePresence` para transiciones suaves izquierda/derecha entre pasos
- Tarjeta de Pareja aparece/desaparece animada (`height: 0 → auto`)
- Cards de cargas médicas agregables/removibles dinámicamente
- Paso recomendado con `scale-105` y borde `border-[#14dcb4]`

#### `/buscar` — Buscador de Planes (`app/buscar/page.tsx`)
Buscador reactivo en tiempo real con 16 planes pre-cargados (mock data).

**Lógica de búsqueda (`useMemo`):**
- Filtra por nombre del plan, código de plan o nombre de Isapre
- Filtros adicionales por modalidad: *Todos / Libre Elección / Preferente / Cerrado*
- Componente `StarRating` customizado (1-5 estrellas dinámicas con `lucide-react`)
- Estado vacío con CTA hacia `/comparar/isapres`

#### `/comparar/isapres` — Catálogo de Planes
Página de catálogo con filtros avanzados para explorar planes por Isapre.

#### `/como-funciona` y `/faq`
Páginas informativas estáticas.

---

### Componentes UI Reutilizables

#### `PulseFitHero` (`components/ui/pulse-fit-hero.tsx`)
Componente hero altamente configurable. Acepta vía props:

```tsx
<PulseFitHero
  logo="EligeTuPlan"
  navigation={[{ label: "Comparar Planes", href: "/comparar/isapres" }]}
  ctaButton={{ label: "Cotizar Gratis", onClick: () => {} }}
  title="¿Cuál es tu Plan de Salud Ideal?"
  subtitle="Texto descriptivo..."
  primaryAction={{ label: "Comparar Planes Ahora", onClick: () => {} }}
  secondaryAction={{ label: "¿Cómo funciona?", onClick: () => {} }}
  disclaimer="*Sin costo, sin compromisos."
  socialProof={{ avatars: ["url1", "url2"], text: "Más de 10.000 chilenos..." }}
  programs={[{ image: "url", category: "ISAPRE", title: "Banmédica" }]}
/>
```

| Prop | Tipo | Descripción |
|:---|:---|:---|
| `logo` | `string` | Texto del logotipo en el header |
| `navigation` | `NavigationItem[]` | Links del navbar (soporta dropdowns) |
| `ctaButton` | `object` | Botón de acción en el header |
| `title` / `subtitle` | `string` | Contenido hero principal |
| `primaryAction` / `secondaryAction` | `object` | Botones CTA del hero |
| `disclaimer` | `string` | Texto pequeño de aclaración |
| `socialProof` | `object` | Avatars apilados + texto de prueba social |
| `programs` | `ProgramCard[]` | Tarjetas del carrusel animado inferior |
| `children` | `ReactNode` | Reemplaza el contenido central si se pasa |

**Animación del carrusel:** usa `motion.div` de Framer Motion con `animate={{ x: [0, -totalWidth/2] }}` en loop infinito.

#### `InfiniteSlider` (`components/ui/infinite-slider.tsx`)
Carrusel de scrolling infinito. Mide el ancho del contenido con `react-use-measure` y anima con `useMotionValue` de Framer Motion.

```tsx
<InfiniteSlider gap={64} duration={18} durationOnHover={40} className="py-4">
  <Image src="/logos/banmedica-logo.png" ... />
  {/* más items... */}
</InfiniteSlider>
```

| Prop | Tipo | Default | Descripción |
|:---|:---|:---|:---|
| `gap` | `number` | 16 | Espaciado entre elementos |
| `duration` | `number` | 25 | Duración del ciclo en segundos |
| `durationOnHover` | `number` | — | Velocidad al hacer hover (lento) |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Dirección del deslizamiento |
| `reverse` | `boolean` | `false` | Inversión de dirección |

---

### Diseño y Estilos

**Paleta de colores principal:**

| Token | Valor | Uso |
|:---|:---|:---|
| Verde Oscuro | `#0f514b` | Fondos, textos primarios, botones secundarios |
| Verde Acento | `#14dcb4` | CTAs, badges, highlights, bordes activos |
| Fondo Neutro | `#eef2f5` | Background general de la app |
| Fondo Claro | `#f8fafc` | Fondos de páginas internas |

**Tipografía:** `Poppins` (Google Fonts) — usada en todo el sistema de diseño.

**Patrones de animación:**
- Hover en tarjetas: `whileHover={{ y: -8, boxShadow: "..." }}`
- Entrada desde scroll: `whileInView={{ opacity: 1, y: 0 }}` con `viewport={{ once: true }}`
- Transiciones de página: `AnimatePresence` con slide horizontal
- Micro-interacciones: `hover:scale-105`, `hover:-translate-y-0.5` en botones

---

## Backend (`/test/backend`)

### Endpoints de la API

| Método | Ruta | Descripción |
|:---|:---|:---|
| `GET` | `/` | Bienvenida — mensaje de estado |
| `GET` | `/api/v1/health` | Health check — `{ "status": "ok" }` |
| `POST` | `/api/v1/match-plan` | **Core:** recibe perfil del usuario y retorna Top 3 planes recomendados |

> **Documentación interactiva (Swagger):** disponible en `http://localhost:8000/docs`

### Endpoint Core: `POST /api/v1/match-plan`

**Request Body:**
```json
{
  "age": 30,
  "income_clp": 1200000,
  "dependents": 1,
  "preferred_region": "rm"
}
```

**Response (lista de `PlanResponse`):**
```json
[
  {
    "id": "uuid",
    "name": "Plan Máximo Plus",
    "isapre_name": "Banmédica",
    "logo_url": "https://...",
    "price_uf": 4.5,
    "match_score": 95.5
  }
]
```

> ⚠️ **Estado actual:** Si Supabase no está configurado, retorna Mock Data con 2 planes de ejemplo. El algoritmo de scoring real está pendiente de implementación.

### Modelos de Datos (Pydantic)

```python
class MatchPlanRequest(BaseModel):
    age: int
    income_clp: int
    dependents: int
    preferred_region: str = None   # Opcional

class PlanResponse(BaseModel):
    id: str
    name: str
    isapre_name: str
    logo_url: str
    price_uf: float
    match_score: float
```

### Configuración y CORS

```python
origins = [
    "http://localhost:3000",
    "https://landingpage-asesoriasalud.vercel.app",
    # Agregar dominio de Vercel en producción
]
```

Variables de entorno requeridas en `.env`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-public-key
```

---

## Base de Datos (`/test/database`)

### Esquema Relacional

```
isapres ──< planes >── plan_clinica >── clinicas
```

#### `isapres`
| Campo | Tipo | Descripción |
|:---|:---|:---|
| `id` | `UUID` (PK) | Identificador único auto-generado |
| `name` | `VARCHAR(255)` | Nombre de la Isapre |
| `logo_url` | `TEXT` | URL pública del logo |
| `created_at` | `TIMESTAMPTZ` | Timestamp UTC de creación |

#### `planes`
| Campo | Tipo | Descripción |
|:---|:---|:---|
| `id` | `UUID` (PK) | Identificador único |
| `isapre_id` | `UUID` (FK → isapres) | Relación a la Isapre propietaria |
| `name` | `VARCHAR(255)` | Nombre del plan |
| `price_uf` | `DECIMAL(10,2)` | Precio mensual en UF |
| `hospital_coverage` | `DECIMAL(5,2)` | Cobertura hospitalaria % (0-100) |
| `ambulatory_coverage` | `DECIMAL(5,2)` | Cobertura ambulatoria % (0-100) |
| `created_at` | `TIMESTAMPTZ` | Timestamp UTC |

#### `clinicas`
| Campo | Tipo | Descripción |
|:---|:---|:---|
| `id` | `UUID` (PK) | Identificador único |
| `name` | `VARCHAR(255)` | Nombre de la clínica |
| `region` | `VARCHAR(255)` | Región de Chile donde opera |
| `created_at` | `TIMESTAMPTZ` | Timestamp UTC |

#### `plan_clinica` (Many-to-Many)
| Campo | Tipo | Descripción |
|:---|:---|:---|
| `plan_id` | `UUID` (FK → planes) | — |
| `clinica_id` | `UUID` (FK → clinicas) | — |
| `created_at` | `TIMESTAMPTZ` | — |
| **PK** | `(plan_id, clinica_id)` | Llave compuesta |

### Seguridad (Row Level Security)

- **RLS habilitado** en las 4 tablas con `ENABLE ROW LEVEL SECURITY`.
- **Políticas `SELECT` públicas** (lectura libre sin autenticación), dado que los datos son información de dominio público para fines comparativos.
- Las operaciones de escritura (`INSERT`, `UPDATE`, `DELETE`) no tienen políticas públicas, por lo que solo son accesibles con la `service_role` key de Supabase.

---

## Entorno de Producción (`/production`)

El directorio `/production` espejos el contenido de `/test` una vez que las funcionalidades están validadas en QA. Flujo de promoción:

```
test/ → validación → production/
```

Diferencias en producción:
- **Frontend:** Variables de entorno `.env.production` con la URL del backend en Render.
- **Backend:** Configuración WSGI/ASGI optimizada, CORS apuntando al dominio Vercel de producción.
- **Database:** Schema SQL aplicado directamente en el proyecto Supabase de producción (separado del de test).
- **Hosting:** Vercel (frontend) + Render (backend) con CI/CD desde ramas de GitHub.

> **Estado actual:** El directorio `/production/frontend` está vacío — aún no se ha promovido nada.

---

## Cómo Correr el Proyecto

### Frontend

```bash
cd test/frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd test/backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Crear archivo .env con las variables de Supabase
python main.py
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

### Base de Datos

```sql
-- Ejecutar en el SQL Editor de Supabase:
-- test/database/schema.sql
```

---

## Estado del Desarrollo

| Módulo | Estado | Detalle |
|:---|:---|:---|
| 🎨 Frontend — Home | ✅ Completo | Hero, feature cards, slider, stats |
| 🎨 Frontend — `/tu-mejor-plan` | ✅ Completo | Wizard 3 pasos con animaciones y resultados mock |
| 🎨 Frontend — `/buscar` | ✅ Completo | Buscador reactivo con filtros y 16 planes mock |
| 🎨 Frontend — `/comparar/isapres` | 🚧 Parcial | Estructura creada, falta catálogo interactivo |
| ⚙️ Backend — Health & Root | ✅ Completo | Endpoints operativos |
| ⚙️ Backend — `/match-plan` (mock) | ✅ Completo | Retorna datos simulados |
| ⚙️ Backend — `/match-plan` (real) | ❌ Pendiente | Algoritmo de scoring + consulta a Supabase |
| 🗄️ Database — Schema | ✅ Completo | Tablas, FKs, RLS y policies definidas |
| 🗄️ Database — Seed Data | ❌ Pendiente | Datos reales de Isapres y planes |
| 🚀 Producción | ❌ Pendiente | Directorio vacío, no promovido |

---

*Documento generado el 23/03/2026. Proyecto en desarrollo activo.*
