# 🚀 InnoTrack — Guía de Instalación y Configuración

Sistema de gestión de iniciativas de innovación construido con **Next.js + Supabase + Resend**.

---

## 📋 Requisitos previos

Antes de empezar, instala estas dos herramientas:

1. **Node.js** → https://nodejs.org (descarga la versión "LTS")
   - Para verificar que está instalado, abre una terminal y escribe: `node --version`
2. **VS Code** → https://code.visualstudio.com (editor de código, opcional pero recomendado)

---

## 🗂️ Estructura del proyecto

```
innotrack/
├── app/
│   ├── api/
│   │   └── iniciativas/
│   │       ├── route.js          ← GET (listar) y POST (crear)
│   │       └── [id]/route.js     ← PATCH (actualizar estado)
│   ├── form/
│   │   └── page.jsx              ← Formulario de registro
│   ├── dashboard/
│   │   └── page.jsx              ← Dashboard con tabla y gráficas
│   ├── layout.jsx
│   ├── page.jsx                  ← Redirige a /form
│   └── globals.css
├── components/
│   ├── Navbar.jsx
│   └── StatusBadge.jsx
├── lib/
│   ├── supabase.js               ← Cliente de base de datos
│   ├── email.js                  ← Envío de correos con Resend
│   └── constants.js              ← Departamentos, estados, etc.
├── supabase/
│   └── migration.sql             ← Script SQL para crear la tabla
├── .env.local.example            ← Plantilla de variables de entorno
└── package.json
```

---

## ⚙️ Paso 1 — Configurar Supabase (base de datos)

### 1.1 Crear cuenta y proyecto

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Haz clic en **"New project"**
3. Completa:
   - **Name:** `innotrack`
   - **Database Password:** elige una contraseña segura (guárdala)
   - **Region:** `South America (São Paulo)` — la más cercana a Ecuador
4. Espera ~2 minutos mientras el proyecto se crea

### 1.2 Crear la tabla

1. En tu proyecto de Supabase, ve al menú izquierdo → **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega **todo el contenido** del archivo `supabase/migration.sql`
4. Haz clic en **"Run"** (botón verde)
5. Verás el mensaje `Success. No rows returned` — eso es correcto ✅

### 1.3 Obtener las credenciales

1. Ve a **Settings** (ícono de engranaje) → **API**
2. Copia estos dos valores:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public key** → una cadena larga que empieza con `eyJhbGc...`

---

## 📧 Paso 2 — Configurar Resend (emails)

### 2.1 Crear cuenta

1. Ve a https://resend.com y crea una cuenta gratuita
2. El plan gratuito incluye **3.000 emails/mes** — suficiente para empezar

### 2.2 Obtener API Key

1. En el menú, ve a **API Keys**
2. Haz clic en **"Create API Key"**
3. Dale un nombre como `innotrack-prod`
4. Copia la key generada (empieza con `re_...`)

### 2.3 Verificar tu dominio (para producción)

> ⚠️ **Para pruebas locales puedes saltarte este paso** y usar `onboarding@resend.dev` como remitente.

Para enviar desde tu dominio empresarial (`@tuempresa.com`):
1. Ve a **Domains** → **Add Domain**
2. Ingresa tu dominio
3. Agrega los registros DNS que Resend te indique (pídele ayuda a tu equipo de IT)
4. Espera la verificación (puede tomar hasta 48h)

---

## 💻 Paso 3 — Instalar y correr el proyecto localmente

### 3.1 Abrir terminal

- **Windows:** Busca "PowerShell" o "Símbolo del sistema" en el menú inicio
- **Mac:** Abre "Terminal" desde Aplicaciones → Utilidades

### 3.2 Navegar a la carpeta del proyecto

```bash
# Si descargaste el proyecto en tu escritorio:
cd Desktop/innotrack

# Si está en otra carpeta, ajusta la ruta
```

### 3.3 Instalar dependencias

```bash
npm install
```

> Esto descarga todas las librerías necesarias. Puede tomar 1-2 minutos.

### 3.4 Configurar variables de entorno

1. En la carpeta del proyecto, busca el archivo `.env.local.example`
2. **Crea una copia** llamada `.env.local` (sin el `.example`)
3. Ábrelo con cualquier editor de texto y reemplaza los valores:

```env
# Supabase (obtenidos en el Paso 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://TU-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...TU-ANON-KEY

# Resend (obtenido en el Paso 2.2)
RESEND_API_KEY=re_TU-API-KEY

# Email remitente
# Para pruebas: onboarding@resend.dev
# Para producción: correo de tu dominio verificado
EMAIL_FROM=onboarding@resend.dev
EMAIL_REPLY_TO=innovacion@tuempresa.com
```

> ⚠️ **IMPORTANTE:** El archivo `.env.local` nunca debe subirse a GitHub. Contiene credenciales privadas.

### 3.5 Iniciar el servidor de desarrollo

```bash
npm run dev
```

Verás algo como:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.1s
```

4. Abre tu navegador y ve a: **http://localhost:3000**

🎉 **¡El proyecto está corriendo!**

---

## 🌐 Paso 4 — Publicar en internet con Vercel (gratis)

### 4.1 Subir el código a GitHub

1. Crea una cuenta en https://github.com (si no tienes)
2. Crea un nuevo repositorio llamado `innotrack`
3. En tu terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/innotrack.git
git push -u origin main
```

### 4.2 Desplegar en Vercel

1. Ve a https://vercel.com y crea una cuenta con tu cuenta de GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio `innotrack`
4. En la sección **"Environment Variables"**, agrega las mismas variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_REPLY_TO`
5. Haz clic en **"Deploy"**

En 2-3 minutos tendrás una URL pública como:
`https://innotrack-tuempresa.vercel.app`

### 4.3 Dominio personalizado (opcional)

En Vercel → tu proyecto → **Settings → Domains**, puedes agregar tu propio dominio como `innovacion.tuempresa.com`.

---

## 🔄 Flujo de actualización

Cuando necesites hacer cambios al código:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push automáticamente y redesplega en ~1 minuto.

---

## 🛠️ Solución de problemas comunes

| Error | Solución |
|---|---|
| `npm: command not found` | Instala Node.js desde nodejs.org |
| `Error: Invalid URL` en Supabase | Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté correcto en `.env.local` |
| Los emails no llegan | Verifica la `RESEND_API_KEY` y que el dominio esté verificado |
| Pantalla en blanco | Abre la consola del navegador (F12) y busca el error |
| Puerto 3000 en uso | Ejecuta `npm run dev -- --port 3001` |

---

## 📞 Próximos pasos recomendados

- [ ] Agregar **autenticación** con Supabase Auth para proteger el dashboard
- [ ] Subir archivos reales con **Supabase Storage**
- [ ] Agregar **notificación por email** cuando cambia el estado de una iniciativa
- [ ] Configurar un **dominio personalizado** en Vercel

---

*Proyecto generado con InnoTrack — Next.js 14 + Supabase + Resend + Tailwind CSS*
