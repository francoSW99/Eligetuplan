-- Migración 004 — columnas precomputadas para filtros de cobertura
-- Permite filtrar server-side "planes con cobertura hospitalaria >= X%"

ALTER TABLE public.planes
  ADD COLUMN IF NOT EXISTS cobertura_hosp_max SMALLINT,
  ADD COLUMN IF NOT EXISTS cobertura_amb_max  SMALLINT;

CREATE INDEX IF NOT EXISTS planes_cobertura_hosp_max_idx
  ON public.planes (cobertura_hosp_max);

CREATE INDEX IF NOT EXISTS planes_cobertura_amb_max_idx
  ON public.planes (cobertura_amb_max);
