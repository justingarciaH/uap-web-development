// src/app/components/ClaimButton.tsx
'use client'
import React from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { faucetAbi } from '../abi/faucet' // Importa el ABI
import { parseUnits } from 'viem'

const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as `0x${string}`

// Agrega una dependencia de estado para recibir la razón de deshabilitación desde FaucetStatus
export default function ClaimButton({ disabledReason }: { disabledReason?: string }) {
    const { isConnected } = useAccount()
    
    // El usePrepareContractWrite está obsoleto, es mejor usar directamente useWriteContract
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
    
    // Esperar la confirmación de la transacción
    const { isLoading: txLoading, isSuccess } = useWaitForTransactionReceipt({ 
        hash, 
        query: { enabled: !!hash } 
    })

    const handleClaim = () => {
        writeContract({
            address: FAUCET_ADDRESS,
            abi: faucetAbi,
            functionName: 'claimTokens',
        })
    }

    const isDisabled = !isConnected || !!disabledReason || isPending || txLoading;
    
    return (
        <div>
            <button 
                onClick={handleClaim} 
                disabled={isDisabled}
                style={{ padding: '10px 20px', backgroundColor: isDisabled ? 'gray' : 'blue', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                {isPending ? 'Esperando confirmación de wallet...' : 
                 txLoading ? 'Transacción en curso...' : 
                 'Reclamar tokens'}
            </button>
            {disabledReason && <div style={{ color: 'red', marginTop: '10px' }}>{disabledReason}</div>}
            {writeError && <div style={{ color: 'red', marginTop: '10px' }}>Error: {writeError.message}</div>}
            {isSuccess && <div style={{ color: 'green', marginTop: '10px' }}>¡Tokens reclamados exitosamente!</div>}
        </div>
    )
}