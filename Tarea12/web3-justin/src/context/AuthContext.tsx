'use client'
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect, useChainId } from 'wagmi';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userAddress: `0x${string}` | undefined;
    isSigning: boolean;
    signIn: () => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = '/api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { disconnect } = useDisconnect();
    const { signMessageAsync, isPending: isSigning } = useSignMessage();

    const [token, setToken] = useState<string | null>(null);
    const [userAddress, setUserAddress] = useState<`0x${string}` | undefined>(undefined);
    const autoSigninAttempted = useRef(false);

    const isAuthenticated = !!token && !!userAddress && isConnected;

    const signOut = useCallback(() => {
        setToken(null);
        setUserAddress(undefined);
        localStorage.removeItem('jwt_token');
        if (isConnected) {
            disconnect();
        }
    }, [isConnected, disconnect]);

    const signIn = useCallback(async () => {
        if (!address || !chainId) return;

        try {
            // 1. Obtener el mensaje SIWE del backend
            const messageResponse = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, chainId }),
            });

            if (!messageResponse.ok) {
                const errorData = await messageResponse.json();
                throw new Error(errorData.message || "Fallo al obtener el mensaje SIWE.");
            }
            
            const { message, nonce } = await messageResponse.json();

            // 2. Firmar el mensaje con la wallet
            const signature = await signMessageAsync({ message });

            // 3. Enviar la firma al backend para obtener el JWT
            const signinResponse = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, signature }),
            });

            if (!signinResponse.ok) {
                const errorData = await signinResponse.json();
                throw new Error(errorData.message || "Fallo al validar la firma.");
            }
            
            const data = await signinResponse.json();
            
            // 4. Guardar JWT y estado
            setToken(data.token);
            setUserAddress(data.address as `0x${string}`);
            localStorage.setItem('jwt_token', data.token);

        } catch (e: any) {
            console.error("Error durante el SIWE:", e.message);
            alert(`Fallo en autenticación: ${e.message}`);
            signOut();
        }
    }, [address, chainId, signMessageAsync, signOut]);

    useEffect(() => {
        if (isConnected && address && !autoSigninAttempted.current) {
            const storedToken = localStorage.getItem('jwt_token');
            if (storedToken) {
                setToken(storedToken);
                setUserAddress(address);
                autoSigninAttempted.current = true;
            }
        }
        // Si se desconecta, permitir intentar de nuevo al reconectar
        if (!isConnected) {
            autoSigninAttempted.current = false;
        }
    }, [isConnected, address]);
    
    useEffect(() => {
        if (!isConnected && token) {
            signOut();
        }
    }, [isConnected, token, signOut]);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            token, 
            userAddress, 
            isSigning, 
            signIn, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
