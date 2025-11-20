// src/lib/validators.ts

//validacion de inputs

export interface ValidationResult {
    isvalid: boolean;
    errorMessage?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// vaidar un array de mensajes del chat
export function validateMessages(messages: any): ValidationResult {
    if (!Array.isArray(messages)) {
        return { isvalid: false, errorMessage: 'Los mensajes deben ser un array.' };
    }

    //verificar que no este vacio
    if (messages.length === 0) {
        return { isvalid: false, errorMessage: 'debe haber al menos un mensaje' };
    }

    //verificar que no tenga mas de 100 mensajes
    if (messages.length > 100) {
        return { isvalid: false, errorMessage: 'demasiados mensajes en la conversacion' };
    }

    //validar cada mensaje
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        if (!msg || typeof msg !== 'object') {
            return { isvalid: false, errorMessage: `mensaje en posicion ${i} no es un objeto valido.` };
        }
    

        //verificar role
        if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
            return { isvalid: false, errorMessage: `mensaje en posicion ${i} tiene un rol invalido.` };
        }

        //verificar content
        if (typeof msg.content !== 'string') {
            return { isvalid: false, errorMessage: `mensaje en posicion ${i} tiene contenido invalido.` };
        }

        //verificar longitud del content
        if (msg.content.length > 10000) {
            return { isvalid: false, errorMessage: `mensaje en posicion ${i} es muy largo.` };
        }

        //verificar que no este vacio
        if (msg.role === 'user' && msg.content.trim().length === 0) {
            return { isvalid: false, errorMessage: `mensaje en posicion ${i} no puede estar vacio.` };
        }
    }
    return { isvalid: true };
}

//valida un mensaje individual antes de enviarlo

export function validateSingleMessage(content: string): ValidationResult {
    if (!content  || typeof content !== 'string') {
        return { isvalid: false, errorMessage: 'El mensaje debe ser un texto valido.' };
    }
    
     const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return {
      isvalid: false,
      errorMessage: 'El mensaje no puede estar vacío'
    };
  }

  if (trimmedContent.length > 10000) {
    return {
      isvalid: false,
      errorMessage: 'El mensaje es demasiado largo (máximo 10,000 caracteres)'
    };
  }

  return { isvalid: true };
}