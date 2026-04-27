# 🎫 HelpDesk Pro
### Enterprise-Grade Ticket Management System

**HelpDesk Pro** es una plataforma robusta de gestión de incidentes diseñada para optimizar el soporte técnico organizacional. Desarrollada con un stack moderno (**React 19, TypeScript 6 y MUI 9**), ofrece una experiencia de usuario fluida, segura y multi-idioma para entornos corporativos dinámicos.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Material UI](https://img.shields.io/badge/Material_UI-9.0-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![I18n: ES/EN](https://img.shields.io/badge/I18n-ES%20%7C%20EN-blueviolet)](https://www.i18next.com/)

## 🚀 Características

### 🏢 Aislamiento Organizacional (Multi-tenancy)
- **Seguridad de Datos**: Cada organización opera en un entorno aislado, gestionando sus propios tickets, agentes y configuraciones.
- **Auth Demo**: Sistema de login y registro personalizado por organización.

### ✨ Nuevas Funcionalidades (v2.0)
- **Modo Oscuro/Claro**: Toggle entre temas con persistencia en localStorage y transiciones suaves
- **Navbar Fijo**: Barra superior fija con efecto cristal (backdrop blur) y animaciones
- **Footer Personalizado**: Pie de página con info de derechos y desarrollador
- **Animaciones Mejoradas**: Efectos hover, transiciones de página, tarjetas con elevación
- **Contraste Mejorado**: Modo oscuro con textos claros y bordes definidos; modo claro con gradientes coloridos
- **Internacionalización**: Soporte completo en Español e Inglés
- **Gestión de Agentes**: Cada organización puede agregar/eliminar sus propios agentes
- **Asignación de Tickets**: Asignar tickets a agentes específicos
- **Dashboard Estadístico**: Visualización de métricas con gráficos
  - Tickets por prioridad (gráfico de barras)
  - Tickets por área (tabla)
  - Tickets por agente (ranking)
  - Resumen de estados con cards animadas
- **Exportación de Datos Avanzada**: 
  - **CSV**: Generación de `tickets-en-csv.csv` con codificación UTF-8.
  - **PDF**: Reportes profesionales en `tickets-en-pdf.pdf` usando `jspdf-autotable`.
- **Wizard de Creación**: Formulario multi-paso mejorado con preview

### 🛠️ Funcionalidades Base
- **Gestión de Tickets**: Crear, visualizar, editar y cerrar tickets de soporte
- **Filtros Avanzados**: Filtrado por estado, prioridad, área, sector, agente y rango de fechas
- **Categorización**: Áreas y sectores personalizables (Hardware, Software, Redes, etc.)
- **Prioridades**: Asignación de prioridades Alta, Media, Baja
- **Estados**: Seguimiento en tiempo real (Abierto, En Progreso, Cerrado)
- **Persistencia Local**: Almacenamiento en localStorage para datos offline
- **Diseño Responsive**: Interfaz moderna y adaptable con Material Design

## 💻 Stack Tecnológico

| Capa | Tecnología |
|------------|---------|
| **UI Framework** | React 19.2 (Hooks, Context, Memo) |
| **Typing** | TypeScript 6.0 (Strict Mode) |
| **Styling** | MUI 9.0 (Custom Theme, Emotion) |
| **Routing** | React Router DOM 7.14 |
| **I18n** | i18next & react-i18next |
| **Export** | jsPDF, jspdf-autotable |
| **Utilities** | date-fns, UUID v14, Vite 8 |

## 🎨 UI/UX Design System

### Modos de Tema
- **Claro**: Gradiente sutil, tarjetas con sombras suaves y tipografía `Inter`.
- **Oscuro**: Interfaz profunda, contrastes optimizados y efectos de desenfoque (glassmorphism).

### Identificación Visual de Acciones
- 🟩 **Exportar CSV**: Botón verde éxito
- 🟥 **Exportar PDF**: Botón rojo 
- 🟦 **Filtros**: Botón azul eléctrico dinámico cuando está activo o abierto.

### Animaciones
- **Tarjetas**: Elevación hover (translateY -4px) + sombra dinámica + borde colorido
- **Botones**: Elevación hover (translateY -2px) + sombra con gradiente azul
- **Navegación**: Iconos con scale(1.1) en hover; tabs con subrayado animado
- **Fondo**: Elementos decorativos flotantes con animación suave (float 20-25s)

## 📦 Arquitectura de Archivos

```text
src/
├── components/        # Componentes reutilizables (Cards, Layout, Lists)
├── context/           # Estado global (Auth, Organizaciones, Tema)
├── hooks/             # Lógica de negocio y persistencia (useTickets)
├── i18n/              # Configuración de idiomas (ES/EN)
├── pages/             # Vistas principales (Dashboard, Tickets, Login)
├── types/             # Definiciones de tipos TypeScript
└── App.tsx            # Rutas y configuración de Providers
```

## 🔧 Instalación y Configuración

### Requisitos Previos
- Node.js (v18.0.0 o superior)
- npm o yarn

### Pasos de Ejecución
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/help-desk.git
   cd help-desk
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. **Compilación para producción:**
   ```bash
   npm run build
   ```

## 🌐 Internacionalización (I18n)

La aplicación detecta automáticamente la preferencia del navegador pero permite el cambio manual mediante el botón de traducción en el Navbar.
- **Soporte completo**: Todos los mensajes, prioridades, estados y headers de tablas se traducen en tiempo real.
- **Persistencia**: El idioma seleccionado se guarda en `localStorage`.

## 📊 Generación de Reportes

- El sistema permite exportar el conjunto de datos **actualmente filtrado**.
- Los nombres de los archivos están normalizados para facilitar su gestión:
  - **CSV**: Estructura plana ideal para Excel o Google Sheets.
  - **PDF**: Estructura visual con encabezados de columna automáticos.

---

**Desarrollado por Miguel Rodríguez**  
*HelpDesk Pro - Tu solución inteligente para la gestión de soporte técnico.*

2. **Crea una rama** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit cambios** (`git commit -m 'feat: agregar XYZ'`)
4. **Push a la rama** (`git push origin feature/nueva-funcionalidad`)
5. **Abre un Pull Request** describiendo los cambios
