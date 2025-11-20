// src/lib/sanitizer.ts
import type { ModelMessage } from 'ai'


//sanitiza el contenido de un mensaje para evitar inyeccion de codigo

export function sanitizeMessage(content: string): string {
    if (typeof content !== 'string') {
        return '';
    }

    //remover espacios en blanco
    let sanitized = content.trim();

    //limitar lineas consecutivas vacias a maximo 2
    sanitized = sanitized.replace(/(\n\s*){3,}/g, '\n\n');

    //remover carateres de control no imprimibles excepto saltos de linea y tabulaciones
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
}

//satinizar un array completo de mensajes
export function sanitizeMessages(messages: ModelMessage[]): ModelMessage[] {
 return messages.map(msg => {
    // Solo sanitizar mensajes de usuario y sistema que tienen content como string
    if (msg.role === 'user' || msg.role === 'system') {
      if (typeof msg.content === 'string') {
        return {
          ...msg,
          content: sanitizeMessage(msg.content)
        } as ModelMessage;
      }
    }
    
    // Para assistant messages, también sanitizar si es string
    if (msg.role === 'assistant') {
      if (typeof msg.content === 'string') {
        return {
          ...msg,
          content: sanitizeMessage(msg.content)
        } as ModelMessage;
      }
    }
    
    // Para otros casos (tool messages, multimodal content, etc.), devolver sin cambios
    return msg;
  });
}

//funcion para escapar caracteres html y evitar inyeccion de codigo
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}


/**
 * Limpia tokens especiales de modelos LLM
 * Estos son marcadores internos que los modelos a veces incluyen en sus respuestas
 */
export function cleanLLMTokens(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  // Tokens específicos de DeepSeek
  cleaned = cleaned.replace(/<|begin▁of▁sentence|>/g, '');
  cleaned = cleaned.replace(/<|end▁of▁sentence|>/g, '');
  cleaned = cleaned.replace(/<|begin▁of▁text|>/g, '');
  cleaned = cleaned.replace(/<|end▁of▁text|>/g, '');

  // Caracteres Unicode de separación y box drawing que algunos modelos incluyen
  cleaned = cleaned.replace(/｜｜/g, ''); // Box drawing characters
  cleaned = cleaned.replace(/[━┃┏┓┗┛┣┫┳┻╋┱┲┹┺╀╃╄╅╆╇╈╉╊╋╪╵╷╹╻╽─│┌┐└┘├┤┬┴┼╭╮╯╰╱╲╳▁▏▕░▒▓█▲▼◀▶◆◇●○◆]/g, '');

  // Tokens comunes de otros modelos
  cleaned = cleaned.replace(/<\|im_start\|>/g, '');
  cleaned = cleaned.replace(/<\|im_end\|>/g, '');
  cleaned = cleaned.replace(/<\|endoftext\|>/g, '');
  cleaned = cleaned.replace(/\[INST\]/g, '');
  cleaned = cleaned.replace(/\[\/INST\]/g, '');
  cleaned = cleaned.replace(/<s>/g, '');
  cleaned = cleaned.replace(/<\/s>/g, '');

  // Remover caracteres separadores adicionales que puedan aparecer
  cleaned = cleaned.replace(/[│║▌▐►▼◄]+/g, ''); // Más caracteres separadores
  cleaned = cleaned.replace(/(\n\s*){3,}/g, '\n\n'); // Normalizar saltos de línea

  // Remover espacios extras que puedan quedar después de limpiar tokens
  cleaned = cleaned.trim();

  return cleaned;
}
