const express = require('express')
const cors = require('cors')
const Ably = require('ably')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Ably setup
const ably = new Ably.Realtime(process.env.ABLY_API_KEY || '')

// Armazenamento em memória (em produção, usar Redis ou banco de dados)
const rooms = new Map()

// Inicializar tabuleiro de damas
function initializeBoard() {
  const board = {}

  // Peças pretas (3 primeiras linhas)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[`${row}-${col}`] = { color: 'black', type: 'normal' }
      }
    }
  }

  // Peças vermelhas (3 últimas linhas)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[`${row}-${col}`] = { color: 'red', type: 'normal' }
      }
    }
  }

  return board
}

// Criar nova sala
app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4().substring(0, 8)

  const room = {
    id: roomId,
    players: [],
    currentTurn: 'red',
    status: 'waiting', // waiting, playing, finished
    board: initializeBoard(),
    createdAt: new Date(),
  }

  rooms.set(roomId, room)

  console.log(`Sala criada: ${roomId}`)
  res.json({ roomId, room })
})

// Entrar em uma sala
app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params
  const { clientId } = req.body || {}
  const userAgent = req.headers['user-agent'] || 'unknown'
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString()
  const room = rooms.get(roomId)

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' })
  }

  // Idempotência: se já existe player com o mesmo clientId, retorna sem adicionar novamente
  if (clientId) {
    const existingPlayer = room.players.find(p => p.clientId === clientId)
    if (existingPlayer) {
      // Se já tem 2 jogadores, mantém status playing
      rooms.set(roomId, room)
      const channel = ably.channels.get(`room:${roomId}`)
      channel.publish('room-update', room)
      return res.json({ room, playerId: existingPlayer.id, playerColor: existingPlayer.color })
    }
  }

  if (room.players.length >= 2) {
    return res.status(400).json({ error: 'Sala cheia' })
  }

  // Guard: evita segundo join imediato do mesmo cliente (IP/UA) em dev/strict mode
  if (room.players.length === 1) {
    const first = room.players[0]
    // Se o segundo join vier do mesmo IP/UA em janela de 2s, tratar como idempotente
    const twoSeconds = 2000
    const now = Date.now()
    const firstJoinTime = new Date(first.joinedAt).getTime()
    if (first.ip === ip && first.userAgent === userAgent && (now - firstJoinTime) < twoSeconds) {
      const channel = ably.channels.get(`room:${roomId}`)
      channel.publish('room-update', room)
      return res.json({ room, playerId: first.id, playerColor: first.color })
    }
  }

  const playerId = uuidv4()
  const playerColor = room.players.length === 0 ? 'red' : 'black'

  const player = {
    id: playerId,
    color: playerColor,
    joinedAt: new Date(),
    clientId: clientId || undefined,
    ip,
    userAgent,
  }

  room.players.push(player)

  // Se 2 jogadores, iniciar jogo
  if (room.players.length === 2) {
    room.status = 'playing'
  }

  rooms.set(roomId, room)

  // Notificar via Ably
  const channel = ably.channels.get(`room:${roomId}`)
  channel.publish('room-update', room)

  console.log(`Jogador ${playerId} (${playerColor}) entrou na sala ${roomId} clientId=${clientId || 'none'} ip=${ip} ua=${userAgent}`)

  res.json({ room, playerId, playerColor })
})

// Sair de uma sala
app.post('/api/rooms/:roomId/leave', (req, res) => {
  const { roomId } = req.params
  const { playerId } = req.body

  const room = rooms.get(roomId)

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' })
  }

  const playerIndex = room.players.findIndex(p => p.id === playerId)

  if (playerIndex === -1) {
    return res.status(404).json({ error: 'Jogador não encontrado na sala' })
  }

  const leavingPlayer = room.players[playerIndex]

  // Se a partida estava em andamento, o outro jogador vence
  if (room.status === 'playing' && room.players.length === 2) {
    const otherPlayer = room.players.find(p => p.id !== playerId)
    room.status = 'finished'
    room.winner = otherPlayer?.color || null
    room.endReason = 'player_left'

    console.log(`Jogador ${playerId} (${leavingPlayer.color}) saiu da sala ${roomId} - Partida encerrada`)
  } else {
    console.log(`Jogador ${playerId} (${leavingPlayer.color}) saiu da sala ${roomId}`)
  }

  // Remove o jogador da sala
  room.players.splice(playerIndex, 1)

  // Se não sobrou ninguém, pode deletar a sala (opcional)
  if (room.players.length === 0) {
    rooms.delete(roomId)
    console.log(`Sala ${roomId} removida (sem jogadores)`)
  } else {
    rooms.set(roomId, room)
  }

  // Notificar via Ably
  const channel = ably.channels.get(`room:${roomId}`)
  channel.publish('room-update', room)
  channel.publish('player-left', { playerId, playerColor: leavingPlayer.color })

  res.json({ success: true, room })
})

// Fazer movimento
app.post('/api/rooms/:roomId/move', (req, res) => {
  const { roomId } = req.params
  const { playerId, from, to } = req.body

  const room = rooms.get(roomId)

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' })
  }

  if (room.status !== 'playing') {
    return res.status(400).json({ error: 'Jogo não está em andamento' })
  }

  // Verificar se é o turno do jogador
  const player = room.players.find(p => p.id === playerId)
  if (!player || player.color !== room.currentTurn) {
    return res.status(400).json({ error: 'Não é seu turno' })
  }

  // Executar movimento
  const piece = room.board[`${from.row}-${from.col}`]
  if (!piece || piece.color !== player.color) {
    return res.status(400).json({ error: 'Movimento inválido' })
  }

  // Remover peça da posição antiga
  delete room.board[`${from.row}-${from.col}`]

  // Verificar se é uma captura
  const rowDiff = Math.abs(to.row - from.row)
  if (rowDiff === 2) {
    // Remover peça capturada
    const midRow = (from.row + to.row) / 2
    const midCol = (from.col + to.col) / 2
    delete room.board[`${midRow}-${midCol}`]
  }

  // Verificar promoção a rei
  let newPiece = { ...piece }
  if ((piece.color === 'red' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
    newPiece.type = 'king'
  }

  // Adicionar peça na nova posição
  room.board[`${to.row}-${to.col}`] = newPiece

  // Alternar turno
  room.currentTurn = room.currentTurn === 'red' ? 'black' : 'red'

  // Verificar vitória (simplificado - verificar se oponente não tem mais peças)
  const redPieces = Object.values(room.board).filter(p => p && p.color === 'red').length
  const blackPieces = Object.values(room.board).filter(p => p && p.color === 'black').length

  if (redPieces === 0 || blackPieces === 0) {
    room.status = 'finished'
    room.winner = redPieces === 0 ? 'black' : 'red'
  }

  rooms.set(roomId, room)

  // Notificar via Ably
  const channel = ably.channels.get(`room:${roomId}`)
  channel.publish('game-move', { board: room.board, currentTurn: room.currentTurn })
  channel.publish('room-update', room)

  console.log(`Movimento na sala ${roomId}: ${from.row},${from.col} -> ${to.row},${to.col}`)

  res.json({ room })
})

// Listar todas as salas
app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    players: room.players.length,
    status: room.status,
    createdAt: room.createdAt,
  }))

  // Ordenar por data de criação (mais recentes primeiro)
  roomsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json({ rooms: roomsList })
})

// Obter informações da sala
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params
  const room = rooms.get(roomId)

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' })
  }

  res.json({ room })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ably conectado: ${process.env.ABLY_API_KEY ? 'Sim' : 'Não (configure ABLY_API_KEY)'}`)
})
