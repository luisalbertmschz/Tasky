import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Circle, 
  Mail, 
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';
import { users, weeklyTasks, getCurrentWeekMonday, getWeekRange } from '../data/mockData';
import { EmailService } from '../services/emailService';
import { Task } from '../types';

interface WeeklyTaskViewProps {
  selectedUserId: number;
  onUserChange: (userId: number) => void;
}

const WeeklyTaskView: React.FC<WeeklyTaskViewProps> = ({ selectedUserId, onUserChange }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isNotifying, setIsNotifying] = useState(false);

  const currentWeek = getCurrentWeekMonday();
  const weekRange = getWeekRange(currentWeek);
  const selectedUser = users.find(u => u.id === selectedUserId)!;

  const userTasks = useMemo(() => {
    return weeklyTasks.filter(task => {
      const matchesUser = task.assigneeId === selectedUserId;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesUser && matchesStatus && matchesPriority;
    });
  }, [selectedUserId, filterStatus, filterPriority]);

  const taskStats = useMemo(() => {
    const allUserTasks = weeklyTasks.filter(task => task.assigneeId === selectedUserId);
    return {
      total: allUserTasks.length,
      completed: allUserTasks.filter(t => t.status === 'completed').length,
      inProgress: allUserTasks.filter(t => t.status === 'in-progress').length,
      pending: allUserTasks.filter(t => t.status === 'todo').length,
      totalEstimated: allUserTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActual: allUserTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
    };
  }, [selectedUserId]);

  const handleNotifyTasks = async () => {
    setIsNotifying(true);
    const allUserTasks = weeklyTasks.filter(task => task.assigneeId === selectedUserId);
    await EmailService.sendWeeklyTaskNotification(selectedUser, allUserTasks, currentWeek);
    setIsNotifying(false);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas Semanales</h1>
            <p className="text-gray-500">
              Semana del {weekRange.start} al {weekRange.end}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedUserId}
              onChange={(e) => onUserChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <button
              onClick={handleNotifyTasks}
              disabled={isNotifying}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              <span>{isNotifying ? 'Enviando...' : 'Notify TASK'}</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.longName}</h3>
            <p className="text-sm text-gray-500">{selectedUser.role} • {selectedUser.department}</p>
            <p className="text-sm text-gray-400">{selectedUser.email}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{taskStats.total}</div>
          <div className="text-gray-500">Total de Tareas</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{taskStats.completed}</div>
          <div className="text-gray-500">Completadas</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{taskStats.inProgress}</div>
          <div className="text-gray-500">En Progreso</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{taskStats.totalActual}h</div>
          <div className="text-gray-500">Horas Trabajadas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Tareas</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'todo' | 'in-progress' | 'completed')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="todo">Pendiente</option>
              <option value="in-progress">En Progreso</option>
              <option value="completed">Completado</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {userTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
              <p className="text-gray-500">No se encontraron tareas con los filtros seleccionados.</p>
            </div>
          ) : (
            userTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'EN PROGRESO' : 
                       task.status === 'completed' ? 'COMPLETADO' : 'PENDIENTE'}
                    </span>
                  </div>
                </div>
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTaskView;