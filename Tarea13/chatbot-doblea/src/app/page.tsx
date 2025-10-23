'use client';

import Image from "next/image";
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export default function Chat() {

  // El hook `useChat` maneja toda la lógica del chat por nosotros.
  // - `messages`: Un array con todos los mensajes de la conversación.
  // - `input`: El valor actual del campo de texto.
  // - `setInput`: Función para actualizar `input` cuando el usuario escribe.
  // - `handleSubmit`: Función que se llama al enviar el formulario.
  // - `isLoading`: Un booleano que es `true` mientras se espera la respuesta.
  // @ts-ignore
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  
  //para poder hacer scroll automatico al final del chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //efecto que se ejecuta cada vez que cambian los mensajes del array
  useEffect(() => {
    if(messagesEndRef.current){
      //scrolear hasta el final del chat
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      
      {/* Barra de título */}
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">Chatbot Justino</h1>
      </header>
      
      {/* Contenedor de mensajes */}
      <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-4"
      > 

        {messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg 
                  ${m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <span className="block whitespace-pre-wrap">{m.content}</span>
                </div>
              </div>
            ))
          ) : (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-400">
                  Inicia una conversación escribiendo en el campo de abajo.
                </div>
              </div>
            )}

          {/* Indicador de "Escribiendo..." */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg px-4 py-3 rounded-2xl shadow bg-gray-700 text-gray-200 rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Formulario de entrada */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input
            className="flex-1 w-full px-4 py-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            value={input}
            placeholder="Pregunta lo que quiera mi rey"
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full disabled:opacity-50"
            disabled={isLoading}
          >
            Enviar
          </button>
        </form>


            {/* <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                  />
                </div>
              </div>
            <div className="chat-bubble">It was said that you would, destroy the Sith, not join them.</div>
          </div>
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                />
              </div>
            </div>
            <div className="chat-bubble">It was you who would bring balance to the Force</div>
          </div>
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                />
              </div>
            </div>
            <div className="chat-bubble">Not leave it in Darkness</div>
          </div> */}
    
    
      </div>
    </div>

  );
}
