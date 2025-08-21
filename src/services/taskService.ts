import { supabase } from '../lib/supabase';
import { Task, TaskCopyOperation, TaskCopyHistory } from '../types';
import { addWeeks, startOfWeek, format } from 'date-fns';

export class TaskService {
  // Obtener tareas de una semana específica
  static async getTasksByWeek(userId: string, weekOf: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          comments:task_comments(*)
        `)
        .eq('assignee_id', userId)
        .eq('week_of', weekOf)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tasks by week:', error);
      return [];
    }
  }

  // Obtener tareas de múltiples semanas
  static async getTasksByWeeks(userId: string, weeks: string[]): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          comments:task_comments(*)
        `)
        .eq('assignee_id', userId)
        .in('week_of', weeks)
        .order('week_of', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tasks by weeks:', error);
      return [];
    }
  }

  // Crear nueva tarea
  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee_id: task.assigneeId,
          week_of: task.weekOf,
          due_date: task.dueDate,
          estimated_hours: task.estimatedHours,
          actual_hours: task.actualHours,
          progress: task.progress,
          ticket_number: task.ticketNumber,
          tags: task.tags,
          original_task_id: task.originalTaskId,
          copied_from_week: task.copiedFromWeek,
          copied_to_week: task.copiedToWeek,
          copy_reason: task.copyReason,
          copied_by: task.copiedBy,
          copy_history: task.copyHistory
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Actualizar tarea
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.dueDate,
          estimated_hours: updates.estimatedHours,
          actual_hours: updates.actualHours,
          progress: updates.progress,
          ticket_number: updates.ticketNumber,
          tags: updates.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  // Copiar tarea a otra semana
  static async copyTask(
    task: Task, 
    targetWeek: string, 
    copySettings: TaskCopyOperation['copySettings'],
    reason: string,
    copiedBy: string
  ): Promise<Task | null> {
    try {
      // Crear nueva tarea copiada
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        ...task,
        weekOf: targetWeek,
        status: copySettings.resetStatus ? 'todo' : task.status,
        progress: copySettings.resetStatus ? 0 : task.progress,
        actualHours: copySettings.includeActualHours ? task.actualHours : 0,
        comments: copySettings.includeComments ? task.comments : [],
        copiedFromWeek: task.weekOf,
        copiedToWeek: targetWeek,
        copyReason: reason,
        copiedBy: copiedBy,
        copyHistory: [
          ...task.copyHistory,
          {
            id: crypto.randomUUID(),
            originalTaskId: task.originalTaskId || task.id,
            copiedFromWeek: task.weekOf,
            copiedToWeek: targetWeek,
            copyReason: reason,
            copiedBy: copiedBy,
            copiedAt: new Date().toISOString(),
            status: 'active'
          }
        ]
      };

      // Crear la tarea copiada
      const copiedTask = await this.createTask(newTask);
      
      if (copiedTask) {
        // Actualizar el historial de copias en la tarea original
        await this.updateTaskCopyHistory(task.id, newTask.copyHistory);
      }

      return copiedTask;
    } catch (error) {
      console.error('Error copying task:', error);
      return null;
    }
  }

  // Actualizar historial de copias de una tarea
  static async updateTaskCopyHistory(taskId: string, copyHistory: TaskCopyHistory[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          copy_history: copyHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task copy history:', error);
      return false;
    }
  }

  // Mover tarea entre estados (mismo usuario, misma semana)
  static async moveTaskStatus(taskId: string, newStatus: Task['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error moving task status:', error);
      return false;
    }
  }

  // Eliminar tarea
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Obtener semanas disponibles (pasadas, actual y futuras)
  static getAvailableWeeks(currentWeek: string, weeksCount: number = 8): string[] {
    const weeks: string[] = [];
    const currentDate = new Date(currentWeek);
    
    // Semanas pasadas
    for (let i = weeksCount / 2; i > 0; i--) {
      const pastWeek = startOfWeek(addWeeks(currentDate, -i), { weekStartsOn: 1 });
      weeks.push(format(pastWeek, 'yyyy-MM-dd'));
    }
    
    // Semana actual
    weeks.push(currentWeek);
    
    // Semanas futuras
    for (let i = 1; i <= weeksCount / 2; i++) {
      const futureWeek = startOfWeek(addWeeks(currentDate, i), { weekStartsOn: 1 });
      weeks.push(format(futureWeek, 'yyyy-MM-dd'));
    }
    
    return weeks;
  }

  // Obtener estadísticas de tareas por semana
  static async getTaskStatsByWeek(userId: string, weekOf: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    totalEstimated: number;
    totalActual: number;
  }> {
    try {
      const tasks = await this.getTasksByWeek(userId, weekOf);
      
      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        pending: tasks.filter(t => t.status === 'todo').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        totalEstimated: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
        totalActual: tasks.reduce((sum, t) => sum + t.actualHours, 0)
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        blocked: 0,
        totalEstimated: 0,
        totalActual: 0
      };
    }
  }

  // Buscar tareas por texto
  static async searchTasks(userId: string, searchTerm: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          comments:task_comments(*)
        `)
        .eq('assignee_id', userId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ticket_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  }

  // Obtener tareas por prioridad
  static async getTasksByPriority(userId: string, priority: Task['priority']): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          comments:task_comments(*)
        `)
        .eq('assignee_id', userId)
        .eq('priority', priority)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return [];
    }
  }
}
