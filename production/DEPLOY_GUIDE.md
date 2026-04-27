# ============================================================
# Eligetuplan — Guía de Deploy a Producción
# ============================================================
# Arquitectura:
#   - Frontend:  Vercel      → elige-tuplan.cl
#   - Backend:   Tu PC       → api.elige-tuplan.cl (via Cloudflare Tunnel)
#   - Database:  Supabase    → ya en la nube
#
# Costo mensual: ~$1.250 CLP (solo dominio .cl)
# ============================================================

## PASO 1 — Comprar dominio .cl

1. Ir a https://www.nic.cl o https://puntodenombre.cl
2. Buscar "eligetuplan" → comprar
3. Costo: ~$15.000 CLP/año

## PASO 2 — Crear cuenta Cloudflare y configurar DNS

1. Ir a https://dash.cloudflare.com/sign-up
2. Crear cuenta gratuita
3. Click "Add a site" → escribir "elige-tuplan.cl"
4. Seleccionar plan FREE
5. Cloudflare te dará 2 nameservers del tipo:
   - xxx.ns.cloudflare.com
   - yyy.ns.cloudflare.com
6. Ir a NIC Chile (o tu registrador) → cambiar nameservers a los de Cloudflare
7. Esperar propagación DNS (5-30 min, hasta 48 hrs en casos extremos)

## PASO 3 — Instalar cloudflared en tu PC

PowerShell (admin):
```
winget install Cloudflare.cloudflared
```

## PASO 4 — Crear túnel de Cloudflare

```powershell
# Login a Cloudflare
cloudflared tunnel login

# Crear el túnel
cloudflared tunnel create eligetuplan

# Copiar el archivo JSON de credenciales a la ubicación correcta
# El archivo se crea en %USERPROFILE%\.cloudflared\ elegetuplan.json
# Anotar el TUNNEL_ID que aparece en la consola

# Apuntar DNS: api.elige-tuplan.cl → túnel
cloudflared tunnel route dns eligetuplan api.elige-tuplan.cl
```

## PASO 5 — Configurar DNS en Cloudflare

En el dashboard de Cloudflare → DNS → Records, agregar:

| Type    | Name | Content                    | Proxy |
|---------|------|----------------------------|-------|
| CNAME   | @    | cname.vercel-dns.com       | Sí    |
| CNAME   | www  | cname.vercel-dns.com       | Sí    |
| CNAME   | api  | elegetuplan-xxx.cfargotunnel.com | Sí |

Los primeros 2 son para Vercel (frontend).
El tercero se creó automáticamente en el paso 4.

## PASO 6 — Deploy Frontend en Vercel

1. Ir a https://vercel.com/dashboard
2. Click "Add New Project"
3. Importar repo "francoSW99/Eligetuplan"
4. Root Directory: production/frontend
5. Framework Preset: Next.js (auto-detectado)
6. Environment Variables:
   - NEXT_PUBLIC_API_URL = https://api.elige-tuplan.cl
7. Click "Deploy"
8. Ir a Settings → Domains → agregar: elige-tuplan.cl y www.elige-tuplan.cl

## PASO 7 — Iniciar backend local + túnel

Cada vez que quieras tener la app funcionando:

```powershell
cd C:\Users\Hp\Documents\Eligetuplan
.\production\start_prod.ps1
```

O manualmente:
```powershell
# Terminal 1: Backend
cd production\backend
python -B main.py

# Terminal 2: Tunnel
cloudflared tunnel --config production\tunnel\config.yml run eligetuplan
```

## PASO 8 — Verificar end-to-end

- https://elige-tuplan.cl → Frontend (Vercel)
- https://api.elige-tuplan.cl/api/v1/health → {"status":"ok"}
- https://elige-tuplan.cl/comparar/isapres → Lista planes de Supabase
- https://elige-tuplan.cl/tu-mejor-plan → Wizard funcional

## NOTAS IMPORTANTES

- Tu PC debe estar encendido y conectado a internet para que la API funcione
- Si reinicias el PC, debes volver a ejecutar start_prod.ps1
- Para cuando estés listo para Cloud Run, la carpeta production/backend/ ya tiene el Dockerfile
- Los secrets (SUPABASE_URL, SUPABASE_KEY) NUNCA se suben a GitHub — van en .env o como env vars