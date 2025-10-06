'use client'
import React from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { AuthProvider } from '@/context/AuthContext'
import { toNumber } from 'ethers'

const queryClient = new QueryClient()

// Obtener el projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID no está definido')
}

// Crear el modal FUERA del componente para evitar re-inicializaciones
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': toNumber('9999')
  }
})

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}