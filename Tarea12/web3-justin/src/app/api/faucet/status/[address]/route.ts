import { NextRequest, NextResponse } from 'next/server';
import { getFaucetStatus } from '@/lib/faucetService';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        // Validar JWT válido (independiente del address consultado)
        const authResult = await authenticateRequest(request);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        // Obtener address del parámetro URL según especificación
        const resolvedParams = await params;
        const address = resolvedParams.address as `0x${string}`;

        if (!address) {
            return NextResponse.json(
                { success: false, message: 'Falta la dirección.' },
                { status: 400 }
            );
        }

        // Verificar si la dirección ya reclamó tokens, consultar balance y datos del contrato
        const status = await getFaucetStatus(address);

        return NextResponse.json({
            success: true,
            ...status
        });
    } catch (error: any) {
        console.error('Error al obtener el estado del faucet:', error);
        return NextResponse.json(
            { success: false, message: 'Error al obtener el estado del faucet.' },
            { status: 500 }
        );
    }
}
