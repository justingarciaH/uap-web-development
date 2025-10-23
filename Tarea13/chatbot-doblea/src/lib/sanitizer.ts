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
export function sanitizeMessages(messages: any[]): any[] {
    return messages.map(msg => ({
        ...msg,
        content: sanitizeMessage(msg.content)
    }));
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