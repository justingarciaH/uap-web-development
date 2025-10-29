export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="text-6xl mb-4">💬</div>
      <h2 className="text-2xl font-bold text-gray-200 mb-2">
        ¡Bienvenido al Chat!
      </h2>
      <p className="text-gray-400 max-w-md">
        Inicia una conversación escribiendo tu mensaje abajo.
        Estoy aquí para ayudarte con lo que necesites.
      </p>
    </div>
  );
}
