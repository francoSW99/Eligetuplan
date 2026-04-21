-- Migración 002 — agregar flag de comercialización oficial SIS
-- col[8] del archivo SIS: "Si Comer." / "No Comer."
-- col[10]: "Individual" | "Grupal"

ALTER TABLE public.planes
  ADD COLUMN IF NOT EXISTS comercializable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tipo_plan VARCHAR(32);

-- Índice para filtrar rápido por planes activos
CREATE INDEX IF NOT EXISTS planes_comercializable_idx
  ON public.planes (comercializable) WHERE comercializable = TRUE;

CREATE INDEX IF NOT EXISTS planes_tipo_plan_idx
  ON public.planes (tipo_plan);
