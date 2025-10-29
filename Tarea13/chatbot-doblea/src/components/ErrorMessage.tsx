interface ErrorMessageProps {
  type: 'validation' | 'api';
  message: string;
}

export default function ErrorMessage({ type, message }: ErrorMessageProps) {
  const icon = type === 'validation' ? '⚠️' : '❌';
  const prefix = type === 'api' ? 'Error: ' : '';

  return (
    <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-fade-in">
      {icon} {prefix}{message}
    </div>
  );
}
