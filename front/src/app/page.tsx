'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getNickname, setNickname } from '@/lib/nickname'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface RoomItem {
  id: string
  players: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: string
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [nickname, setNicknameState] = useState('')
  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const router = useRouter()

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms`)
      setRooms(response.data.rooms || [])
    } catch (error) {
      console.error('Erro ao buscar salas:', error)
    } finally {
      setLoadingRooms(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    // Atualizar lista a cada 3 segundos
    const interval = setInterval(fetchRooms, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedNickname = getNickname()
    if (savedNickname) {
      setNicknameState(savedNickname)
    }
  }, [])

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      setNickname(nickname.trim())
      setShowNicknameInput(false)
    }
  }

  const createRoom = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_URL}/api/rooms`)
      const { roomId } = response.data
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Erro ao criar sala:', error)
      alert('Erro ao criar sala. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting':
        return '⏳ Aguardando'
      case 'playing':
        return '🎮 Jogando'
      case 'finished':
        return '🏁 Finalizado'
      default:
        return status
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const created = new Date(dateString).getTime()
    const diffMinutes = Math.floor((now - created) / 60000)

    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes === 1) return '1 min atrás'
    if (diffMinutes < 60) return `${diffMinutes} min atrás`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1 hora atrás'
    return `${diffHours} horas atrás`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2">
            🎮
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Damas Online
          </h2>
          <p className="text-gray-300 text-sm sm:text-lg">
            Jogue damas 1v1 em tempo real
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
          {/* Seção de Nickname */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm sm:text-base">👤 Seu Nick:</span>
                <span className="text-blue-300 font-bold text-sm sm:text-base">
                  {nickname || 'Anônimo'}
                </span>
              </div>
              <button
                onClick={() => setShowNicknameInput(!showNicknameInput)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors"
              >
                {showNicknameInput ? 'Cancelar' : 'Alterar'}
              </button>
            </div>
            {showNicknameInput && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNicknameState(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                  placeholder="Digite seu nickname..."
                  maxLength={20}
                  className="flex-1 bg-black/30 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:outline-none text-sm sm:text-base"
                  autoFocus
                />
                <button
                  onClick={handleSaveNickname}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-colors"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Criando...' : '✨ Criar Nova Sala'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-300">ou escolha uma sala</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg">Salas Disponíveis</h3>

            {loadingRooms ? (
              <div className="text-center py-8 text-gray-400">
                Carregando salas...
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhuma sala disponível. Crie uma nova!
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => joinRoom(room.id)}
                    disabled={room.status === 'finished'}
                    className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg p-3 sm:p-4 transition-all text-left border border-white/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div className="flex-1">
                        <div className="text-white font-mono text-xs sm:text-sm mb-1">
                          Sala: {room.id}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-gray-300">
                            👥 {room.players}/2
                          </span>
                          <span className="text-gray-300">
                            {getStatusLabel(room.status)}
                          </span>
                          <span className="text-gray-400">
                            {getTimeAgo(room.createdAt)}
                          </span>
                        </div>
                      </div>
                      {room.status === 'waiting' && room.players < 2 && (
                        <div className="sm:ml-4">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">
                            Entrar →
                          </span>
                        </div>
                      )}
                      {room.status === 'playing' && (
                        <div className="sm:ml-4">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">
                            Assistir →
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm">
          <p>Crie uma sala ou entre em uma disponível!</p>
          <p className="mt-1 text-xs">A lista atualiza automaticamente a cada 3 segundos</p>
        </div>
      </div>
    </main>
  )
}
