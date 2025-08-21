import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Tag, 
  MessageSquare, 
  Copy,
  Edit,
  Trash2,
  Calendar,
  User,
  Target
} from 'lucide-react';
import { Task, KanbanColumn, KanbanView as KanbanViewType } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface KanbanViewProps {
  columns: KanbanColumn[];
  onTaskMove: (taskId: string, fromStatus: Task['status'], toStatus: Task['status']) => void;
  onTaskCopy: (task: Task, targetWeek: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  currentWeek: string;
  availableWeeks: string[];
}

const KanbanView: React.FC<KanbanViewProps> = ({
  columns,
  onTaskMove,
  onTaskCopy,
  onTaskEdit,
  onTaskDelete,
  currentWeek,
  availableWeeks
}) => {
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [copySettings, setCopySettings] = useState({
    targetWeek: '',
    reason: '',
    includeComments: true,
    includeProgress: false,
    includeActualHours: false,
    resetStatus: true
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Misma columna - solo reordenar
      return;
    }

    // Diferente columna - cambiar estado
    const fromStatus = source.droppableId as Task['status'];
    const toStatus = destination.droppableId as Task['status'];
    
    onTaskMove(draggableId, fromStatus, toStatus);
  };

  const openCopyModal = (task: Task) => {
    setSelectedTask(task);
    setCopySettings({
      targetWeek: '',
      reason: '',
      includeComments: true,
      includeProgress: false,
      includeActualHours: false,
      resetStatus: true
    });
    setCopyModalOpen(true);
  };

  const handleCopyTask = () => {
    if (selectedTask && copySettings.targetWeek) {
      onTaskCopy(selectedTask, copySettings.targetWeek);
      setCopyModalOpen(false);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatWeek = (weekDate: string) => {
    const date = new Date(weekDate);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 4);
    
    return `${format(date, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header del Kanban */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vista Kanban</h2>
          <p className="text-gray-600">Organiza y visualiza tus tareas por estado</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Semana actual: {formatWeek(currentWeek)}
          </span>
        </div>
      </div>

      {/* Tablero Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              {/* Header de la columna */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Tareas de la columna */}
              <Droppable droppableId={column.status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            {/* Header de la tarea */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {task.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => openCopyModal(task)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                                  title="Copiar tarea"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onTaskEdit(task)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600"
                                  title="Editar tarea"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {onTaskDelete && (
                                  <button
                                    onClick={() => onTaskDelete(task.id)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                                    title="Eliminar tarea"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Descripción */}
                            {task.description && (
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Metadatos de la tarea */}
                            <div className="space-y-2">
                              {/* Prioridad y Estado */}
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                  {task.status === 'in-progress' ? 'EN PROGRESO' : 
                                   task.status === 'completed' ? 'COMPLETADO' : 
                                   task.status === 'blocked' ? 'BLOQUEADO' : 'PENDIENTE'}
                                </span>
                              </div>

                              {/* Progreso */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Progreso</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Información adicional */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="w-3 h-3" />
                                  <span>{task.actualHours}h</span>
                                </div>
                              </div>

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                      +{task.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Ticket y comentarios */}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                {task.ticketNumber && (
                                  <div className="flex items-center space-x-1">
                                    <Tag className="w-3 h-3" />
                                    <span>#{task.ticketNumber}</span>
                                  </div>
                                )}
                                {task.comments && task.comments.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                              </div>

                              {/* Fecha límite */}
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(task.dueDate), 'dd MMM', { locale: es })}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal para copiar tarea */}
      {copyModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Copiar Tarea
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarea a copiar
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedTask.title}</p>
                  <p className="text-sm text-gray-600">{selectedTask.description}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semana destino
                </label>
                <select
                  value={copySettings.targetWeek}
                  onChange={(e) => setCopySettings({...copySettings, targetWeek: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar semana</option>
                  {availableWeeks.map((week) => (
                    <option key={week} value={week}>
                      {formatWeek(week)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de la copia
                </label>
                <textarea
                  value={copySettings.reason}
                  onChange={(e) => setCopySettings({...copySettings, reason: e.target.value})}
                  placeholder="¿Por qué necesitas copiar esta tarea?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opciones de copia</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={copySettings.includeComments}
                      onChange={(e) => setCopySettings({...copySettings, includeComments: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Incluir comentarios</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={copySettings.resetStatus}
                      onChange={(e) => setCopySettings({...copySettings, resetStatus: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Reiniciar estado a 'Pendiente'</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setCopyModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCopyTask}
                disabled={!copySettings.targetWeek}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Copiar Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanView;
