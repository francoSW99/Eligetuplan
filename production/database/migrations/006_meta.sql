-- Migración 006 — tabla app_meta (key/value) para datos que cambian con cada sync.
--
-- Única fuente de verdad para el valor de la UF del día y los stats que hoy están
-- hardcodeados en el frontend (ufValueCLP, plansTotal, lastUpdate) y en el env var
-- UF_VALUE_CLP del backend. El cron quincenal (sync_all.py) la actualiza con
-- service_role; backend y frontend la leen en vivo (anon, solo SELECT vía RLS).
--
-- Claves esperadas: valor_uf, valor_uf_fecha, total_planes, last_sync,
--                   planes_agregados, planes_quitados.

CREATE TABLE IF NOT EXISTS public.app_meta (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_meta ENABLE ROW LEVEL SECURITY;

-- Lectura pública (anon). La escritura queda solo para service_role (bypassea RLS).
CREATE POLICY "Allow public read access to app_meta" ON public.app_meta FOR SELECT USING (true);

-- Semilla con los valores vigentes para que /api/v1/meta responda antes del primer cron.
INSERT INTO public.app_meta (key, value) VALUES
  ('valor_uf',       '40374'),
  ('valor_uf_fecha', '2026-05-17'),
  ('total_planes',   '2072'),
  ('last_sync',      '17 may 2026')
ON CONFLICT (key) DO NOTHING;
