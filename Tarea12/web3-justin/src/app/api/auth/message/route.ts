import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { storeMessage } from '@/lib/message-store';

// POST: Genera un nuevo mensaje SIWE
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { address, chainId } = body;

        if (!address || !chainId) {
            return NextResponse.json(
                { success: false, message: 'Faltan address o chainId.' },
                { status: 400 }
            );
        }

        const nonce = Date.now().toString();
        
        // Construir el mensaje SIWE con el formato correcto
        const siweMessage = new SiweMessage({
            domain: 'localhost:3000', // Sin protocolo, solo dominio:puerto
            address: address,
            statement: 'Firma este mensaje para iniciar sesion en el Faucet DApp.', // Sin tildes ni caracteres especiales
            uri: 'http://localhost:3000', // URL completa
            version: '1',
            chainId: Number(chainId),
            nonce: nonce,
        });
        
        const message = siweMessage.prepareMessage();
        
        // GUARDAR el mensaje en el store
        storeMessage(nonce, message, address);

        return NextResponse.json({ 
            success: true, 
            message: message,
            nonce: nonce // Retornar el nonce para referencia
        });
    } catch (error) {
        console.error('Error al generar el mensaje SIWE:', error);
        return NextResponse.json(
            { success: false, message: 'Error al generar el mensaje SIWE.' },
            { status: 500 }
        );
    }
}

// GET: Permite leer mensajes almacenados (para debugging o verificación)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const nonce = searchParams.get('nonce');

        if (!nonce) {
            return NextResponse.json(
                { success: false, message: 'Nonce requerido como query param.' },
                { status: 400 }
            );
        }

        const { getMessage } = await import('@/lib/message-store');
        const stored = getMessage(nonce);

        if (!stored) {
            return NextResponse.json(
                { success: false, message: 'Mensaje no encontrado o expirado.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: stored.message,
            address: stored.address
        });
    } catch (error) {
        console.error('Error al obtener el mensaje:', error);
        return NextResponse.json(
            { success: false, message: 'Error al obtener el mensaje.' },
            { status: 500 }
        );
    }
}