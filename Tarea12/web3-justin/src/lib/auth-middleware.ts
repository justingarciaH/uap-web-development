import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { Address } from 'viem';

export interface AuthResult {
    success: boolean;
    userAddress: Address;
    error?: string;
    status?: number;
}

/**
 * Middleware de autenticación que valida JWT del header Authorization
 * Extrae la dirección de wallet del token y verifica su expiración
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
    try {
        // 1. Obtener el JWT del header Authorization: Bearer <token>
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                success: false,
                userAddress: '0x' as Address,
                error: 'Falta el header Authorization: Bearer <token>.',
                status: 401
            };
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return {
                success: false,
                userAddress: '0x' as Address,
                error: 'Token no proporcionado.',
                status: 401
            };
        }

        // 2. Verificar token y extraer payload
        const payload = verifyToken(token);
        if (!payload) {
            return {
                success: false,
                userAddress: '0x' as Address,
                error: 'Token inválido o expirado.',
                status: 403
            };
        }

        // 3. Extraer dirección de wallet del token
        const { address } = payload;
        if (!address) {
            return {
                success: false,
                userAddress: '0x' as Address,
                error: 'Dirección no encontrada en el token.',
                status: 403
            };
        }

        // 4. Devolver resultado exitoso
        return {
            success: true,
            userAddress: address as Address
        };

    } catch (error: any) {
        console.error('Error en autenticación:', error);
        return {
            success: false,
            userAddress: '0x' as Address,
            error: 'Error interno en autenticación.',
            status: 500
        };
    }
}
