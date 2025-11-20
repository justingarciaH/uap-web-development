  'use client';

import { useEffect, useState } from 'react';

interface Stats {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    overdueTasks: number;
  };
  byPriority: {
    [key: string]: { total: number; completed: number; pending: number };
  };
  byCategory: {
    [key: string]: { total: number; completed: number; pending: number };
  };
  timeline: {
    tasksCreatedToday: number;
    tasksCompletedToday: number;
    tasksCreatedThisWeek: number;
    tasksCompletedThisWeek: number;
  };
  productivity: {
    currentStreak: number;
    longestStreak: number;
    mostProductiveCategory: string;
  };
  upcoming: {
    dueTodayCount: number;
    dueThisWeekCount: number;
    nextDueTask: any;
  };
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all-time'>('week');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/stats?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 text-sm mt-2">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
        <p className="text-gray-400 text-sm">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      work: '💼',
      personal: '🏠',
      shopping: '🛒',
      health: '💪',
      other: '📌'
    };
    return icons[category] || '📌';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 Estadísticas
        </h3>
        
        {/* Selector de periodo */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="bg-gray-900/50 border border-gray-600 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Hoy</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="all-time">Todo</option>
        </select>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Resumen general */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-300 mb-3">📈 Resumen General</h4>
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Total" 
              value={stats.summary.totalTasks} 
              icon="📝"
              color="text-gray-300"
            />
            <StatCard 
              label="Completadas" 
              value={stats.summary.completedTasks} 
              icon="✅"
              color="text-green-400"
            />
            <StatCard 
              label="Pendientes" 
              value={stats.summary.pendingTasks} 
              icon="⏳"
              color="text-yellow-400"
            />
            <StatCard 
              label="Atrasadas" 
              value={stats.summary.overdueTasks} 
              icon="⚠️"
              color="text-red-400"
            />
          </div>
          
          {/* Tasa de completitud */}
          <div className="mt-3 pt-3 border-t border-blue-500/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Tasa de completitud</span>
              <span className="text-blue-300 font-bold">{stats.summary.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.summary.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">📅 Actividad</h4>
          <div className="space-y-2">
            <TimelineStat 
              label="Creadas hoy" 
              value={stats.timeline.tasksCreatedToday}
              icon="➕"
            />
            <TimelineStat 
              label="Completadas hoy" 
              value={stats.timeline.tasksCompletedToday}
              icon="✅"
            />
            <TimelineStat 
              label="Creadas esta semana" 
              value={stats.timeline.tasksCreatedThisWeek}
              icon="📊"
            />
            <TimelineStat 
              label="Completadas esta semana" 
              value={stats.timeline.tasksCompletedThisWeek}
              icon="🎯"
            />
          </div>
        </div>

        {/* Por prioridad */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">🎯 Por Prioridad</h4>
          <div className="space-y-2">
            {Object.entries(stats.byPriority).map(([priority, data]) => (
              <PriorityBar 
                key={priority}
                priority={priority}
                completed={data.completed}
                total={data.total}
              />
            ))}
          </div>
        </div>

        {/* Por categoría */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">🏷️ Por Categoría</h4>
          <div className="space-y-2">
            {Object.entries(stats.byCategory).map(([category, data]) => (
              <CategoryBar 
                key={category}
                category={category}
                icon={getCategoryIcon(category)}
                completed={data.completed}
                total={data.total}
              />
            ))}
          </div>
        </div>

        {/* Productividad */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-300 mb-3">🔥 Productividad</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Racha actual</span>
              <span className="text-green-400 font-bold">{stats.productivity.currentStreak} días</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Categoría más activa</span>
              <span className="text-green-400 font-bold capitalize">
                {getCategoryIcon(stats.productivity.mostProductiveCategory)} {stats.productivity.mostProductiveCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Próximas tareas */}
        {stats.upcoming.nextDueTask && (
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-300 mb-2">⏰ Próxima tarea</h4>
            <p className="text-xs text-gray-300 mb-1">{stats.upcoming.nextDueTask.title}</p>
            <p className="text-xs text-orange-400">
              📅 {new Date(stats.upcoming.nextDueTask.dueDate).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-2 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function TimelineStat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-400 flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span className="text-gray-300 font-bold">{value}</span>
    </div>
  );
}

function PriorityBar({ priority, completed, total }: { priority: string; completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const colors: { [key: string]: string } = {
    high: 'from-red-500 to-red-600',
    medium: 'from-yellow-500 to-yellow-600',
    low: 'from-green-500 to-green-600'
  };

  const icons: { [key: string]: string } = {
    high: '⚡',
    medium: '⚠️',
    low: '🔵'
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400 capitalize flex items-center gap-1">
          <span>{icons[priority]}</span> {priority}
        </span>
        <span className="text-gray-500">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div 
          className={`bg-gradient-to-r ${colors[priority]} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CategoryBar({ category, icon, completed, total }: { category: string; icon: string; completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400 capitalize flex items-center gap-1">
          <span>{icon}</span> {category}
        </span>
        <span className="text-gray-500">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}