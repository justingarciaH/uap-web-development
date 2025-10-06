import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { generateToken } from '@/lib/jwt';
import { getMessage, deleteMessage } from '@/lib/message-store';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, signature } = body;

        if (!message || !signature) {
            return NextResponse.json(
                { success: false, message: 'Faltan message o signature.' },
                { status: 400 }
            );
        }

        // Parsear el mensaje SIWE
        const siweMessage = new SiweMessage(message);
        
        // VERIFICAR que el mensaje existe en nuestro store
        const storedMessage = getMessage(siweMessage.nonce);
        
        if (!storedMessage) {
            return NextResponse.json(
                { success: false, message: 'Mensaje no encontrado o expirado. Solicita un nuevo mensaje.' },
                { status: 400 }
            );
        }

        // VERIFICAR que el mensaje coincide con el almacenado
        if (storedMessage.message !== message) {
            return NextResponse.json(
                { success: false, message: 'El mensaje no coincide con el almacenado.' },
                { status: 400 }
            );
        }

        // Validar la firma
        const validationResult = await siweMessage.verify({ signature });
        
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, message: 'Firma inválida o mensaje expirado.' },
                { status: 401 }
            );
        }

        // ELIMINAR el mensaje usado (para evitar replay attacks)
        deleteMessage(siweMessage.nonce);

        // Generar JWT
        const token = generateToken(siweMessage.address);

        return NextResponse.json({ 
            success: true,
            token, 
            address: siweMessage.address 
        });
    } catch (error) {
        console.error('Error en la validación de la firma SIWE:', error);
        return NextResponse.json(
            { success: false, message: 'Error en la validación de la firma SIWE.' },
            { status: 500 }
        );
    }
}