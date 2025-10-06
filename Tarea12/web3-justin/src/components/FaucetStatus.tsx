'use client'
import React from 'react';

// Se eliminan las props antiguas y se usan solo las de estado
interface FaucetStatusProps {
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isConnected: boolean;
    hasClaimed: boolean;
}

// Ya no acepta setDisabledReason, ya que useFaucetData lo maneja
export default function FaucetStatus({ 
    isLoading, 
    error, 
    isAuthenticated,
    isConnected,
    hasClaimed
}: FaucetStatusProps) {
    let statusMessage: string;
    let bgColor: string;

    // Lógica para determinar el mensaje y color basado en las props
    if (!isConnected) {
        statusMessage = "Desconectado. Conecta tu wallet.";
        bgColor = "bg-gray-500";
    } else if (!isAuthenticated) {
        statusMessage = "Conectado. Por favor, inicia sesión (SIWE) para continuar.";
        bgColor = "bg-yellow-600";
    } else if (isLoading) {
        statusMessage = "Autenticado. Cargando estado del Faucet...";
        bgColor = "bg-blue-600";
    } else if (error) {
        statusMessage = `Error de estado: ${error}`;
        bgColor = "bg-red-700";
    } else if (hasClaimed) {
        statusMessage = "¡Tokens Reclamados! No puedes reclamar de nuevo.";
        bgColor = "bg-red-500";
    } else {
        statusMessage = "¡Listo para Reclamar!";
        bgColor = "bg-green-600";
    }

    return (
        // Se mejora el estilo para que sea un bloque de estado claro
        <div className={`p-4 rounded-xl text-white font-extrabold text-center shadow-lg transition-colors duration-300 ${bgColor}`}>
            {statusMessage}
        </div>
    );
}
