
'use client'
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'; 
import { useAccount } from 'wagmi'; 

export default function ClaimButton({ disabledReason }: { disabledReason?: string }) {
    const { isAuthenticated, token, userAddress, signOut } = useAuth();
    const { isConnected } = useAccount();

    const [isSending, setIsSending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const handleClaim = async () => {
        if (!isAuthenticated || !token) {
            setClaimError("Debes iniciar sesión con tu wallet.");
            return;
        }

        setIsSending(true);
        setClaimError(null);
        setTxHash(null);
        setIsSuccess(false);

        try {
            const response = await fetch('/api/faucet/claim', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // USAR JWT
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Si el backend responde con 401/403 (Token expirado), forzamos signout
                if (response.status === 401 || response.status === 403) {
                    signOut();
                    throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
                }
                throw new Error(data.message || "Fallo desconocido en el reclamo.");
            }
            
            setTxHash(data.txHash);
            setIsSuccess(true);
            // El FaucetStatus hará polling y actualizará el estado automáticamente
            // Podemos forzar un refresh del estado aquí si quisiéramos ser más rápidos,
            // pero el polling cada 5 segundos es suficiente.

        } catch (e: any) {
            console.error("Error de reclamo:", e);
            setClaimError(e.message || "Error al conectar con el backend.");
            setIsSuccess(false);
        } finally {
            setIsSending(false);
        }
    }

    const isDisabled = !isAuthenticated || !!disabledReason || isSending || isSuccess;
    
    const getButtonText = () => {
        if (!isConnected) return "Conecta tu Wallet primero";
        if (!isAuthenticated) return "Inicia Sesión (SIWE)";
        if (!!disabledReason) return disabledReason;
        if (isSending) return "Enviando Transacción al Backend...";
        if (isSuccess) return "¡Tokens Reclamados!";
        return 'Reclamar 1,000,000 Tokens';
    }

    // Determinar el error a mostrar (solo si es un error del API)
    const errorMessage = claimError; 
    
    return (
        <div className="mt-6">
            <button 
                onClick={handleClaim} 
                disabled={isDisabled}
                className={`w-full py-3 px-6 rounded-xl font-extrabold text-white transition-all duration-200 shadow-md ${
                    isSuccess 
                        ? 'bg-green-700' 
                        : isDisabled 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                }`}
            >
                {getButtonText()}
            </button>
            
            {(txHash && !claimError) && (
                <div className="mt-3 p-3 bg-blue-100 text-blue-800 text-xs rounded-lg break-all">
                    Tx Hash (Backend): {txHash}
                </div>
            )}

            {errorMessage && (
                <div className="mt-3 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                    🚨 Error: {errorMessage}
                </div>
            )}
        </div>
    )
}
