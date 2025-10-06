'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/context/AuthContext'; // Asumiendo que '@/context/AuthContext' es la ruta correcta

// Definición de tipos para los datos que vienen del backend
interface FaucetData {
    hasClaimed: boolean;
    balance: string;
    users: `0x${string}`[];
    faucetAmount: string;
}

interface FaucetHookReturn {
    data: FaucetData | null;
    isLoading: boolean;
    error: string | null;
    // Esta razón es usada por ClaimButton
    disabledReason: string | undefined; 
}

const API_BASE_URL = '/api/faucet/status';

export function useFaucetData(): FaucetHookReturn {
    const { address, isConnected } = useAccount();
    // Usamos useAuth para obtener el token JWT y el estado de sesión
    const { isAuthenticated, token, signOut } = useAuth();
    
    const [data, setData] = useState<FaucetData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lógica de Fetch de Datos Protegida (con useCallback para optimización)
    const fetchFaucetStatus = React.useCallback(async () => {
        // No hay autenticación o dirección, no se hace el fetch
        if (!isAuthenticated || !token || !address) {
            setData(null);
            // Si no está conectado, aseguramos que el error sea claro
            if (!isConnected) setError("Wallet desconectada.");
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/${address}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // JWT Requerido
                },
            });

            if (response.status === 401 || response.status === 403) {
                signOut();
                throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Fallo al obtener el estado del faucet.");
            }

            const result = await response.json();
            // Aseguramos que users sea un array válido si es undefined
            if (result.users === undefined) {
                 result.users = [];
            }
            setData(result);
        } catch (e: any) {
            console.error("Error al obtener estado:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, token, address, signOut, isConnected]);

    // Efecto para iniciar el polling solo si está autenticado
    useEffect(() => {
        if (isAuthenticated && token && address) {
            fetchFaucetStatus();

            // Configurar polling para actualización en tiempo real (cada 10 segundos para reducir carga)
            const intervalId = setInterval(fetchFaucetStatus, 10000);

            return () => clearInterval(intervalId);
        }
    }, [fetchFaucetStatus, isAuthenticated, token, address]);

    // Determinar la razón de deshabilitación (Disabled Reason) para el ClaimButton
    const disabledReason = useMemo(() => {
        if (!isConnected) return "Wallet desconectada. Conecta tu wallet para iniciar sesión.";
        if (!isAuthenticated) return "Necesitas iniciar sesión (SIWE) para reclamar tokens.";
        if (isLoading) return "Cargando estado del faucet...";
        if (error) return `Error de conexión: ${error}`;
        if (data?.hasClaimed) return "Reclamado (No puedes reclamar de nuevo).";
        
        return undefined; // Disponible
    }, [isConnected, isAuthenticated, isLoading, error, data]);

    return {
        data,
        isLoading,
        error,
        disabledReason
    };
}
