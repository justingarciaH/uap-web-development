interface InputFormProps {
  input: string;
  isLoading: boolean;
  validationError: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  maxLength: number;
}

export default function InputForm({
  input,
  isLoading,
  validationError,
  onInputChange,
  onSubmit,
  maxLength
}: InputFormProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Mostrar error de validación si existe */}
      {validationError && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-fade-in">
          ⚠️ {validationError}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <input
          className="flex-1 px-5 py-3 bg-gray-700/50 text-white rounded-full border border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all
                   placeholder-gray-400"
          value={input}
          placeholder="Pregunte lo que quiera mi rey..."
          onChange={onInputChange}
          disabled={isLoading}
          maxLength={maxLength}
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600
                   text-white px-6 py-3 rounded-full font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-lg hover:shadow-xl
                   transform hover:scale-105 active:scale-95"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Enviando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Enviar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
          )}
        </button>
      </form>

      <CharacterCounter currentLength={input.length} maxLength={maxLength} />
    </div>
  );
}

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
}

function CharacterCounter({ currentLength, maxLength }: CharacterCounterProps) {
  return (
    <div className="mt-2 text-xs text-gray-500 text-right">
      {currentLength} / {maxLength} caracteres
    </div>
  );
}
