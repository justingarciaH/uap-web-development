/* Página principal que compone los componentes anteriores: botón de conectar,
estado del faucet, botón de claim, lista de usuarios y token info.
*/
"use client"

// Corregido: Importación de useFaucetData (asumiendo ruta relativa correcta)
import { useFaucetData } from '../app/hooks/useFaucetData'; 
import ConnectWallet from '../components/ConnectWallet'
import FaucetStatus from '../components/FaucetStatus'
import ClaimButton from '../components/ClaimButton'
import UsersList from '../components/UserList'
import TokenInfo from '../components/TokenInfo'
import { useAuth } from '@/context/AuthContext';
import { useAccount } from 'wagmi';

export default function Page() {
    // 1. Obtener todos los datos del hook centralizado
    const { data, isLoading, error, disabledReason } = useFaucetData();
    // 2. Obtener estado de conexión/autenticación
    const { isAuthenticated } = useAuth();
    const { isConnected } = useAccount();

    // 3. Variables para props, asegurando valores predeterminados seguros
    const balance = data?.balance || '0';
    const faucetAmount = data?.faucetAmount || '1000000';
    // Nota: El tipo en UsersList es 'string[]', y el hook devuelve `0x${string}`[], que es compatible con 'string[]'
    const users = data?.users || [];
    const hasClaimed = data?.hasClaimed || false;

    return (
        <section className="min-h-screen bg-gray-800 p-4 sm:p-8">
            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">
                <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-6">
                    💧 DApp de Justino para conectar a la chainblock
                </h1>
                
                {/* Sección de Conexión de Wallet */}
                <div className="mb-6">
                    <ConnectWallet />
                </div>
                
                <hr className="my-6 border-gray-200" />
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reclamar Tokens</h2>
                
                {/* Estado del Faucet: Recibe solo el estado para mostrarlo */}
                <div className="mb-4">
                    <FaucetStatus 
                        isLoading={isLoading} 
                        error={error} 
                        isAuthenticated={isAuthenticated}
                        isConnected={isConnected}
                        hasClaimed={hasClaimed}
                    />
                </div>

                {/* Botón de Reclamo: Recibe la razón de deshabilitación */}
                <ClaimButton disabledReason={disabledReason} />
                
                {/* Información del Token y Balance: Solo se muestra si está autenticado y tiene datos */}
                {isAuthenticated && data && (
                    <div className="mt-6">
                        <TokenInfo balance={balance} faucetAmount={faucetAmount} />
                    </div>
                )}
                
                <hr className="my-6 border-gray-200" />
                
                <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios del Faucet</h2>
                
                {/* Lista de Usuarios: Solo se muestra si está autenticado y tiene datos */}
                {isAuthenticated && data && (
                    <UsersList users={users} />
                )}
                
                <hr className="my-6 border-gray-200" />
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                    <p>⚠️ Si necesitas Sepolia ETH para pagar el gas de las transacciones.</p>
                    <p className="mt-1">Faucet: <a 
                        href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" 
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Obtén Sepolia ETH aquí
                    </a></p>
                </div>
            </div>
        </section>
    )
}
