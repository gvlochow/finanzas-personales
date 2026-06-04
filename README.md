# Finanzas Personales

PWA de control de finanzas personales en CLP, construida con Next.js 14, TypeScript, Tailwind CSS y Supabase.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (base de datos PostgreSQL)
- **@ducanh2912/next-pwa** (Progressive Web App)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Las variables ya están en `.env.local`. Si necesitas cambiar el proyecto Supabase, edita ese archivo (copia `.env.example` como guía).

### 3. Aplicar schema en Supabase

1. Ve al [Dashboard de Supabase](https://app.supabase.com) → tu proyecto → SQL Editor
2. Ejecuta el contenido de `sql/schema.sql`
3. Luego ejecuta el contenido de `sql/seed.sql`

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Build de producción

```bash
npm run build
npm start
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard: balance, ingresos/gastos, últimas 5 transacciones |
| `/transactions` | Lista de transacciones del mes con filtros |
| `/transactions/new` | Formulario para nueva transacción |
| `/summary` | Tabla mensual por categoría: ejecutado vs presupuesto |
| `/budgets` | Gestión de presupuestos por categoría y mes |
| `/settings` | Activar/desactivar categorías y medios de pago |

## PWA

La app se puede instalar como PWA en móvil y escritorio. Los íconos en `public/icons/` son SVG placeholder. Para producción, reemplázalos con PNGs de 192×192 y 512×512 y actualiza `public/manifest.json`.

## Convenciones

- Moneda: CLP sin decimales (`$1.864.500`)
- Verde `#16a34a` para ingresos, rojo `#dc2626` para gastos, azul `#1e3a5f` como color principal
- Mobile-first, diseño pensado para pantallas de 375px+
