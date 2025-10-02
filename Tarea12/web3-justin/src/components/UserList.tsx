// src/app/components/userlist.tsx
'use client'
import React from 'react'
import { useReadContract } from 'wagmi'
import { faucetAbi } from '../abi/faucet' // Importa el ABI
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as `0x${string}`

export default function UsersList() {
    // Usar useReadContract
    const { data: users, isLoading } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: faucetAbi,
        functionName: 'getFaucetUsers',
        query: { // <<< AÑADIR OBJETO QUERY
            // CORRECCIÓN: 'watch: true' se reemplaza por 'refetchInterval' para polling
            refetchInterval: 4000, // Refrescar la lista cada 4 segundos
        }    })

    if (isLoading) return <div>Cargando usuarios...</div>
    if (!users || (Array.isArray(users) && users.length === 0)) return <div>No hay usuarios aún</div>
    
    return (
    <ul>
    {/* Asegúrate que users es un array de strings */}
    {(users as string[]).map((u: string) => (
    <li key={u}>
    <a href={`https://sepolia.etherscan.io/address/${u}`}
    target="_blank" rel="noreferrer" style={{ fontSize: '0.8em' }}>
    {u}
    </a>
    </li>
    ))}
    </ul>
    )
}