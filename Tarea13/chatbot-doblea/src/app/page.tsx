'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import WelcomeMessage from '@/components/WelcomeMessage';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ErrorMessage from '@/components/ErrorMessage';
import InputForm from '@/components/InputForm';
import TaskList from '@/components/TaskList';
import StatsPanel from '@/components/StatsPanel';
import { TaskResponse } from '@/models/Task';


export default function Chat() {

 const { messages, sendMessage, status, error } = useChat({
    onError: (error) => {
      console.error('Error en el chat:', error);
    },
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'streaming';


  // Auto-scroll de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  //cargar tareas al inicio 
  useEffect(() => {
    loadTasks();
  }, []);

  //recargar tareas cuando hay nuevos mensajes (el LLM pudo haber modificado alguna tarea)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length -1].role === 'assistant') {
      loadTasks();
    }
  }, [messages])


  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks?completed=false&sortBy=dueDate&sortOrder=asc');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  }

   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) {
      setValidationError('El mensaje no puede estar vacío');
      return;
    }

    if (input.length > 10000) {
      setValidationError('El mensaje es demasiado largo (máximo 10,000 caracteres)');
      return;
    }

    setValidationError(null);
    (sendMessage as any)({ content: input });
    setInput('');
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validationError) setValidationError(null);
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      <Header title="🤖 AI Todo Manager" subtitle="Gestor inteligente de tareas con IA" />
      
      {/* Barra de acciones rápidas */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex gap-2 flex-wrap">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
          >
            📝 {showTasks ? 'Ocultar' : 'Ver'} Tareas ({tasks.length})
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/30"
          >
            📊 {showStats ? 'Ocultar' : 'Ver'} Estadísticas
          </button>
          <button
            onClick={loadTasks}
            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/30"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Columna de chat */}
            <div className={`${showTasks || showStats ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              
              {/* Mensaje de bienvenida */}
              {messages.length === 0 && <WelcomeMessage />}
              
              {/* Mensajes del chat */}
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {/* Indicador de escritura */}
              {isLoading && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Columna lateral - Tareas y Stats */}
            {(showTasks || showStats) && (
              <div className="lg:col-span-1 space-y-4">
                {showTasks && <TaskList tasks={tasks} onTaskUpdate={loadTasks} />}
                {showStats && <StatsPanel />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de entrada - Fixed en la parte inferior */}
      <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4">
        {error && (
          <div className="max-w-4xl mx-auto mb-4">
            <ErrorMessage type="api" message={error.message} />
          </div>
        )}

        <InputForm
          input={input}
          isLoading={isLoading}
          validationError={validationError}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          maxLength={10000}
        />

        {/* Sugerencias rápidas */}
        {messages.length === 0 && (
          <div className="max-w-4xl mx-auto mt-3">
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                '📝 Agregar tarea: comprar leche',
                '✅ Muéstrame mis tareas pendientes',
                '📊 ¿Qué tan productivo he sido?',
                '⚡ Tareas urgentes para hoy'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors border border-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
