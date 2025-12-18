'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import * as Ably from 'ably'
import CheckersBoard from '@/components/CheckersBoard'
import { getClientId } from '@/lib/clientId'

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
  winner?: 'red' | 'black'
  endReason?: string
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
  const hasJoinedRef = useRef(false)
  const [showGameEndModal, setShowGameEndModal] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : ''

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const joinRoom = async () => {
      if (hasJoinedRef.current) return

      // Obtém clientId persistente
      const clientId = getClientId()

      hasJoinedRef.current = true

      try {
        const response = await axios.post(`${API_URL}/api/rooms/${roomId}/join`, { clientId })
        const { room: updatedRoom, playerId: newPlayerId, playerColor: color } = response.data

        setRoom(updatedRoom)
        setPlayerId(newPlayerId)
        setPlayerColor(color)
        setLoading(false)
      } catch (error: any) {
        console.error('Erro ao entrar na sala:', error)
        setError(error.response?.data?.error || 'Erro ao entrar na sala')
        setLoading(false)
        hasJoinedRef.current = false // Reset em caso de erro
      }
    }

    joinRoom()

    // Cleanup: avisar servidor quando sair
    return () => {
      if (hasJoinedRef.current && playerId) {
        // Usar navigator.sendBeacon para garantir envio mesmo ao fechar aba
        const data = JSON.stringify({ playerId })
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon(`${API_URL}/api/rooms/${roomId}/leave`, blob)
      }
    }
  }, [roomId, playerId])

  useEffect(() => {
    if (!ABLY_KEY || !roomId) return

    const ably = new Ably.Realtime(ABLY_KEY)
    const newChannel = ably.channels.get(`room:${roomId}`)

    newChannel.subscribe('room-update', (message) => {
      const updatedRoom = message.data
      setRoom(updatedRoom)

      // Mostrar modal quando o jogo terminar
      if (updatedRoom.status === 'finished' && !showGameEndModal) {
        setShowGameEndModal(true)
      }
    })

    newChannel.subscribe('game-move', (message) => {
      // O componente CheckersBoard irá lidar com os movimentos
    })

    newChannel.subscribe('player-left', (message) => {
      // Mostrar modal será acionado pelo room-update
    })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      ably.close()
    }
  }, [roomId, playerId, showGameEndModal])

  const handlePlayAgain = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/rooms`)
      const newRoomId = response.data.room.id
      router.push(`/room/${newRoomId}`)
    } catch (error) {
      console.error('Erro ao criar nova sala:', error)
    }
  }

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
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg backdrop-blur-sm text-sm sm:text-base"
          >
            ← Voltar
          </button>

          {room?.status === 'waiting' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-white text-sm sm:text-base">Compartilhe este link:</span>
              <code className="bg-black/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm text-blue-300 break-all">
                {shareUrl}
              </code>
              <button
                onClick={copyShareLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 rounded transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                {copied ? '✓ Copiado!' : 'Copiar'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 sm:gap-6 items-start">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 sm:p-6 shadow-2xl">
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

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl w-full lg:w-80">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Informações da Sala</h3>

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

      {/* Modal de Vitória/Derrota */}
      {showGameEndModal && room?.status === 'finished' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full transform animate-scaleIn relative">
            {/* Confetes animados */}
            {room.winner === playerColor && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-10%',
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="text-center relative z-10">
              {/* Ícone animado */}
              <div className="text-6xl sm:text-8xl mb-3 sm:mb-4 animate-bounce">
                {room.winner === playerColor ? '🏆' : '😢'}
              </div>

              {/* Título */}
              <h2 className={`text-3xl sm:text-4xl font-bold mb-2 ${room.winner === playerColor ? 'text-yellow-400' : 'text-red-400'
                }`}>
                {room.winner === playerColor ? 'Vitória!' : 'Derrota'}
              </h2>

              {/* Mensagem */}
              <p className="text-white text-base sm:text-lg mb-4 sm:mb-6">
                {room.endReason === 'player_left'
                  ? 'O oponente saiu da partida'
                  : room.winner === playerColor
                    ? 'Parabéns! Você venceu a partida!'
                    : 'Não foi dessa vez, mas você jogou bem!'
                }
              </p>

              {/* Informação do vencedor */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
                <div className="text-gray-300 text-sm mb-1">Vencedor</div>
                <div className="text-white font-bold text-xl">
                  {room.winner === 'red' ? '🔴 Vermelho' : '⚫ Preto'}
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                >
                  🏠 Lobby
                </button>
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  🎮 Jogar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
