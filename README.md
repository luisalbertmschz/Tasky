# Tasky - Professional Task Management Dashboard

Una aplicación web moderna y elegante para la gestión de tareas y proyectos, construida con React, TypeScript, Tailwind CSS y Vite.

## 🚀 Características

- **Dashboard Principal**: Vista general con estadísticas, proyectos activos y tareas del día
- **Vista Semanal de Tareas**: Gestión detallada de tareas por usuario con filtros avanzados
- **Vista Kanban**: Organización visual de tareas por estado con drag & drop
- **Sistema de Copia de Tareas**: Copiar tareas entre semanas preservando el historial
- **Gestión de Proyectos**: Seguimiento de proyectos con barras de progreso y equipos
- **Calendario Integrado**: Vista mensual con eventos destacados
- **Sistema de Notificaciones**: Envío de reportes semanales por email
- **Diseño Responsivo**: Interfaz optimizada para todos los dispositivos
- **Tema Moderno**: UI/UX inspirada en las mejores prácticas de diseño

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Estilos**: Tailwind CSS
- **Build Tool**: Vite
- **Iconos**: Lucide React
- **Gestión de Estado**: React Hooks
- **Formularios**: React Hook Form + Zod
- **Drag & Drop**: React Beautiful DnD
- **Linting**: ESLint
- **Formateo**: Prettier (configurado)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/luisalbertmschz/Tasky.git
   cd Tasky
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Configurar Supabase**
   - Crear proyecto en [supabase.com](https://supabase.com)
   - Ejecutar el script `supabase-setup.sql` en el SQL Editor
   - Copiar las credenciales a `env.example` y renombrar a `.env`

4. **Ejecutar en modo desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

5. **Abrir en el navegador**
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
│   ├── LoginForm.tsx   # Formulario de autenticación
│   ├── KanbanView.tsx  # Vista Kanban de tareas
│   └── WeeklyTaskView.tsx
├── lib/                # Configuración de librerías
│   └── supabase.ts     # Cliente de Supabase
├── services/           # Servicios (auth, tasks, email)
│   ├── authService.ts  # Autenticación
│   ├── taskService.ts  # Gestión de tareas
│   └── emailService.ts
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts
├── data/               # Datos mock y utilidades
│   └── mockData.ts
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

### Vista Kanban
- Organización visual por estado
- Drag & drop entre columnas
- Copia de tareas entre semanas
- Historial completo de copias
- Metadatos completos (tickets, comentarios, progreso)

### Sistema de Copia de Tareas
- **Preserva historial**: Las tareas originales nunca se modifican
- **Copiar entre semanas**: Mover tareas a semanas futuras o pasadas
- **Opciones configurables**: Incluir comentarios, resetear estado, etc.
- **Razón de copia**: Documentar por qué se copió la tarea
- **Seguimiento completo**: Historial de todas las copias realizadas

### Gestión de Proyectos
- Seguimiento de progreso
- Equipos asignados
- Fechas límite
- Categorías y colores

## 🎨 Componentes Principales

- **LoginForm**: Formulario de autenticación hermoso tipo Metronic
- **KanbanView**: Vista Kanban completa con drag & drop
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

### Despliegue en Vercel
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🔧 Configuración

### Variables de Entorno
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email Configuration (for production)
VITE_EMAIL_SERVICE_URL=https://your-email-service.com
VITE_EMAIL_API_KEY=your-email-api-key
```

### Base de Datos Supabase
- Ejecutar `supabase-setup.sql` en el SQL Editor
- Configurar Row Level Security (RLS)
- Configurar políticas de acceso

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por [Luis Albert Morla Sanchez](https://github.com/luisalbertmschz) usando las mejores tecnologías web modernas.

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Biblioteca de UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide](https://lucide.dev/) - Iconos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [React Hook Form](https://react-hook-form.com/) - Gestión de formularios
- [Zod](https://zod.dev/) - Validación de esquemas

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

🔗 **Live Demo**: [Próximamente en Vercel]
📧 **Contacto**: [luisalbertmschz@gmail.com]
