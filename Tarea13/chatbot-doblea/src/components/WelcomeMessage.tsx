// src/components/WelcomeMessage.tsx (actualizado)
export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="text-6xl mb-4">🤖</div>
      <h2 className="text-3xl font-bold text-gray-200 mb-3">
        ¡Bienvenido a AI Todo Manager de Justino!
      </h2>
      <p className="text-gray-400 max-w-2xl mb-6 leading-relaxed">
        Soy tu asistente inteligente para gestionar tareas. Puedo ayudarte a crear, 
        organizar, completar y analizar tus tareas de manera conversacional.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full mt-4">
        {/* Feature cards */}
        <FeatureCard 
          icon="✨"
          title="Crear Tareas"
          description='Di "Agregar tarea: comprar leche" y la crearé por ti'
        />
        <FeatureCard 
          icon="✅"
          title="Completar Tareas"
          description='Di "Marca como completada la tarea de comprar leche"'
        />
        <FeatureCard 
          icon="🔍"
          title="Buscar y Filtrar"
          description='Pregunta "¿Qué tareas tengo pendientes?" o "Tareas urgentes"'
        />
        <FeatureCard 
          icon="📊"
          title="Estadísticas"
          description='Pregunta "¿Qué tan productivo he sido esta semana?"'
        />
      </div>

      <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl max-w-2xl">
        <p className="text-sm text-blue-300 mb-2 font-semibold">💡 Ejemplos de cosas que puedes decirme:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
          <div>• "Agregar tarea urgente: terminar informe"</div>
          <div>• "Muéstrame mis tareas de hoy"</div>
          <div>• "Marca la primera tarea como completada"</div>
          <div>• "¿Cuántas tareas he completado?"</div>
          <div>• "Elimina las tareas completadas"</div>
          <div>• "Tareas de trabajo pendientes"</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}