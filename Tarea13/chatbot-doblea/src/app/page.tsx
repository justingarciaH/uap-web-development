'use client';

import { useEffect, useRef, useState } from 'react';
import { validateSingleMessage } from '@/lib/validators';
import { cleanLLMTokens } from '@/lib/sanitizer';
import { ChatMessage } from '@/lib/types';
import Header from '@/components/Header';
import WelcomeMessage from '@/components/WelcomeMessage';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ErrorMessage from '@/components/ErrorMessage';
import InputForm from '@/components/InputForm';

export default function Chat() {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Referencias
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Función para enviar mensajes y manejar el streaming de la respuesta
  const postMessagesAndStream = async (newMessages: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API respondio with ${res.status}`);
      }

      // Create a placeholder assistant message and stream into it
      const assistantId = String(Date.now()) + '-assistant';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      
      // Leer el stream SSE (Server-Sent Events)
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No se pudo leer stream de respuesta.');

      const dec = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = dec.decode(value, { stream: true });
        const lines = chunk.split('\n'); 

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remover "data: "
            
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                accumulated += content;

                       
              //  LIMPIAR TOKENS ANTES DE ACTUALIZAR
              const cleanedContent = cleanLLMTokens(accumulated);
                
                // Actualizar el mensaje del asistente progresivamente
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: cleanedContent } 
                      : m
                  )
                );
              }
            } catch {
              // Ignorar errores de parsing de líneas incompletas
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Error en postMessagesAndStream:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateSingleMessage(input);
    if (!validation.isvalid) {
      setValidationError(validation.errorMessage || 'Mensaje inválido');
      return;
    }
    setValidationError(null);

    // Create user message and append locally
    const userMsg: ChatMessage = { id: String(Date.now()) + '-user', role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Send to server and stream assistant response
    await postMessagesAndStream(newMessages);
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validationError) setValidationError(null);
    setInput(e.target.value);
  };


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      <Header title="🤖 Chatbot Justinobot" subtitle="Potenciado por los mismos dioses" />
      
      {/* Contenedor de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">

      {/* Mensaje de bienvenida */}
        {messages.length === 0 && <WelcomeMessage />}
          
        {/* Mensajes */}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {/* indicador de escritura */}
        {isLoading && <TypingIndicator />}

        {/* el coso para scrollear automaticamente */}
        <div ref={messagesEndRef} />
      </div>
    </div>

      {/* Formulario de entrada */}
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
          onInputChange={handleChange}
          onSubmit={handleFormSubmit}
          maxLength={10000}
        />
      </div>
    </div>
  );
}
