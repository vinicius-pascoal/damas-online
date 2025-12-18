'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [roomId, setRoomId] = useState('')
  const router = useRouter()

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

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-2">
            🎮
          </h1>
          <h2 className="text-4xl font-bold text-white mb-2">
            Damas Online
          </h2>
          <p className="text-gray-300 text-lg">
            Jogue damas 1v1 em tempo real
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl space-y-6">
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
              <span className="px-2 bg-transparent text-gray-300">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Digite o ID da sala"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              🚪 Entrar na Sala
            </button>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm">
          <p>Crie uma sala e compartilhe o link com um amigo!</p>
        </div>
      </div>
    </main>
  )
}
