import { ChatMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      key={message.id}
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
            {message.role === 'user' ? '👤 Tú' : '🤖 Asistente'}
          </span>
        </div>

        {/* Contenido del mensaje */}
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}
