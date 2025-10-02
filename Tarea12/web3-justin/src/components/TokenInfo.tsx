/*
muestra la cantidad que entrega el faucet 
( getFaucetAmount ) y el balance
del usuario ( balanceOf ). Formatea usando viem
*/

'use client'
import React from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { faucetAbi } from '../abi/faucet'
import { formatUnits } from 'viem'
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as `0x${string}`

export default function TokenInfo() {
    const { address, isConnected } = useAccount()
    
    // Leer la cantidad que entrega el faucet
    const { data: faucetAmount } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: faucetAbi,
        functionName: 'getFaucetAmount',
    })
    
    // Leer el balance del usuario
    const { data: balance } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: faucetAbi,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
        query: { // <<< AÑADIR OBJETO QUERY
            enabled: isConnected, // <<< MOVER AQUÍ
            // 'watch' (polling) ya no se usa directamente.
            // La forma moderna es usar 'refetchInterval' si quieres polling estricto, 
            // pero el `watch` de Wagmi se maneja a través de `staleTime` y `refetchOnWindowFocus`,
            // o con un `refetchInterval` si es necesario. Para este caso, solo `enabled` es crucial.
        }
    })

    const decimals = 18 
    
    return (
        <div>
            <h3>Información del Token</h3>
            <p>Cantidad por reclamo: {faucetAmount ? 
            formatUnits(BigInt(faucetAmount as any), decimals) : '—'} tokens</p>
            <p>Tu balance: {isConnected && balance ? 
            formatUnits(BigInt(balance as any), decimals) : isConnected ? 'Cargando...' : '— (Conecta tu wallet)'}</p>
        </div>
    )
}