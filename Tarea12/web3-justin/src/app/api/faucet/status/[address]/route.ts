// /src/app/api/faucet/status/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { getFaucetStatus } from '@/lib/faucetService';
import { verifyToken } from '@/lib/jwt';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> } // Ahora params es una Promise
) {
    try {
        // PROTEGER con JWT según la consigna
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

        // AWAIT params antes de usarlo
        const resolvedParams = await params;
        const address = resolvedParams.address as Address;

        if (!address) {
            return NextResponse.json(
                { success: false, message: 'Falta la dirección.' },
                { status: 400 }
            );
        }

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