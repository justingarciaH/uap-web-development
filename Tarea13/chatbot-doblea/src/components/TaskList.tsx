'use client' ;
import { TaskResponse } from "@/models/Task";
import { useState } from "react";

interface TaskListProps {
  tasks: TaskResponse[];
  onTaskUpdate: () => void;
}

export default function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    setIsUpdating(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (response.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    setIsUpdating(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-500/50';
      case 'medium': return 'text-yellow-400 border-yellow-500/50';
      case 'low': return 'text-green-400 border-green-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '⚡';
      case 'medium': return '⚠️';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '🏠';
      case 'shopping': return '🛒';
      case 'health': return '💪';
      default: return '📌';
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Resetear horas para comparación
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return { text: 'Hoy', color: 'text-red-400' };
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return { text: 'Mañana', color: 'text-orange-400' };
    } else if (taskDate < today) {
      return { text: 'Atrasada', color: 'text-red-500 font-bold' };
    } else {
      return { 
        text: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), 
        color: 'text-blue-400' 
      };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-gray-400 text-sm">No hay tareas pendientes</p>
        <p className="text-gray-500 text-xs mt-1">¡Buen trabajo!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📝 Tareas Pendientes
        <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </h3>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {tasks.map((task) => {
          const dueInfo = formatDueDate(task.dueDate);
          const priorityColor = getPriorityColor(task.priority);
          
          return (
            <div
              key={task.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  disabled={isUpdating === task.id}
                  className="mt-0.5 flex-shrink-0"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-500 hover:border-green-500'
                  }`}>
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-200'
                  }`}>
                    {task.title}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Prioridad */}
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityColor}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>

                    {/* Categoría */}
                    <span className="text-xs text-gray-400">
                      {getCategoryIcon(task.category)} {task.category}
                    </span>

                    {/* Fecha límite */}
                    {dueInfo && (
                      <span className={`text-xs ${dueInfo.color}`}>
                        📅 {dueInfo.text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={isUpdating === task.id}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
                  title="Eliminar tarea"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}