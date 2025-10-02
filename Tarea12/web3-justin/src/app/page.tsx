/* 
Página principal que compone los componentes anteriores: botón de conectar,
estado del faucet, botón de claim, lista de usuarios y token info.
*/
"use client"

import ConnectWallet from '../components/ConnectWallet'
import FaucetStatus from '../components/FaucetStatus'
import ClaimButton from '../components/ClaimButton'
import UsersList from '../components/UserList'
import TokenInfo from '../components/TokenInfo'
import {useState} from 'react'

export default function Page() {
    // Estado para la razón de deshabilitación del botón Claim
    const [disabledReason, setDisabledReason] = useState<string | undefined>(undefined);

    return (
      <section style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>💧 Faucet Token (Sepolia)</h1>
      
      {/* 1. Conexión de Wallet */}
      <ConnectWallet />
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>Interacción con el Faucet</h2>
      {/* 2. Verificación de Estado (establece el estado de deshabilitación) */}
      <FaucetStatus setDisabledReason={setDisabledReason} />
      
      {/* 3. Botón de Reclamar (usa el estado de deshabilitación) */}
      <ClaimButton disabledReason={disabledReason} />
      
      {/* 4. Información del Token */}
      <TokenInfo />
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>Usuarios que interactuaron</h2>
      {/* 5. Lista de Usuarios */}
      <UsersList />
      
      <hr style={{ margin: '20px 0' }} />
      
      <p style={{ fontSize: '0.9em', color: '#666' }}>
      Necesitas Sepolia ETH para pagar gas. ⛽ Faucet: <a href="https://
      cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank"
      rel="noreferrer">Sepolia faucet</a>
      </p>
      </section>
    )
}