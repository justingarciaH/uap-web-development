import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { claimTokens } from '@/lib/faucetService';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        // Obtener el token JWT del header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Falta el token de autenticación (JWT).' },
                { status: 401 }
            );
        }

        // Verificar el token
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Token inválido o expirado.' },
                { status: 403 }
            );
        }

        const userAddress = payload.address as Address;

        // Ejecutar la transacción usando el wallet del backend
        const txHash = await claimTokens(userAddress);
        
        return NextResponse.json({ 
            success: true, 
            txHash, 
            message: 'Transacción de reclamo enviada.' 
        });
    } catch (error: any) {
        const errorMessage = error.message || 'Error desconocido al procesar el reclamo.';
        console.error("Error de reclamo:", errorMessage);
        return NextResponse.json(
            { success: false, message: `Fallo en la transacción: ${errorMessage}` },
            { status: 500 }
        );
    }
}
