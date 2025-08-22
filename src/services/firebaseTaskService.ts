import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, TaskCopyOperation, TaskCopyHistory } from '../types';
import { addWeeks, startOfWeek, format } from 'date-fns';

export class FirebaseTaskService {
  // Obtener tareas de una semana específica
  static async getTasksByWeek(userId: string, weekOf: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('assigneeId', '==', userId),
        where('weekOf', '==', weekOf),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by week:', error);
      return [];
    }
  }

  // Obtener tareas de múltiples semanas
  static async getTasksByWeeks(userId: string, weeks: string[]): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('assigneeId', '==', userId),
        where('weekOf', 'in', weeks),
        orderBy('weekOf', 'desc'),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by weeks:', error);
      return [];
    }
  }

  // Crear nueva tarea
  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    try {
      const taskData = {
        ...task,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      const newTask = await getDoc(docRef);
      
      if (newTask.exists()) {
        return { id: newTask.id, ...newTask.data() } as Task;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Actualizar tarea
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
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
      const batch = writeBatch(db);
      
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

      // Agregar la nueva tarea al batch
      const newTaskRef = doc(collection(db, 'tasks'));
      batch.set(newTaskRef, {
        ...newTask,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Actualizar el historial de copias en la tarea original
      const originalTaskRef = doc(db, 'tasks', task.id);
      batch.update(originalTaskRef, {
        copyHistory: newTask.copyHistory,
        updated_at: serverTimestamp()
      });

      // Ejecutar el batch
      await batch.commit();

      // Obtener la tarea copiada
      const copiedTaskDoc = await getDoc(newTaskRef);
      if (copiedTaskDoc.exists()) {
        return { id: copiedTaskDoc.id, ...copiedTaskDoc.data() } as Task;
      }

      return null;
    } catch (error) {
      console.error('Error copying task:', error);
      return null;
    }
  }

  // Mover tarea entre estados (mismo usuario, misma semana)
  static async moveTaskStatus(taskId: string, newStatus: Task['status']): Promise<boolean> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error moving task status:', error);
      return false;
    }
  }

  // Eliminar tarea
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
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
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('assigneeId', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        if (
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.ticketNumber && task.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          tasks.push(task);
        }
      });
      
      return tasks;
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  }

  // Obtener tareas por prioridad
  static async getTasksByPriority(userId: string, priority: Task['priority']): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('assigneeId', '==', userId),
        where('priority', '==', priority),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return [];
    }
  }
}
