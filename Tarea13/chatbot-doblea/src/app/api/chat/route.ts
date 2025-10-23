//corazon de la aplicacion, aqui se maneja la logica del chat
import { createOpenAI, openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { validateMessages, validateSingleMessage } from '@/lib/validators';
import { sanitizeMessage as cleanMessages } from '@/lib/sanitizer';


export const runtime = 'edge';


//validad que las variables de entorno existan 
if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Falta la clave de API de OpenRouter en las variables de entorno.');
}

if (!process.env.OPENROUTER_BASE_URL) {
    throw new Error('Falta la URL base de OpenRouter en las variables de entorno.');
}

//clear cliente openrouter

const client = createOpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
});

// funcion principal que se ejecuta cuando el frontend llama a esa api
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages) {
            return new Response('no se han puesto mensajes ', 
                { status: 400,
                headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // pedirle a la api de openrouter la completacion del chat
        const result = await streamText({
            model: client(process.env.OPENROUTER_MODEL || 'gpt-4o'),
            messages: messages,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Error en la gestion del chat:', error);
        return new Response('Error interno del servidor', { status: 500 });
    }
}
