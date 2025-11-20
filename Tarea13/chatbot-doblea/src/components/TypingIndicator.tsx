// src/components/TypingIndicator.tsx

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-lg px-4 py-3 rounded-2xl shadow-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold opacity-70">
            🧑🏻‍💻 JustinoRobot esta escribiendo...
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
