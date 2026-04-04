# 🚀 Project Name: Eligetuplan
**Role:** Expert Full Stack Web Developer & UI/UX Specialist.
**Goal:** Act as an autonomous AI coding agent to build a highly optimized, Mobile-First Insurtech platform (a clone of QuePlan.cl's core Isapre features).

---

## 🎯 1. Mission & Context
The objective is to build **Eligetuplan**, a professional B2C platform to compare health insurance plans (Isapres) in Chile. 
The system must be blazing fast, SEO-optimized, and specifically designed for mobile devices to reduce cognitive load during complex financial/health decisions.

**Core Sections to Build:**
* `/` (Home): Landing page with immediate search/lead capture.
* `/Comparar/Isapres`: Catalog with filters.
* `/Tu-Mejor-Plan`: Step-by-step wizard (Typeform style) to profile the user.
* `/buscar`: Dynamic results based on the matching algorithm.

---

## 💻 2. Technology Stack
The project uses a decoupled, modern architecture:

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) + TypeScript | SSR for SEO, dynamic routing, type safety. |
| **Styling & UI** | Tailwind CSS + Shadcn UI | Mobile-first utility classes, accessible and fast UI components. |
| **Backend API** | Python (FastAPI) | High performance for mathematical scoring algorithms and data processing. |
| **Database** | Supabase (PostgreSQL) | Relational database for complex healthcare plan queries. |
| **Hosting (Target)** | Vercel (Front) + Render (Back) | Automated CI/CD pipelines via GitHub integration. |

---

## 📂 3. Strict Directory Structure (Monorepo)
The project MUST be contained within a single root folder named `Eligetuplan`, strictly divided into `test` (for development, bug fixing, and QA) and `production` (the final code to be deployed). 

Follow this exact tree structure:

```text
Eligetuplan/
├── test/                       # 🛠️ Development & Staging Environment
│   ├── frontend/               # Next.js app (test environment variables)
│   ├── backend/                # FastAPI app (test endpoints & DB connection)
│   └── database/               # Supabase local migrations & seed data (mock data)
│
└── production/                 # 🚀 Production Environment (Deployment Ready)
    ├── frontend/               # Next.js app (production optimized)
    ├── backend/                # FastAPI app (production WSGI/ASGI settings)
    └── database/               # Production SQL schema & migrations


### 🏗️ 4. Architecture & Technical Requirements

#### 📱 A. Frontend (Next.js / Vercel)
* **Mobile-First Approach:** Implement off-canvas menus for complex filters on mobile. Use large, touch-friendly touch targets (min 44x44px).
* **State Management:** Use React Context or Zustand for the `/Tu-Mejor-Plan` multi-step wizard to store user profile data temporarily.
* **Performance:** Implement Skeleton Loaders for data fetching. Use `next/image` for Isapre logos.
* **Routing:** * `app/page.tsx` (Home)
  * `app/comparar/isapres/page.tsx`
  * `app/tu-mejor-plan/page.tsx`
  * `app/buscar/page.tsx`

#### ⚙️ B. Backend (Python FastAPI / Render)
* **API Gateway:** Create RESTful endpoints under `/api/v1/...`.
* **Core Algorithm Endpoint:** Create a `POST /api/v1/match-plan` endpoint that receives user JSON payload (age, income, dependents) and calculates a mathematical score to return the Top 3 Isapre plans.
* **CORS:** Strictly configure CORS middleware to only accept requests from the Vercel frontend domains.
* **Documentation:** Utilize FastAPI's auto-generated Swagger UI (`/docs`) for easy frontend integration.

#### 🗄️ C. Database (Supabase / PostgreSQL)
Create the following relational schema:
* **isapres table:** `id` (UUID), `name` (String), `logo_url` (String).
* **planes table:** `id` (UUID), `isapre_id` (FK), `name` (String), `price_uf` (Decimal), `hospital_coverage` (Percentage), `ambulatory_coverage` (Percentage).
* **clinicas table:** `id` (UUID), `name` (String), `region` (String).
* **plan_clinica table:** Many-to-many relationship mapping plans to preferred clinics.

### 🚦 5. Execution Instructions for the AI Agent
* **Initialize:** Start by scaffolding the `test/` directory.
* **Database First:** Generate the SQL statements for Supabase inside `test/database/schema.sql`.
* **Backend Second:** Setup the FastAPI boilerplate in `test/backend/`, including the Supabase Python client connection.
* **Frontend Third:** Initialize the Next.js app in `test/frontend/`, configure Tailwind and Shadcn, and connect to the local Python API.
* **Refactor & Promote:** Only after features are validated in the `test/` folder, mirror the stable, production-ready code into the `production/` folder with the appropriate `.env.production` configurations.