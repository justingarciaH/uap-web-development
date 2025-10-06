import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// CORRECCIÓN: Ahora se importa como exportación por defecto (sin llaves)
import Web3Provider from "./providers"; 

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Faucet Token DApp", 
	description: "Aplicación React Web3 para el Faucet Token en Sepolia", // Descripción actualizada
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Web3Provider>{children}</Web3Provider>
			</body>
		</html>
	);
}
