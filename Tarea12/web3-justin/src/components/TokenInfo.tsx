import React from 'react'

interface TokenInfoProps {
    balance: string | undefined;
    faucetAmount: string;
}

export default function TokenInfo({ balance, faucetAmount }: TokenInfoProps) {
    return (
        <div className="mt-4 p-3 bg-white rounded-lg shadow-inner">
            <h3 className="text-md font-bold text-gray-700 mb-2">Información del Token</h3>
            <p className="text-sm">
                <span className="font-semibold">Cantidad por reclamo:</span> {faucetAmount} FCT
            </p>
            <p className="text-sm">
                <span className="font-semibold">Tu balance:</span> {balance ? balance : '...'} FCT
            </p>
        </div>
    )
}
