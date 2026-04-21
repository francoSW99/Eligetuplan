-- Migration 001 — Campos SIS
-- Agregar columnas necesarias para ingestión de datos oficiales de la
-- Superintendencia de Salud (SIS). TODAS las columnas son NULLABLE para
-- no romper registros existentes ni el endpoint /api/v1/match-plan.
--
-- Aplicar manualmente en: Supabase → SQL Editor → Run
-- Idempotente: usa IF NOT EXISTS / IF EXISTS en todos los comandos.

-- ============================================================
-- 1. TABLA: planes — columnas nuevas
-- ============================================================

ALTER TABLE public.planes
  ADD COLUMN IF NOT EXISTS codigo_plan        VARCHAR(64),
  ADD COLUMN IF NOT EXISTS modalidad          VARCHAR(64),
  ADD COLUMN IF NOT EXISTS con_parto          BOOLEAN,
  ADD COLUMN IF NOT EXISTS vigente            BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS fecha_emision      DATE,
  ADD COLUMN IF NOT EXISTS fecha_vigencia     DATE,
  ADD COLUMN IF NOT EXISTS tabla_factores_codigo VARCHAR(32),
  ADD COLUMN IF NOT EXISTS pdf_url            TEXT,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT timezone('utc', now());

-- Permitir NULL en coberturas: SIS no publica % headline por plan.
-- El scorer _safe_float(..., 0.0) ya tolera NULL sin crashear.
ALTER TABLE public.planes
  ALTER COLUMN hospital_coverage  DROP NOT NULL,
  ALTER COLUMN ambulatory_coverage DROP NOT NULL;

-- Eliminar los CHECK constraints que bloquean NULL
-- (los constraints 0-100 siguen aplicando cuando el valor SI está presente)
ALTER TABLE public.planes
  DROP CONSTRAINT IF EXISTS planes_hospital_coverage_check,
  DROP CONSTRAINT IF EXISTS planes_ambulatory_coverage_check;

ALTER TABLE public.planes
  ADD CONSTRAINT planes_hospital_coverage_check
    CHECK (hospital_coverage IS NULL OR (hospital_coverage >= 0 AND hospital_coverage <= 100)),
  ADD CONSTRAINT planes_ambulatory_coverage_check
    CHECK (ambulatory_coverage IS NULL OR (ambulatory_coverage >= 0 AND ambulatory_coverage <= 100));

-- Índice único para upsert idempotente por código SIS
CREATE UNIQUE INDEX IF NOT EXISTS planes_codigo_plan_unique
  ON public.planes (codigo_plan)
  WHERE codigo_plan IS NOT NULL;

-- Índices para filtros de la nueva API
CREATE INDEX IF NOT EXISTS planes_isapre_id_idx  ON public.planes (isapre_id);
CREATE INDEX IF NOT EXISTS planes_modalidad_idx  ON public.planes (modalidad);
CREATE INDEX IF NOT EXISTS planes_price_uf_idx   ON public.planes (price_uf);
CREATE INDEX IF NOT EXISTS planes_vigente_idx    ON public.planes (vigente);

-- ============================================================
-- 2. TABLA: isapres — columnas nuevas
-- ============================================================

ALTER TABLE public.isapres
  ADD COLUMN IF NOT EXISTS slug       VARCHAR(64),
  ADD COLUMN IF NOT EXISTS codigo_sis VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS isapres_slug_unique
  ON public.isapres (slug)
  WHERE slug IS NOT NULL;

-- ============================================================
-- 3. RLS — política de escritura para service_role
--    El script sync_sis.py usa la service_role_key que bypasea
--    RLS automáticamente, así que no se necesita política extra.
--    Documentado aquí para claridad.
-- ============================================================
-- No se agregan políticas de INSERT/UPDATE. La service_role_key
-- bypasea RLS por diseño en Supabase. La anon key sigue siendo
-- solo lectura (SELECT) como antes.
