
// src/components/ConnectWallet.tsx
'use client'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAuth } from '@/context/AuthContext'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal() // Hook correcto para abrir el modal
  const { isAuthenticated, isSigning, signIn, signOut } = useAuth()

  // Memoizar la dirección truncada para evitar re-calculaciones
  const truncatedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, [address]);

  // 1. Mostrar solo el botón de conexión si no está conectado
  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-200 shadow-md"
      >
        Conectar Wallet
      </button>
    )
  }

  // 2. Si está conectado pero NO AUTENTICADO (no tiene JWT), forzar SIWE
  if (isConnected && !isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-yellow-100 border border-yellow-300 rounded-xl shadow-inner">
        <p className="text-sm font-semibold text-gray-800">
          Wallet conectada: {truncatedAddress}
        </p>
        <button
          onClick={signIn}
          disabled={isSigning}
          className="py-2 px-4 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition duration-200 disabled:bg-gray-500"
        >
          {isSigning ? 'Firmando...' : 'Iniciar Sesión (SIWE)'}
        </button>
      </div>
    )
  }

  // 3. Si está conectado Y AUTENTICADO
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl shadow-md">
      <p className="text-sm font-medium text-gray-700">
        Autenticado: {truncatedAddress}
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => open({ view: 'Networks' })}
          className="py-2 px-4 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Cambiar Red
        </button>
        <button 
          onClick={signOut}
          className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200"
        >
          Desconectar
        </button>
      </div>
    </div>
  )
}
