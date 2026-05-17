-- Migración 005 — enriquecer tabla clinicas con datos de tu7.cl /Api/data/prestadores/
--
-- tu7.cl expone 71 prestadores con: ID_PRESTADOR, NOMBRE_PRESTADOR, LOGO (filename),
-- ZONAS (CSV de ids), HOSPITALARIA (0/1), AMBULATORIA (0/1), SHOW (0/1).
--
-- region pasa a NULLABLE porque tu7 entrega zonas (id_zona via CSV), no region.

ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS tu7_id_prestador   INTEGER UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_filename      TEXT,
  ADD COLUMN IF NOT EXISTS zonas              TEXT,
  ADD COLUMN IF NOT EXISTS cubre_hospitalaria BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cubre_ambulatoria  BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS visible            BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.clinicas
  ALTER COLUMN region DROP NOT NULL;

CREATE INDEX IF NOT EXISTS clinicas_tu7_id_prestador_idx
  ON public.clinicas (tu7_id_prestador);

CREATE INDEX IF NOT EXISTS clinicas_visible_idx
  ON public.clinicas (visible) WHERE visible = TRUE;
