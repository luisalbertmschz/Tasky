export interface User {
  id: string;
  email: string;
  name: string;
  longName: string;
  avatar: string;
  role: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  weekOf: string; // Format: YYYY-MM-DD (Monday of the week)
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100
  ticketNumber?: string; // Service desk ticket
  comments: TaskComment[];
  tags: string[];
  created_at: string;
  updated_at: string;
  // Historial de la tarea
  originalTaskId?: string; // Si es una copia, referencia a la tarea original
  copiedFromWeek?: string; // Semana de donde se copió
  copiedToWeek?: string; // Semana a donde se copió
  copyReason?: string; // Razón de la copia
  copiedBy?: string; // Usuario que copió la tarea
  copyHistory: TaskCopyHistory[]; // Historial completo de copias
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  created_at: string;
  user: User;
}

export interface TaskCopyHistory {
  id: string;
  originalTaskId: string;
  copiedFromWeek: string;
  copiedToWeek: string;
  copyReason: string;
  copiedBy: string;
  copiedAt: string;
  status: 'active' | 'completed' | 'archived';
}

export interface Project {
  id: string;
  name: string;
  category: string;
  progress: number;
  color: string;
  tasks: number;
  daysLeft: number;
  team: string[];
  created_at: string;
  updated_at: string;
}

export interface WeeklyTaskList {
  id: string;
  weekOf: string; // Format: YYYY-MM-DD (Monday of the week)
  userId: string;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface WeeklyTaskSummary {
  userId: string;
  weekOf: string;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

export interface TaskCopyOperation {
  taskId: string;
  fromWeek: string;
  toWeek: string;
  reason: string;
  copiedBy: string;
  copiedAt: string;
  copySettings: {
    includeComments: boolean;
    includeProgress: boolean;
    includeActualHours: boolean;
    resetStatus: boolean;
  };
}

export interface EmailNotification {
  id: string;
  type: 'weekly' | 'daily' | 'urgent';
  recipients: string[];
  subject: string;
  content: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'member' | 'lead' | 'admin';
  permissions: string[];
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

// Tipos para el sistema Kanban
export interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
  tasks: Task[];
  maxTasks?: number; // Límite de tareas por columna
}

export interface KanbanView {
  columns: KanbanColumn[];
  onTaskMove: (taskId: string, fromStatus: Task['status'], toStatus: Task['status']) => void;
  onTaskCopy: (task: Task, targetWeek: string) => void;
  onTaskEdit: (task: Task) => void;
}