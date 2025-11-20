// api route para el delete segun el id
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task, { TaskResponse } from '@/models/Task';
import mongoose from 'mongoose';

// actualizar tarea
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        // validar ID de MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'ID de tarea no válido' }, { status: 400 });
        }

        const body = await req.json();
        const { title, completed, priority, category, dueDate } = body;

        //verificar que al menos un campo esté actualizado
        if (
            title === undefined &&
            completed === undefined &&
            priority === undefined &&
            category === undefined &&
            dueDate === undefined
        ) {
            return NextResponse.json(
                { success: false, error: 'debe proporcionar al menos un campo para actualizar' },
                { status: 400 }
            );
        }

        // construir objeto de actualizacion
        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (completed !== undefined) updateData.completed = completed;
        if (priority !== undefined) updateData.priority = priority;
        if (category !== undefined) updateData.category = category;
        if (dueDate !== undefined) { updateData.dueDate = dueDate ? new Date(dueDate) : null; }

        //actualizar tarea 
        const task = await Task.findOneAndUpdate(
            { _id: id, userId: 'default-user', deleted: false },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!task) {   
            return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
        }

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
            message: 'Tarea actualizada exitosamente'
        });

    } catch (error: any) {
        console.error('Error al actualizar la tarea (PATCH):', error);
        return NextResponse.json(
            { success: false, message: 'Error al actualizar la tarea', details: error.message },
            { status: 500 }
        );
    }
}

    //delete tarea (soft delete)
export async function DELETE( req: Request, { params }: { params: { id: string } }) {
        try {

            await connectDB();
            const { id } = params;  

            //validar id de mongoDB
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    {success: false, error: 'ID de tarea invalido'},
                    { status: 400}
                );
            }

            //soft delete marcar como deleted
            const task = await Task.findOneAndUpdate(
                {_id: id, userId: 'default-user', deleted: false },
                { $set: { deleted: true } },
                { new: true }
            );

            if (!task) {
            return NextResponse.json(
                { success: false, error: 'Tarea no encontrada' },
                { status: 404 }
            );
            }

            return NextResponse.json({
            success: true,
            message: 'Tarea eliminada exitosamente',
            taskTitle: task.title
            });

        } catch (error: any) {
            console.error('Error en DELETE /api/tasks/[id]:', error);
            return NextResponse.json(
            { success: false, error: 'Error al eliminar la tarea', details: error.message },
            { status: 500 }
            );
    }
}
