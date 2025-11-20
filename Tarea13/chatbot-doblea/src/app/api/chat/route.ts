// src/app/api/chat/route.ts
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { validateMessages } from '@/lib/validators';
import { sanitizeMessages as cleanMessages } from '@/lib/sanitizer';
import { allTools } from '@/lib/tools';

// Validar variables de entorno
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Falta la clave de API de OpenRouter en las variables de entorno.');
}

if (!process.env.OPENROUTER_BASE_URL) {
  throw new Error('Falta la URL base de OpenRouter en las variables de entorno.');
}

if (!process.env.OPENROUTER_MODEL) {
  throw new Error('Falta la variable OPENROUTER_MODEL en las variables de entorno.');
}

// Crear cliente OpenRouter
const openrouter = createOpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('POST /api/chat called');
    const body = await req.json();
    const { messages } = body;
    console.log('Received messages:', messages);

    if (!messages) {
      return new Response('No se han puesto mensajes', {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normalizar mensajes para consistent messages format
    const normalizedMessages = messages.map((msg: any) => ({
      ...msg,
      content: msg.content || msg.text || ''
    }));

    // Validar los mensajes
    const validation = validateMessages(normalizedMessages);
    if (!validation.isvalid) {
      return new Response(JSON.stringify({ error: validation.errorMessage }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitizar los mensajes
    const sanitizedMessages = cleanMessages(messages);

    const model = process.env.OPENROUTER_MODEL;

    // Sistema de instrucciones para el gestor de tareas
    const systemPrompt = `Eres un asistente inteligente de gestión de tareas llamado "AI Todo Manager".

Tu trabajo es ayudar al usuario a organizar y gestionar sus tareas de manera conversacional y eficiente.

HERRAMIENTAS DISPONIBLES:
1. createTask: Crear nuevas tareas
2. updateTask: Actualizar tareas existentes (título, completar, cambiar prioridad, etc)
3. deleteTask: Eliminar tareas
4. searchTasks: Buscar y listar tareas con filtros
5. getTaskStats: Obtener estadísticas de productividad

REGLAS IMPORTANTES:
- Siempre responde en español con un tono amigable y profesional
- Cuando el usuario mencione una tarea por su título pero no tengas el ID, primero usa searchTasks para encontrarla
- Para acciones destructivas (eliminar), confirma con el usuario antes de ejecutar
- Después de ejecutar una herramienta, explica al usuario qué se hizo
- Si hay un error, explica el problema de manera clara
- Sugiere acciones útiles basadas en el contexto (ej: si hay tareas urgentes, mencionarlo)
- Usa emojis apropiados para hacer las respuestas más visuales: ✅ ⚡ 📅 🏷️ 📊 🔥
- Cuando muestres listas de tareas, formatéalas de manera clara y organizada

EJEMPLOS DE USO:
- Usuario: "Agregar tarea: comprar leche" → Usar createTask
- Usuario: "Marca la tarea de comprar leche como completada" → Primero searchTasks con query="leche", luego updateTask con completed=true
- Usuario: "Muéstrame mis tareas pendientes" → searchTasks con completed=false
- Usuario: "¿Qué tan productivo he sido?" → getTaskStats

PRIORIDADES:
- high = urgente/importante
- medium = normal (default)
- low = baja prioridad

CATEGORÍAS:
- work = trabajo
- personal = personal
- shopping = compras
- health = salud
- other = otros (default)`;

    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...sanitizedMessages
    ];

    console.log('About to call streamText with model:', model);
    console.log('Model from env:', process.env.OPENROUTER_MODEL);

    // Usar streamText con tool calling de Vercel AI SDK
    const result = await streamText({
      model: openrouter(model!),
      messages: messagesWithSystem,
      tools: allTools,
      temperature: 0.7,
    });

    console.log('StreamText result obtained, about to return response');

    const response = result.toTextStreamResponse();
    console.log('Response created, sending to client');

    return response;
  } catch (error: any) {
    console.error('❌ Error en la API del chat:', error);
    // Manejo específico de errores
    if (error.message?.includes('API key')) {
      return new Response(
        JSON.stringify({ error: 'Error de autenticación con OpenRouter. Verifica tu clave de API.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if (error.message?.includes('rate limit')) {
      return new Response(
        JSON.stringify({ error: 'Límite de solicitudes excedido. Por favor, intenta más tarde.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    // Error genérico
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor. Por favor, intenta nuevamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
