# HYPERTRO Landing Page

<div align="center">
  <img src="public/logo.png" alt="HYPERTRO Logo" width="120" />
  <h3>La Evolución de tu Entrenamiento</h3>
  <p>Landing page oficial de HYPERTRO - La app que fusiona el seguimiento profesional de hipertrofia con mecánicas RPG</p>
</div>

---

> ⚠️ **Nota:** La aplicación web de HYPERTRO ha sido migrada a una **aplicación móvil nativa**. Este repositorio ahora contiene únicamente la **landing page** promocional.

## 🚀 Sobre HYPERTRO

HYPERTRO es una aplicación móvil de fitness que revoluciona la forma de entrenar, combinando:

- 🎮 **Gamificación RPG** - Sube de nivel, desbloquea rangos y construye tu legado
- 📊 **Seguimiento Profesional** - Registro detallado de entrenamientos y progreso
- 🏆 **Sistema de Logros** - Badges exclusivos y recompensas por tu dedicación
- 📱 **Experiencia Móvil Nativa** - Disponible próximamente en iOS y Android

## 🌐 Landing Page Features

Esta landing page incluye:

- ✨ Diseño moderno con animaciones fluidas (Framer Motion)
- 📱 Responsive design para todos los dispositivos
- 🎨 Estética premium con gradientes y efectos glassmorphism
- 📧 **Sistema de Lista de Espera** con códigos promocionales únicos
- 🔢 Contador de plazas limitadas para fundadores (1000 spots)
- 🗄️ Integración con Supabase para almacenamiento de datos

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Supabase
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Teko, Inter)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/carlosstgg/landingPage-Hypertro.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

## 🔐 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 📄 Base de Datos

Ejecuta el siguiente SQL en Supabase para crear la tabla de waitlist:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  promo_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON waitlist
  FOR INSERT TO anon WITH CHECK (true);
```

## 🎯 Promoción Fundadores

Los primeros 1000 usuarios que se registren en la lista de espera reciben:
- 🏅 Badge exclusivo "Fundador"
- 🎁 1 mes de Premium gratis

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/waitlist/    # API para lista de espera
│   ├── privacy/         # Política de privacidad
│   ├── terms/           # Términos y condiciones
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Página principal
├── components/
│   ├── Hero.tsx         # Sección hero con carousel
│   ├── Features.tsx     # Características de la app
│   ├── Gamification.tsx # Sección de gamificación
│   ├── Navbar.tsx       # Navegación
│   └── Footer.tsx       # Pie de página
└── lib/
    └── supabase.ts      # Cliente de Supabase
```

## 📱 Aplicación Móvil

La aplicación móvil de HYPERTRO está siendo desarrollada y estará disponible próximamente en:
- 📱 App Store (iOS)
- 🤖 Google Play (Android)

## 👨‍💻 Autor

Desarrollado por **Carlos Gallegos**

## 📄 Licencia

Este proyecto es privado y todos los derechos están reservados.

---

<div align="center">
  <strong>HYPERTRO</strong> - Construye tu legado 💪
</div>
