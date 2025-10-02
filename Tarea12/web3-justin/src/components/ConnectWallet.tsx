'use client'
import React from 'react'
import { useAccount, useDisconnect } from 'wagmi' // Mantener para mostrar el estado
import { useWeb3Modal } from '@web3modal/wagmi/react' // Para usar el hook de Web3Modal

// Este componente ahora muestra el estado de conexión usando el hook de Wagmi
// y usa el botón de Web3Modal para la conexión/desconexión (si se usa el componente <w3m-button />)
export default function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()

  // Si estás usando el botón nativo de Web3Modal (<w3m-button />) puedes usar la lógica simple:
  // (Aunque es común querer mostrar la dirección manualmente)
  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-100 rounded-lg shadow-inner">
        <div className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
          Conectado: <span className="font-mono text-blue-600 break-all">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <br />
          Red: <span className="text-sm font-semibold text-gray-600">{chainId === 11155111 ? 'Sepolia' : `Chain ID: ${chainId}`}</span>
        </div>
        <button 
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out shadow-md text-sm"
        >
          Desconectar
        </button>
      </div>
    )
  }

  // Si no está conectado, mostramos el botón de Web3Modal para iniciar la conexión
  return (
    <button 
      onClick={() => open()}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-lg"
    >
      Conectar Wallet
    </button>
  )
}