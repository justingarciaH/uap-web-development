import { 
    createPublicClient, 
    createWalletClient, 
    http, 
    formatUnits, 
    Address,
    Hex
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts'; 
import { sepolia } from 'viem/chains';
import { faucetAbi } from '@/abi/faucet';

// Variables de entorno del servidor
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as Address;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !FAUCET_ADDRESS || !RPC_URL) {
    throw new Error("Variables de entorno (PRIVATE_KEY, NEXT_PUBLIC_FAUCET_ADDRESS, NEXT_PUBLIC_SEPOLIA_RPC_URL) son necesarias para FaucetService.");
}

const account = privateKeyToAccount(PRIVATE_KEY);

// Cliente público para lecturas
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
});

// Cliente de wallet para escrituras
const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
});

/**
 * Ejecuta la función claimTokens en el contrato
 * @param userAddress Dirección del usuario que reclama
 * @returns Hash de la transacción
 */
export async function claimTokens(userAddress: Address): Promise<Hex> {
    const args = [] as const;
    
    // Estimación de gas y simulación
    const { request } = await publicClient.simulateContract({
        account,
        address: FAUCET_ADDRESS,
        abi: faucetAbi,
        functionName: 'claimTokens',
        args: args,
        chain: sepolia,
    });

    // Escritura de la transacción
    const hash = await walletClient.writeContract(request);
    return hash;
}

/**
 * Obtiene el estado del faucet, balance y lista de usuarios
 * @param userAddress Dirección del usuario a verificar
 */
export async function getFaucetStatus(userAddress: Address) {
    // Lecturas múltiples en paralelo
    const [hasClaimed, balance, users, faucetAmount] = await publicClient.multicall({
        contracts: [
            {
                address: FAUCET_ADDRESS,
                abi: faucetAbi,
                functionName: 'hasAddressClaimed',
                args: [userAddress] as const,
            },
            {
                address: FAUCET_ADDRESS,
                abi: faucetAbi,
                functionName: 'balanceOf',
                args: [userAddress] as const,
            },
            {
                address: FAUCET_ADDRESS,
                abi: faucetAbi,
                functionName: 'getFaucetUsers',
            },
            {
                address: FAUCET_ADDRESS,
                abi: faucetAbi,
                functionName: 'getFaucetAmount',
            },
        ],
    });

    const decimals = 18;

    const formattedBalance = balance.result !== undefined && typeof balance.result === 'bigint'
        ? formatUnits(balance.result, decimals)
        : '0';

    const formattedFaucetAmount = faucetAmount.result !== undefined && typeof faucetAmount.result === 'bigint'
        ? formatUnits(faucetAmount.result, decimals)
        : '1000000';

    return {
        hasClaimed: hasClaimed.result as boolean,
        balance: formattedBalance,
        users: users.result as Address[] | undefined,
        faucetAmount: formattedFaucetAmount,
    };
}
