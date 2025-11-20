// src/components/MessageBubble.tsx
import { ChatMessage } from '../lib/types';

interface MessageBubbleProps {
  message: ChatMessage | any; // Support both ChatMessage and UIMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Detectar si el mensaje contiene herramientas ejecutadas
  const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0;

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl shadow-lg transition-all hover:shadow-xl ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
            : 'bg-gray-800/80 backdrop-blur-sm text-gray-100 rounded-bl-none border border-gray-700'
        }`}
      >
        {/* Avatar y role */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold opacity-70">
            {message.role === 'user' ? '👤 Tú' : '🤖 AI Todo Manager'}
          </span>
        </div>

        {/* Contenido del mensaje */}
        {message.content && (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </div>
        )}

        {/* Herramientas ejecutadas */}
        {hasToolInvocations && (
          <div className="mt-3 space-y-2">
            {message.toolInvocations?.map((tool: any, idx: number) => (
              <ToolInvocationDisplay key={idx} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolInvocationDisplay({ tool }: { tool: any }) {
  const getToolIcon = (toolName: string) => {
    const icons: { [key: string]: string } = {
      createTask: '➕',
      updateTask: '✏️',
      deleteTask: '🗑️',
      searchTasks: '🔍',
      getTaskStats: '📊'
    };
    return icons[toolName] || '🔧';
  };

  const getToolLabel = (toolName: string) => {
    const labels: { [key: string]: string } = {
      createTask: 'Crear tarea',
      updateTask: 'Actualizar tarea',
      deleteTask: 'Eliminar tarea',
      searchTasks: 'Buscar tareas',
      getTaskStats: 'Obtener estadísticas'
    };
    return labels[toolName] || toolName;
  };

  // Estado de la herramienta
  if (tool.state === 'call') {
    return (
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 text-xs">
        <div className="flex items-center gap-2 text-blue-300">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
          <span>{getToolIcon(tool.toolName)} Ejecutando: {getToolLabel(tool.toolName)}...</span>
        </div>
      </div>
    );
  }

  if (tool.state === 'result') {
    const success = tool.result?.success !== false;
    
    return (
      <div className={`border rounded-lg p-2 text-xs ${
        success 
          ? 'bg-green-600/20 border-green-500/30' 
          : 'bg-red-600/20 border-red-500/30'
      }`}>
        <div className={`flex items-center gap-2 ${
          success ? 'text-green-300' : 'text-red-300'
        }`}>
          <span>{success ? '✅' : '❌'}</span>
          <span>{getToolIcon(tool.toolName)} {getToolLabel(tool.toolName)}</span>
        </div>
        
        {/* Mostrar resultado si existe un mensaje */}
        {tool.result?.message && (
          <p className="mt-1 text-gray-300 opacity-80">{tool.result.message}</p>
        )}

        {/* Mostrar error si hay */}
        {!success && tool.result?.error && (
          <p className="mt-1 text-red-400">{tool.result.error}</p>
        )}
      </div>
    );
  }

  return null;
}
