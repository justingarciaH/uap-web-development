//definimos las 5 herramientas para el llm
import { tool } from 'ai';
import { z } from 'zod';

// definicion de la herramienta para crear tareas

const createTaskParams = z.object({
    title: z.string().describe('Título o descripción de la tarea'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Nivel de Prioridad de la tarea'),
    dueDate: z.string().optional().describe('Fecha limite en formato ISO (YYYY-MM-DD)'),
    category: z.enum(['work', 'personal', 'shopping', 'other']).optional().describe('Categoría de la tarea'),
});
// type CreateTaskParams = z.infer<typeof createTaskParams>;

export const createTaskTool = tool({
    description: 'Crea una nueva tarea en el sistema. Usar cuando el usuario quiera agregar, crear o anotar una nueva tarea.',
    inputSchema: createTaskParams,
    async execute(args, options) {
        const { title, priority, dueDate, category } = args;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, priority, dueDate, category }),
                signal: options?.abortSignal
            });
            const data = await response.json();

            if (!data.success) {
                return { success: false, error: data.error || 'Error al crear la tarea' };
            }

            return { success: true, task: data.task, message: `Tarea creada: "${data.task.title}"`};
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
});

//ACTUALIZAR 

interface Task {
    id: string;
    title: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    category?: 'work' | 'personal' | 'shopping' | 'health' | 'other';
    [key: string]: any;
}

interface UpdateTaskParams {
    taskId: string;
    title?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    category?: 'work' | 'personal' | 'shopping' | 'health' | 'other';
}

interface UpdateTaskResponse {
    success: boolean;
    task?: Task;
    error?: string;
}

const updateTaskParams = z.object({
    taskId: z.string().describe('ID único de la tarea a actualizar'),
    title: z.string().optional().describe('Nuevo título de la tarea'),
    completed: z.boolean().optional().describe('Estado de completitud (true para completada, false para pendiente)'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Nueva prioridad'),
    dueDate: z.string().optional().describe('Nueva fecha límite en formato ISO'),
    category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).optional().describe('Nueva categoría')
});
type UpdateTaskParamsType = z.infer<typeof updateTaskParams>;

export const updateTaskTool = tool({
    description: 'Actualizar una tarea existente (cambiar título, completar, cambiar prioridad, etc). Usar cuando el usuario quiera modificar o marcar como completada una tarea.',
    inputSchema: updateTaskParams,
    async execute(args, options) {
        try {
            const { taskId, ...updates } = args;
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                signal: options?.abortSignal
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, error: data.error };
            }

            return {
                success: true,
                task: data.task,
                message: `Tarea actualizada: "${data.task?.title}"`
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
});


//ELIMINAR
const deleteTaskParams = z.object({
    taskId: z.string().describe('ID único de la tarea a eliminar')
});
type DeleteTaskParams = z.infer<typeof deleteTaskParams>;

export const deleteTaskTool = tool({
    description: 'Eliminar permanentemente una tarea del sistema. Usar cuando el usuario quiera borrar o eliminar una tarea.',
    inputSchema: deleteTaskParams,
    async execute(args, options) {
        const { taskId } = args;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: options?.abortSignal
            });
            const data = await response.json();
            if (!data.success) {
                return { success: false, error: data.error };
            }
            return {
                success: true,
                message: `Tarea eliminada: "${data.taskTitle}"`
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
});


//BUSCAR LAS TAREAS
export interface SearchTasksParams {
    query?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    category?: 'work' | 'personal' | 'shopping' | 'health' | 'other';
    sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
}

export interface SearchTasksResponse {
    success: boolean;
    tasks?: Task[];
    total?: number;
    hasMore?: boolean;
    error?: string;
}

const searchTasksParams = z.object({
    query: z.string().optional().describe('Texto de búsqueda en el título de la tarea'),
    completed: z.boolean().optional().describe('Filtrar por estado (true para completadas, false para pendientes)'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Filtrar por prioridad'),
    category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).optional().describe('Filtrar por categoría'),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional().describe('Campo por el que ordenar'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Orden ascendente o descendente'),
    limit: z.number().optional().describe('Número máximo de resultados')
});
type SearchTasksParamsType = z.infer<typeof searchTasksParams>;

export const searchTasksTool = tool({
    description: 'Buscar, filtrar, y listar las tareas según diversos criterios. Usar cuando el usuario quiera ver sus tareas, buscar tareas especificas, o filtrar por estado/prioridad/categoría.',
    inputSchema: searchTasksParams,
    async execute(args, options) {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(args).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks?${queryParams.toString()}`, {
                signal: options?.abortSignal
            });
            const data = await response.json();

            if (!data.success) {
                return { success: false, error: data.error };
            }

            return {
                success: true,
                tasks: data.tasks,
                total: data.total,
                hasMore: data.hasMore
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
});


//OBTENER ESTADISTICAS DE LAS TAREAS
const getTaskStatsParams = z.object({
        period: z.enum(['today', 'week', 'month', 'year', 'all-time']).optional().describe('Periodo de tiempo para las estadísticas')
});
type GetTaskStatsParams = z.infer<typeof getTaskStatsParams>;

export const getTaskStatsTool = tool({
        description: 'Obtener estadisticas y analytics de productividad del usuario. Usar cuando el usuario pregunte sobre su productividad, cuantas tareas ha completado, o quiera ver estadísticas.',
        inputSchema: getTaskStatsParams,
        async execute(args, options) {
                const { period } = args;
                try {
                        const queryParams = period ? `?period=${period}` : '';
                        const response = await fetch(
                                `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks/stats${queryParams}`,
                                { signal: options?.abortSignal }
                        );

                        const data = await response.json();

                        if (!data.success) {
                                return { success: false, error: data.error };
                        }

                        return {
                                success: true,
                                stats: data
                        };
                } catch (error: any) {
                        return { success: false, error: error.message };
                }
        }
});

// exportamos todas las tooll callings 
export const allTools = {
  createTask: createTaskTool,
  updateTask: updateTaskTool,
  deleteTask: deleteTaskTool,
  searchTasks: searchTasksTool,
  getTaskStats: getTaskStatsTool
};
