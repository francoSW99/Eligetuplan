-- Migración 007 — tope imponible de salud en app_meta.
--
-- Renta imponible mensual máxima sobre la que se calcula la cotización legal de
-- salud (7%). La fija la Superintendencia de Pensiones en UF cada año:
--   2026: 90,0 UF  (subió desde 87,8 UF en 2025), vigente desde cotizaciones feb-2026.
--
-- Vive en app_meta (key/value) por la MISMA razón que la UF: es la única fuente de
-- verdad compartida por backend (Cloud Run) y frontend (Vercel), que están en
-- carpetas/deploys aislados y no pueden compartir un archivo de código en la raíz.
-- El cron diario (sync_all.py) la reescribe desde su constante, así que para
-- actualizarla cada año basta cambiar TOPE_IMPONIBLE_SALUD_UF en sync_all.py
-- (o esta fila) — backend y frontend la toman sin redeploy.
--
-- No requiere cambios de schema: app_meta ya es key/value (ver migración 006).

INSERT INTO public.app_meta (key, value) VALUES
  ('tope_imponible_uf', '90')
ON CONFLICT (key) DO NOTHING;
