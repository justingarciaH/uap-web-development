//corazon de la aplicacion, aqui se maneja la logica del chat
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { validateMessages } from '@/lib/validators';
import { sanitizeMessages as cleanMessages } from '@/lib/sanitizer';


export const runtime = 'edge';


//validad que las variables de entorno existan 
if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Falta la clave de API de OpenRouter en las variables de entorno.');
}

if (!process.env.OPENROUTER_BASE_URL) {
    throw new Error('Falta la URL base de OpenRouter en las variables de entorno.');
}

// //clear cliente openrouter

// const client = createOpenAI({
//     baseURL: process.env.OPENROUTER_BASE_URL,
//     apiKey: process.env.OPENROUTER_API_KEY,
// });

// funcion principal que se ejecuta cuando el frontend llama a esa api
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages) {
            return new Response('no se han puesto mensajes ', 
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }    
            }
        );
        }

        //validar los mensajes
        const validation = validateMessages(messages);
        if (!validation.isvalid) {
            return new Response(JSON.stringify({ error: validation.errorMessage }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        //sanitizar los mensajes
        const sanitizedMessages = cleanMessages(messages);


        const model = process.env.OPENROUTER_MODEL || 'gpt-4o';


        // 6. Agregar mensaje de sistema para forzar español
        const messagesWithSystemPrompt = [
        {
            role: 'system' as const,
            content: 'Eres un asistente útil. Responde siempre en español con claridad y precisión respond in Spanish (Español). Nunca en ningun otro lenguaje. Siempre responde en español.'
        },
        ...sanitizedMessages
        ];

    const response = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
        'X-Title': 'Chatbot Justinobot', 
      },
      body: JSON.stringify({
        model: model,
        messages: messagesWithSystemPrompt,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
            console.error(`Error de OpenRouter:`, errorData);
      throw new Error(errorData.error?.message || 'Error en OpenRouter API');
    }
        
    console.log(`Stream iniciado con modelo: ${model}`);


    // 8. Retornar el stream directamente
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    } catch (error: any) {
        console.error('❌ Error en la API del chat:', error);

        //manejo especifico de errores
        if (error.message?.includes('API key')) {
            return new Response(
                JSON.stringify({ error: 'Error de autenticacion con OpenRouter. Verifica tu clave de API.' }),
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
        JSON.stringify({ error: 'Error interno del servidor. Por favor, intenta nuevamente.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
         }),
            { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
            }
        );    
    }
}
