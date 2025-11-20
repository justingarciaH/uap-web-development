// logica para obtener las estadisticas
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";


export async function GET(req: NextRequest) {
    try{
        await connectDB()

        const { searchParams } = new URL (req.url)
        const period = searchParams.get('period') || 'all-time';

        //calcular rango de fechas segun el periodo
        const now = new Date();
        let dateFilter: any = {};

        switch (period) {
            case 'today':
                const startOfToday = new Date(now.setHours(0,0,0,0))
                dateFilter = { createdAt: { $gte: startOfToday} }
                break

            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                dateFilter = { createdAt: { $gte: startOfWeek} }
                break
            
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                dateFilter = { createdAt: { $gte: startOfMonth } };
                break

            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1)
                dateFilter = { createdAt: { $gte: startOfYear } };
                break

            default:
                dateFilter = {}
        }

        const baseFilter = {
            userId: 'default-user',
            deleted: false,
            ...dateFilter
        } 

        // estadisticas generales
        const totalTasks = await Task.countDocuments(baseFilter);
        const completedTasks = await Task.countDocuments({ ...baseFilter, completed: true });
        const pendingTask = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        //tareas atrasadas 
        const overdueTasks = await Task.countDocuments({
            ...baseFilter,
            completed: false,
            dueDate: { $lt: new Date() }
        });

        ///estadisticas por prioridad
        const byPriority = {
            high: {
                total: await Task.countDocuments({ ...baseFilter, priority: 'high' }),
                completedTasks: await Task.countDocuments({ ...baseFilter, priority: 'high', completed: true }),
                pending: 0
            },
            medium: {
                total: await Task.countDocuments({ ...baseFilter, priority: 'medium' }),
                completedTasks: await Task.countDocuments({ ...baseFilter, priority: 'medium', completed: true }),
                pending: 0
            },
            low: {
                total: await Task.countDocuments({ ...baseFilter, priority: 'low' }),
                completedTasks: await Task.countDocuments({ ...baseFilter, priority: 'low', completed: true }),
                pending: 0
            }
        }
        
        byPriority.high.pending = byPriority.high.total - byPriority.high.completedTasks;
        byPriority.medium.pending = byPriority.medium.total - byPriority.medium.completedTasks;
        byPriority.low.pending = byPriority.low.total - byPriority.low.completedTasks;
     
        //estadisticas por categoria
        const categories = ['work', 'personal', 'shopping', 'health', 'other'];
        const byCategory: any = {};

        for (const cat of categories) {
            const total = await Task.countDocuments({ ...baseFilter, category: cat });
            const completed = await Task.countDocuments({ ...baseFilter, category: cat, completed: true });
            byCategory[cat] = {
                total,
                completed,
                pending: total - completed
            };
        }

        //tareas con fecha limite proxima
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        const dueTodayCount = await Task.countDocuments({
            ...baseFilter,
            completed: false,
            dueDate: { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) }
        });

        const dueThisWeekCount = await Task.countDocuments({
            ...baseFilter,
            completed: false,
            dueDate: { $gte: new Date(), $lte: endOfWeek }
        });

        // proxima tarea con fecha limite
        const nextDueTask = await Task.findOne({
            ...baseFilter,
      completed: false,
      dueDate: { $gte: new Date() }
    })
      .sort({ dueDate: 1 })
      .lean();

      
       // Timeline (tareas creadas/completadas hoy y esta semana)
    const startOfTodayDate = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - now.getDay());
    startOfWeekDate.setHours(0, 0, 0, 0);

    const tasksCreatedToday = await Task.countDocuments({
      userId: 'default-user',
      deleted: false,
      createdAt: { $gte: startOfTodayDate }
    });

    const tasksCompletedToday = await Task.countDocuments({
      userId: 'default-user',
      deleted: false,
      completed: true,
      updatedAt: { $gte: startOfTodayDate }
    });

    const tasksCreatedThisWeek = await Task.countDocuments({
      userId: 'default-user',
      deleted: false,
      createdAt: { $gte: startOfWeekDate }
    });

     const tasksCompletedThisWeek = await Task.countDocuments({
      userId: 'default-user',
      deleted: false,
      completed: true,
      updatedAt: { $gte: startOfWeekDate }
    });
    
    
    //calcular racha (dias consecutivos con tareas completadas)
    // solo voy a contar los dias con tareas compleadas en los ultimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletedTasks = await Task.find({
        userId: 'default-user',
        deleted: false,
        completed: true,
        updatedAt: { $gte: thirtyDaysAgo }
    }).select('updatedAt').lean();

    const uniqueDays = new Set(
      recentCompletedTasks.map((t: any) => t.updatedAt.toISOString().split('T')[0])
    );

    //aqui es q devolvemos la respuesta con estadisticas completas
    const response = {
        success: true,
        period,
        summary: {
            totalTasks,
            completedTasks,
            pendingTask,
            completionRate: Math.round(completionRate * 100) / 100,
            overdueTasks
        },
        byPriority,
        byCategory,
        timeline: {
            tasksCreatedToday,
            tasksCompletedToday,
            tasksCreatedThisWeek,
            tasksCompletedThisWeek
        },
        productivity: {
            currentStreak: uniqueDays.size,
            longestStreak: uniqueDays.size,
            mostProductiveCategory: Object.entries(byCategory).reduce(( a, b) =>
            (b[1] as any).completed > (a[1] as any).completed ? b : a )[0]
        },
        upcoming: {
            dueTodayCount,
            dueThisWeekCount,
            nextDueTask: nextDueTask ? {
            id: nextDueTask._id.toString(),
            title: nextDueTask.title,
            dueDate: nextDueTask.dueDate?.toISOString(),
            priority: nextDueTask.priority
            } : null
        }
     };

     return NextResponse.json(response);

    
    } catch (error: any) {
    console.error('Error en GET /api/tasks/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al calcular estadísticas', details: error.message },
      { status: 500 }
    );
  }  
}
