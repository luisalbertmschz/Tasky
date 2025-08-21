import { User, Task } from '../types';
import { getWeekRange } from '../data/mockData';

export class EmailService {
  // In a real application, this would integrate with an email service like SendGrid, AWS SES, etc.
  static async sendWeeklyTaskNotification(
    user: User,
    tasks: Task[],
    weekOf: string
  ): Promise<boolean> {
    try {
      const weekRange = getWeekRange(weekOf);
      const subject = `Tareas semanales - ${user.longName} - ${weekRange.start} al ${weekRange.end}`;
      
      const emailBody = this.generateEmailBody(user, tasks, weekRange);
      
      // Simulate email sending (in production, integrate with actual email service)
      console.log('📧 Sending email notification...');
      console.log('To:', user.email);
      console.log('Subject:', subject);
      console.log('Body:', emailBody);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success notification
      this.showNotification('success', `Email enviado exitosamente a ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      this.showNotification('error', 'Error al enviar el email');
      return false;
    }
  }

  private static generateEmailBody(
    user: User,
    tasks: Task[],
    weekRange: { start: string; end: string }
  ): string {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const pendingTasks = tasks.filter(t => t.status === 'todo');
    
    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActual = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte Semanal de Tareas</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .task-section { margin: 20px 0; }
        .task-item { background: white; border: 1px solid #e9ecef; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .status-completed { border-left: 4px solid #10B981; }
        .status-in-progress { border-left: 4px solid #F59E0B; }
        .status-todo { border-left: 4px solid #EF4444; }
        .priority-high { color: #EF4444; font-weight: bold; }
        .priority-medium { color: #F59E0B; font-weight: bold; }
        .priority-low { color: #10B981; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Reporte Semanal de Tareas</h1>
        <p>${user.longName} - ${weekRange.start} al ${weekRange.end}</p>
    </div>
    
    <div class="content">
        <div class="summary">
            <h2>📊 Resumen de la Semana</h2>
            <ul>
                <li><strong>Total de tareas:</strong> ${tasks.length}</li>
                <li><strong>✅ Completadas:</strong> ${completedTasks.length}</li>
                <li><strong>🔄 En progreso:</strong> ${inProgressTasks.length}</li>
                <li><strong>⏳ Pendientes:</strong> ${pendingTasks.length}</li>
                <li><strong>⏱️ Horas estimadas:</strong> ${totalEstimated}h</li>
                <li><strong>⏱️ Horas trabajadas:</strong> ${totalActual}h</li>
            </ul>
        </div>

        ${completedTasks.length > 0 ? `
        <div class="task-section">
            <h3>✅ Tareas Completadas</h3>
            ${completedTasks.map(task => `
                <div class="task-item status-completed">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p><strong>Prioridad:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
                    <p><strong>Horas:</strong> ${task.actualHours || 0}h / ${task.estimatedHours || 0}h estimadas</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${inProgressTasks.length > 0 ? `
        <div class="task-section">
            <h3>🔄 Tareas en Progreso</h3>
            ${inProgressTasks.map(task => `
                <div class="task-item status-in-progress">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p><strong>Prioridad:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
                    <p><strong>Fecha límite:</strong> ${new Date(task.dueDate).toLocaleDateString('es-ES')}</p>
                    <p><strong>Progreso:</strong> ${task.actualHours || 0}h / ${task.estimatedHours || 0}h estimadas</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${pendingTasks.length > 0 ? `
        <div class="task-section">
            <h3>⏳ Tareas Pendientes</h3>
            ${pendingTasks.map(task => `
                <div class="task-item status-todo">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p><strong>Prioridad:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
                    <p><strong>Fecha límite:</strong> ${new Date(task.dueDate).toLocaleDateString('es-ES')}</p>
                    <p><strong>Horas estimadas:</strong> ${task.estimatedHours || 0}h</p>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `.trim();
  }

  private static showNotification(type: 'success' | 'error', message: string) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }
}