'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import * as Ably from 'ably'
import CheckersBoard from '@/components/CheckersBoard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_KEY || ''

interface Player {
  id: string
  color: 'red' | 'black'
}

interface Room {
  id: string
  players: Player[]
  currentTurn: 'red' | 'black'
  status: 'waiting' | 'playing' | 'finished'
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [playerId, setPlayerId] = useState<string>('')
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [channel, setChannel] = useState<Ably.Types.RealtimeChannelCallbacks | null>(null)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : ''

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinRoom = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/rooms/${roomId}/join`)
      const { room: updatedRoom, playerId: newPlayerId, playerColor: color } = response.data

      setRoom(updatedRoom)
      setPlayerId(newPlayerId)
      setPlayerColor(color)
      setLoading(false)
    } catch (error: any) {
      console.error('Erro ao entrar na sala:', error)
      setError(error.response?.data?.error || 'Erro ao entrar na sala')
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    joinRoom()
  }, [joinRoom])

  useEffect(() => {
    if (!ABLY_KEY || !roomId) return

    const ably = new Ably.Realtime(ABLY_KEY)
    const newChannel = ably.channels.get(`room:${roomId}`)

    newChannel.subscribe('room-update', (message) => {
      setRoom(message.data)
    })

    newChannel.subscribe('game-move', (message) => {
      // O componente CheckersBoard irá lidar com os movimentos
    })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      ably.close()
    }
  }, [roomId])

  const handleMove = async (from: { row: number; col: number }, to: { row: number; col: number }) => {
    try {
      await axios.post(`${API_URL}/api/rooms/${roomId}/move`, {
        playerId,
        from,
        to,
      })
    } catch (error) {
      console.error('Erro ao fazer movimento:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Erro</h2>
          <p className="text-white">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Voltar ao Lobby
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg backdrop-blur-sm"
          >
            ← Voltar
          </button>

          {room?.status === 'waiting' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 flex items-center gap-3">
              <span className="text-white">Compartilhe este link:</span>
              <code className="bg-black/30 px-3 py-1 rounded text-sm text-blue-300">
                {shareUrl}
              </code>
              <button
                onClick={copyShareLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition-colors"
              >
                {copied ? '✓ Copiado!' : 'Copiar'}
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-[1fr,auto] gap-6 items-start">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
            {room?.status === 'waiting' ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Aguardando Jogador...
                </h2>
                <p className="text-gray-300">
                  Você é o jogador {playerColor === 'red' ? '🔴 Vermelho' : '⚫ Preto'}
                </p>
                <p className="text-gray-400 mt-4">
                  Compartilhe o link acima para convidar alguém!
                </p>
              </div>
            ) : (
              <CheckersBoard
                roomId={roomId}
                playerId={playerId}
                playerColor={playerColor}
                currentTurn={room?.currentTurn || 'red'}
                onMove={handleMove}
                channel={channel}
              />
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl w-full md:w-80">
            <h3 className="text-xl font-bold text-white mb-4">Informações da Sala</h3>

            <div className="space-y-3">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-400 text-sm">ID da Sala</div>
                <div className="text-white font-mono text-sm">{roomId}</div>
              </div>

              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Sua Cor</div>
                <div className="text-white font-bold">
                  {playerColor === 'red' ? '🔴 Vermelho' : '⚫ Preto'}
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Status</div>
                <div className="text-white font-bold">
                  {room?.status === 'waiting' && '⏳ Aguardando'}
                  {room?.status === 'playing' && '🎮 Jogando'}
                  {room?.status === 'finished' && '🏁 Finalizado'}
                </div>
              </div>

              {room?.status === 'playing' && (
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">Turno Atual</div>
                  <div className="text-white font-bold">
                    {room.currentTurn === 'red' ? '🔴 Vermelho' : '⚫ Preto'}
                    {room.currentTurn === playerColor && ' (Você!)'}
                  </div>
                </div>
              )}

              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Jogadores</div>
                <div className="text-white">
                  {room?.players.length || 0} / 2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
