# Professional Task Management Dashboard

Una aplicación web moderna y elegante para la gestión de tareas y proyectos, construida con React, TypeScript, Tailwind CSS y Vite.

## 🚀 Características

- **Dashboard Principal**: Vista general con estadísticas, proyectos activos y tareas del día
- **Vista Semanal de Tareas**: Gestión detallada de tareas por usuario con filtros avanzados
- **Gestión de Proyectos**: Seguimiento de proyectos con barras de progreso y equipos
- **Calendario Integrado**: Vista mensual con eventos destacados
- **Sistema de Notificaciones**: Envío de reportes semanales por email
- **Diseño Responsivo**: Interfaz optimizada para todos los dispositivos
- **Tema Moderno**: UI/UX inspirada en las mejores prácticas de diseño

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Build Tool**: Vite
- **Iconos**: Lucide React
- **Gestión de Estado**: React Hooks
- **Linting**: ESLint
- **Formateo**: Prettier (configurado)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio-url>
   cd project
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🏗️ Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Construir para producción
- `pnpm preview` - Vista previa de la build
- `pnpm lint` - Ejecutar ESLint

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── WeeklyTaskView.tsx
├── data/               # Datos mock y utilidades
│   └── mockData.ts
├── services/           # Servicios (email, API, etc.)
│   └── emailService.ts
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🎯 Funcionalidades Principales

### Dashboard
- Estadísticas en tiempo real
- Proyectos activos con progreso
- Tareas del día
- Calendario mensual
- Reuniones próximas

### Gestión de Tareas Semanales
- Vista por usuario
- Filtros por estado y prioridad
- Estadísticas de tiempo
- Notificaciones por email
- Tags y categorización

### Gestión de Proyectos
- Seguimiento de progreso
- Equipos asignados
- Fechas límite
- Categorías y colores

## 🎨 Componentes Principales

- **App.tsx**: Componente principal con navegación y layout
- **WeeklyTaskView**: Vista detallada de tareas semanales
- **ProjectCard**: Tarjeta de proyecto con información
- **TaskItem**: Elemento individual de tarea
- **CircularProgress**: Indicador de progreso circular

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (hasta 767px)

## 🚀 Despliegue

### Build de Producción
```bash
pnpm build
```

### Servidor de Vista Previa
```bash
pnpm preview
```

## 🔧 Configuración

### Variables de Entorno
- No se requieren variables de entorno para el desarrollo
- Para producción, configurar servicios de email reales

### Personalización
- Colores y temas en `tailwind.config.js`
- Tipos personalizados en `src/types/index.ts`
- Datos mock en `src/data/mockData.ts`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ usando las mejores tecnologías web modernas.

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Biblioteca de UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide](https://lucide.dev/) - Iconos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
