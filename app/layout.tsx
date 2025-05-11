import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stockea3 - Sistema de Gestión de Stock",
  description: "Aplicación para gestionar inventario, productos, proveedores y más",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
