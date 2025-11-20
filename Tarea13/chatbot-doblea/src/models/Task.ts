import mongoose, { Schema, Document, Model} from "mongoose";

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' |'others';


export interface TaskResponse {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
    category: Category;
    dueDate?: string;
}


export interface ITask extends Document {
  title: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: Date;
  userId: string; //por ahora no uso
  deleted: boolean; //para el soft delete
}

const TaskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [ true, 'El titulo es requerido'],
            trim: true,
            minlength: [1, 'El titulo no puede estar vacio'],
            maxlength: [100, 'El titulo no puede ser tan largo']
        },
        completed: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        category: {
            type: String,
            enum: ['work', 'personal', 'shopping', 'health', 'others'],
            default: 'personal'
        },
        dueDate: {
            type: Date,
            validate: {
                validator: function(value: Date) {
                    // permitir null/undefined, pero si hay fecha, debe ser futura o hasta hoy
                    if (!value) return true;
                    return value >= new Date(new Date().setHours(0,0,0,0));
                },
                message: 'La fecha de vencimiento no puede ser pasada'
            }
        },
        userId: {
            type: String,
            default: 'default-user', //por ahora no uso
            index: true
        },
        deleted: {
            type: Boolean,
            default: false,
            index: true
        }
    }
);

// indices para mejorar performance de busquedas para la busqueda de mongo
// 1 significa orden ascendente -1 orden descendente
// se usan mas en las queries de busqueda de tareas
TaskSchema.index({ userId: 1, deleted: 1, completed: 1 });
TaskSchema.index({ userId: 1, deleted: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, deleted: 1, priority: 1 });
TaskSchema.index({ userId: 1, deleted: 1, category: 1 });


//prevenir modelo duplicado en hot reload
const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;

// Helper function para convertir documento de Mongoose a TaskResponse
export function toTaskResponse(task: ITask): TaskResponse {
  return {
    id: (task._id as any).toString(),
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : new Date(task.dueDate).toISOString()) : undefined,
  };
}
