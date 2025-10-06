import { NextRequest, NextResponse } from 'next/server';
import { claimTokens } from '@/lib/faucetService';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
    try {
        // Usar el middleware de autenticación
        const authResult = await authenticateRequest(request);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        const userAddress = authResult.userAddress;

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
