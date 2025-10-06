import { defaultWagmiConfig } from '@web3modal/wagmi'
import { sepolia } from 'wagmi/chains'

// 1. Obtener Project ID desde las variables de entorno públicas
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (!projectId) {
  // Este error es crítico y detendría la ejecución si no se encuentra
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID no está definido en el entorno del cliente.')
}

// 2. Metadata para el modal
const metadata = {
  name: 'Faucet DApp',
  description: 'Un Faucet simple para Tokens FCT en Sepolia',
  url: 'https://myfaucet.dapp', // URL de tu aplicación
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Cadenas soportadas (solo Sepolia)
const chains = [sepolia] as const

// 4. Configuración principal de Wagmi
// Usamos defaultWagmiConfig sin modificar 'transports' de forma manual,
// ya que el projectId se encarga de la conectividad RPC necesaria.
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})
