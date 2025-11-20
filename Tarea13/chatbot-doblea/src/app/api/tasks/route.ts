// creacion de endpoints CRUD para las tareas
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task, { Priority, Category, TaskResponse } from '@/models/Task';

//get tareas
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        //parametros de busqueda
        const query = searchParams.get('query') || '';
        const completed = searchParams.get('completed');
        const priority = searchParams.get('priority') as Priority | null;
        const category = searchParams.get('category') as Category | null;
        const dueDateFrom = searchParams.get('dueDateFrom');
        const dueDateTo = searchParams.get('dueDateTo');
        const sortBy = searchParams.get('sortBy') || 'createdAt' || 'dueDate' || 'priority' || 'title';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
        const limit = parseInt(searchParams.get('limit') || '50');

        //construir el filtro de busqueda
        const filter: any = { userId: 'default-user' , deleted: false };
        
        //Busqueda de texto en titulo 
        if (query) {
            filter.title = { $regex: query, $options: 'i' };
        }

        // FILTRO por estado completado si no es null o undefined completado sera 'true' 
        if (completed !== null && completed !== undefined) {
            filter.completed = completed === 'true';
        }

        // FILTRO por prioridad
        if  (priority) {
            filter.priority = priority;
        }
        // FILTRO por categoria
        if (category) {
            filter.category = category;
        }
        // FILTRO por rango de fecha de vencimiento
        if (dueDateFrom || dueDateTo) {
            filter.dueDate = {};
            if (dueDateFrom) {
                filter.dueDate.$gte = new Date(dueDateFrom);
            }
            if (dueDateTo) {
                filter.dueDate.$lte = new Date(dueDateTo);
            }
        }

        //ejecutar busqueda
        const tasks = await Task.find(filter)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .lean();

        const total = await Task.countDocuments(filter);

        //formatear respuesta
        const formattedTasks: TaskResponse[] = tasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            completed: task.completed,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : new Date(task.dueDate).toISOString()) : undefined
        }));

        return NextResponse.json({
            success: true,
            tasks: formattedTasks,
            total,
            hasMore: total > limit
        })
    } catch (error: any) {
        console.error('Error al obtener las tareas (GET):', error);
        return NextResponse.json(
            { success: false, message: 'Error al obtener las tareas', details: error.message }, 
            { status: 500 });
    }
}


// POST crear nueva tarea
export async function POST( req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { title, priority, dueDate, category } = body;

        //validaciones
        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: 'El titulo es requerido y no puede estar vacio' },
                { status: 400 }
            );
        }

        const task = await Task.create({
            title: title.trim(),
            priority: priority || 'medium',
            category: category || 'personal',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            userId: 'default-user',
            completed: false
        });

        const taskResponse: TaskResponse = {
            id: (task._id as any).toString(),
            title: task.title,
            completed: task.completed,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : new Date(task.dueDate).toISOString()) : undefined
        };
        return NextResponse.json({
            success: true, 
            task: taskResponse,
            message: 'Tarea creada exitosamente'
        },{ status: 201 });
    } catch (error: any) {
        console.error('Error al crear la tarea (POST):', error);
        return NextResponse.json(
            { success: false, message: 'Error al crear la tarea', details: error.message },
            { status: 500 }
        );
    }
}
