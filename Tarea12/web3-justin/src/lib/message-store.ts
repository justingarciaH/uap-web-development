// Almacenamiento en memoria para mensajes SIWE (en producción usar Redis)

interface StoredMessage {
    message: string;
    timestamp: number;
    address: string;
}

// Map para almacenar mensajes temporalmente
const messageStore = new Map<string, StoredMessage>();

// TTL de 5 minutos para los mensajes
const MESSAGE_TTL = 5 * 60 * 1000;

/**
 * Guarda un mensaje SIWE con su nonce como key
 */
export function storeMessage(nonce: string, message: string, address: string): void {
    messageStore.set(nonce, {
        message,
        timestamp: Date.now(),
        address
    });
    
    // Limpiar mensajes expirados
    cleanExpiredMessages();
}

/**
 * Recupera un mensaje SIWE por su nonce
 */
export function getMessage(nonce: string): StoredMessage | null {
    const stored = messageStore.get(nonce);
    
    if (!stored) return null;
    
    // Verificar que no haya expirado
    if (Date.now() - stored.timestamp > MESSAGE_TTL) {
        messageStore.delete(nonce);
        return null;
    }
    
    return stored;
}

/**
 * Elimina un mensaje después de ser usado
 */
export function deleteMessage(nonce: string): void {
    messageStore.delete(nonce);
}

/**
 * Limpia mensajes expirados
 */
function cleanExpiredMessages(): void {
    const now = Date.now();
    for (const [nonce, stored] of messageStore.entries()) {
        if (now - stored.timestamp > MESSAGE_TTL) {
            messageStore.delete(nonce);
        }
    }
}