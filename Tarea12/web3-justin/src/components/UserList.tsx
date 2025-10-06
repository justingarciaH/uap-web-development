'use client'
import React from 'react'

interface UsersListProps {
    users: string[];
}

export default function UsersList({ users }: UsersListProps) {
    if (!users || users.length === 0) {
        return <div className="mt-4 p-3 text-center text-gray-500 bg-white rounded-lg">No hay usuarios que hayan reclamado aún.</div>
    }

    // Mostrar solo los primeros 10 usuarios para mantener el componente ligero
    const displayUsers = users.slice(0, 10);

    return (
        <div className="mt-4 p-4 bg-white rounded-xl shadow-inner">
            <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">
                Usuarios que Interactuaron ({users.length} total)
            </h3>
            <ul className="space-y-2 text-sm">
                {displayUsers.map((user, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg font-mono text-xs break-all">
                        <span>{index + 1}.</span>
                        <span className="text-blue-600 font-medium ml-2">{user}</span>
                    </li>
                ))}
                {users.length > 10 && (
                     <li className="text-center text-xs text-gray-500 pt-2">... y {users.length - 10} más</li>
                )}
            </ul>
        </div>
    )
}
