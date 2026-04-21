# Eligetuplan Local Setup

Esta guia esta pensada para una persona que esta empezando. La idea es que puedas abrir este proyecto en tu computador y verlo funcionando en tu navegador usando `localhost`.

## Que significa levantar el proyecto en localhost

Este proyecto tiene 2 partes principales:

- Frontend: es la pagina web que vas a ver en el navegador.
- Backend: es la API que hace calculos y entrega datos al frontend.

Para que todo funcione en tu PC, necesitas tener las dos partes corriendo al mismo tiempo.

## Que carpetas importan

Dentro del repo, estas son las carpetas mas importantes:

- `test/frontend`: aqui esta la pagina web.
- `test/backend`: aqui esta la API en Python.
- `test/database/schema.sql`: aqui esta el esquema SQL de la base de datos.

## Que programas debes tener instalados

Antes de empezar, revisa que tengas esto:

- Node.js
- npm
- Python
- PowerShell

Si no estas seguro, puedes probar estos comandos en una terminal:

```powershell
node -v
npm -v
python --version
```

Si esos comandos muestran una version, entonces ya tienes lo necesario.

## Parte 1: Instalacion inicial

Estos pasos normalmente se hacen una sola vez.

### Paso 1. Ir a la carpeta del proyecto

```powershell
cd C:\Users\Hp\Documents\Eligetuplan
```

Que hace este comando:

Te mueve a la carpeta principal del proyecto.

### Paso 2. Crear el entorno virtual de Python

```powershell
python -m venv .venv
```

Que hace este comando:

Crea un entorno aislado para instalar las librerias del backend sin mezclarlo con otros proyectos.

### Paso 3. Activar el entorno virtual

```powershell
.\.venv\Scripts\Activate.ps1
```

Que deberias ver:

Normalmente tu terminal mostrara algo como `(.venv)` al principio de la linea. Eso significa que el entorno esta activo.

Si este paso falla, no te preocupes. Mas abajo hay una alternativa sin activarlo.

### Paso 4. Instalar dependencias del backend

Si el entorno virtual esta activo:

```powershell
pip install -r .\test\backend\requirements.txt
```

Si no quieres activar el entorno virtual o PowerShell lo bloquea:

```powershell
C:\Users\Hp\Documents\Eligetuplan\.venv\Scripts\python.exe -m pip install -r C:\Users\Hp\Documents\Eligetuplan\test\backend\requirements.txt
```

Que hace este comando:

Instala FastAPI, Uvicorn, Supabase y otras librerias del backend.

### Paso 5. Instalar dependencias del frontend

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\frontend
npm install
```

Que hace este comando:

Instala Next.js, React y todas las dependencias del frontend.

## Parte 2: Como levantar el proyecto cada vez que abras el repo

Cada vez que quieras ver el proyecto funcionando, vas a abrir 2 terminales.

- Terminal 1: backend
- Terminal 2: frontend

## Terminal 1: levantar el backend

### Opcion recomendada

```powershell
cd C:\Users\Hp\Documents\Eligetuplan
.\.venv\Scripts\Activate.ps1
cd .\test\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Que hace esto:

1. Entra al proyecto.
2. Activa el entorno virtual.
3. Entra a la carpeta del backend.
4. Inicia la API local en el puerto 8000.

Que deberias ver:

Algo parecido a esto:

```text
Uvicorn running on http://127.0.0.1:8000
```

Eso significa que el backend ya esta funcionando.

### Opcion alternativa, sin activar el entorno virtual

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\backend
C:\Users\Hp\Documents\Eligetuplan\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Terminal 2: levantar el frontend

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\frontend
npm run dev
```

Que hace esto:

Inicia la pagina web en modo desarrollo.

Que deberias ver:

Algo parecido a esto:

```text
Local: http://localhost:3000
```

Eso significa que la web ya esta funcionando.

## Parte 3: Que URL abrir en el navegador

Cuando frontend y backend ya esten corriendo, abre estas URLs:

- Pagina principal: `http://localhost:3000`
- Wizard directo: `http://localhost:3000/tu-mejor-plan`
- API backend: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/api/v1/health`
- Documentacion Swagger: `http://127.0.0.1:8000/docs`

## Parte 4: Como comprobar rapido que todo funciona

Haz esta prueba simple:

1. Levanta el backend.
2. Levanta el frontend.
3. Abre `http://localhost:3000/tu-mejor-plan`.
4. Completa el formulario.
5. Verifica que aparezcan resultados.

Tambien puedes revisar la salud del backend entrando a:

`http://127.0.0.1:8000/api/v1/health`

Si todo esta bien, deberias ver:

```json
{"status":"ok"}
```

## Parte 5: Estado actual del backend

Hoy el backend puede funcionar aunque no configures Supabase real.

Eso significa que:

- si tienes credenciales reales de Supabase, podra intentar usarlas
- si no las tienes, el backend devolvera datos mock para que puedas probar igual el frontend en localhost

Esto es util para desarrollo local y pruebas visuales.

## Parte 6: Si en el futuro quieres usar Supabase real

Crea un archivo `.env` dentro de `test/backend` con este contenido:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave
ALLOWED_ORIGINS=http://localhost:3000
```

Despues de crear ese archivo, apaga y vuelve a levantar el backend.

## Parte 7: Version corta para el dia a dia

Si ya instalaste todo antes, normalmente solo necesitas estos 2 comandos en 2 terminales distintas.

### Backend

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\backend
C:\Users\Hp\Documents\Eligetuplan\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\frontend
npm run dev
```

## Parte 8: Problemas comunes

### Problema 1. `Activate.ps1` no funciona

Solucion:

No actives el entorno. Usa directamente este comando:

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\backend
C:\Users\Hp\Documents\Eligetuplan\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Problema 2. `npm run dev` falla

Solucion:

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\frontend
npm install
```

Despues vuelve a correr:

```powershell
npm run dev
```

### Problema 3. La pagina abre, pero no salen resultados

Solucion:

Revisa que el backend siga corriendo en `http://127.0.0.1:8000`.

### Problema 4. El backend no conecta a Supabase

Eso no bloquea el proyecto local.

El sistema esta preparado para caer a resultados mock mientras no tengas credenciales reales.

## Parte 9: Resumen final

Para ver el proyecto en tu navegador necesitas:

1. levantar el backend
2. levantar el frontend
3. abrir `http://localhost:3000`

Si quieres entrar directo al flujo principal, abre:

`http://localhost:3000/tu-mejor-plan`
