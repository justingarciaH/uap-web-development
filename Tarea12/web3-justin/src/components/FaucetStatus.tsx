/*
Este componente verifica 
si el usuario ya reclamó tokens.
*/

'use client'
import React from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { faucetAbi } from '../abi/faucet' // Importa el ABI
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as `0x${string}`

export default function FaucetStatus({ setDisabledReason }: { setDisabledReason: (reason: string | undefined) => void }) {
    const { address, isConnected } = useAccount()

    // Consulta si la dirección ya reclamó
    const { data: hasClaimed, isLoading } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: faucetAbi,
        functionName: 'hasAddressClaimed',
        args: [address ?? '0x'],
       query: { // <<< AÑADIR OBJETO QUERY
            enabled: isConnected, // <<< MOVER AQUÍ
            staleTime: 5000, // Opcional: para que no refetchee tan agresivamente
        }, 
    })

    React.useEffect(() => {
        if (!isConnected) {
            setDisabledReason("Conecta tu wallet para verificar el estado.");
        } else if (isLoading) {
            setDisabledReason("Verificando estado del Faucet...");
        } else if (hasClaimed) {
            setDisabledReason("Ya reclamaste tokens. Solo se permite un reclamo.");
        } else {
            setDisabledReason(undefined); // Habilita el botón
        }
    }, [isConnected, isLoading, hasClaimed, setDisabledReason])

    if (!isConnected) return <p>Estado: Desconectado</p>
    if (isLoading) return <p>Estado: Cargando...</p>
    
    return (
        <div>
            <p>Estado del Faucet: 
                {hasClaimed 
                    ? <span style={{ color: 'red' }}> Reclamado (No puedes reclamar de nuevo)</span> 
                    : <span style={{ color: 'green' }}> Disponible para reclamar</span>
                }
            </p>
        </div>
    )
}