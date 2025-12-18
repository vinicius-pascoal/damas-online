import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Damas Online - Jogo Multiplayer',
  description: 'Jogo de damas online 1v1 em tempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
