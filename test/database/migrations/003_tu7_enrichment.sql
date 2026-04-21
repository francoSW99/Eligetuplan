-- Migración 003 — enriquecimiento desde tu7.cl
-- Aditiva, todas las columnas NULLABLE para no romper INSERTs existentes.

ALTER TABLE public.planes
  ADD COLUMN IF NOT EXISTS tu7_id_plan        VARCHAR(32),
  ADD COLUMN IF NOT EXISTS tu7_activo         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS base_plan_uf       DECIMAL(8,4),
  ADD COLUMN IF NOT EXISTS ges_isapre_uf      DECIMAL(8,4),
  ADD COLUMN IF NOT EXISTS id_zona            SMALLINT,
  ADD COLUMN IF NOT EXISTS pdf_plan           VARCHAR(128),
  ADD COLUMN IF NOT EXISTS pdf_local_path     VARCHAR(256),
  ADD COLUMN IF NOT EXISTS hospitalaria_texto TEXT,
  ADD COLUMN IF NOT EXISTS ambulatoria_texto  TEXT;

-- Índice para el filtro default del API
CREATE INDEX IF NOT EXISTS planes_tu7_activo_idx
  ON public.planes (tu7_activo) WHERE tu7_activo = TRUE;
