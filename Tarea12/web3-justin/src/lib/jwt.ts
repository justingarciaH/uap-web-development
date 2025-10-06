import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno.");
}

interface AuthPayload {
    address: string;
}

/**
 * Genera un JWT para un usuario autenticado
 * @param address Dirección de la wallet del usuario
 * @returns JWT firmado
 */
export function generateToken(address: string): string {
    const payload: AuthPayload = { address };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifica y decodifica un JWT
 * @param token JWT a verificar
 * @returns el payload decodificado o null si la validación falla
 */
export function verifyToken(token: string): AuthPayload | null {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        return payload;
    } catch (e) {
        console.error("Error al verificar el token:", e);
        return null;
    }
}
