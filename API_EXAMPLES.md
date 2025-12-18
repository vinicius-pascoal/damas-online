# 🧪 Exemplos de API - Damas Online

Este arquivo contém exemplos práticos de como usar a API do jogo.

## Base URL

```
http://localhost:4000
```

## Exemplos com cURL

### 1. Health Check

Verificar se o servidor está rodando:

```bash
curl http://localhost:4000/health
```

**Resposta**:
```json
{
  "status": "ok",
  "rooms": 3
}
```

### 2. Criar Nova Sala

```bash
curl -X POST http://localhost:4000/api/rooms \
  -H "Content-Type: application/json"
```

**Resposta**:
```json
{
  "roomId": "a1b2c3d4",
  "room": {
    "id": "a1b2c3d4",
    "players": [],
    "currentTurn": "red",
    "status": "waiting",
    "board": {
      "0-1": { "color": "black", "type": "normal" },
      "0-3": { "color": "black", "type": "normal" },
      ...
    },
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
}
```

### 3. Entrar em uma Sala

```bash
curl -X POST http://localhost:4000/api/rooms/a1b2c3d4/join \
  -H "Content-Type: application/json"
```

**Resposta**:
```json
{
  "room": {
    "id": "a1b2c3d4",
    "players": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "color": "red",
        "joinedAt": "2025-12-18T10:30:05.000Z"
      }
    ],
    "currentTurn": "red",
    "status": "waiting",
    ...
  },
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "playerColor": "red"
}
```

### 4. Fazer Movimento

```bash
curl -X POST http://localhost:4000/api/rooms/a1b2c3d4/move \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "from": { "row": 5, "col": 0 },
    "to": { "row": 4, "col": 1 }
  }'
```

**Resposta**:
```json
{
  "room": {
    "id": "a1b2c3d4",
    "players": [...],
    "currentTurn": "black",
    "status": "playing",
    "board": {
      "4-1": { "color": "red", "type": "normal" },
      ...
    }
  }
}
```

### 5. Obter Informações da Sala

```bash
curl http://localhost:4000/api/rooms/a1b2c3d4
```

**Resposta**:
```json
{
  "room": {
    "id": "a1b2c3d4",
    "players": [...],
    "currentTurn": "black",
    "status": "playing",
    ...
  }
}
```

## Exemplos com JavaScript (Fetch)

### Criar Sala

```javascript
const response = await fetch('http://localhost:4000/api/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})

const { roomId, room } = await response.json()
console.log('Sala criada:', roomId)
```

### Entrar na Sala

```javascript
const roomId = 'a1b2c3d4'

const response = await fetch(`http://localhost:4000/api/rooms/${roomId}/join`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})

const { room, playerId, playerColor } = await response.json()
console.log(`Você é: ${playerColor}`, playerId)
```

### Fazer Movimento

```javascript
const response = await fetch(`http://localhost:4000/api/rooms/${roomId}/move`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    playerId: '550e8400-e29b-41d4-a716-446655440000',
    from: { row: 5, col: 0 },
    to: { row: 4, col: 1 }
  })
})

const { room } = await response.json()
console.log('Movimento realizado, próximo turno:', room.currentTurn)
```

## Exemplos com Axios

### Setup

```javascript
import axios from 'axios'

const API_URL = 'http://localhost:4000'
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Criar e Entrar em Sala

```javascript
// Criar sala
const { data: createData } = await api.post('/api/rooms')
const { roomId } = createData

// Entrar na sala
const { data: joinData } = await api.post(`/api/rooms/${roomId}/join`)
const { playerId, playerColor } = joinData

console.log(`Sala: ${roomId}`)
console.log(`Player: ${playerId} (${playerColor})`)
```

### Fazer Movimento com Try/Catch

```javascript
try {
  const { data } = await api.post(`/api/rooms/${roomId}/move`, {
    playerId,
    from: { row: 5, col: 0 },
    to: { row: 4, col: 1 }
  })
  
  console.log('Movimento realizado!')
  console.log('Próximo turno:', data.room.currentTurn)
} catch (error) {
  if (error.response) {
    console.error('Erro:', error.response.data.error)
  }
}
```

## Exemplos com Ably (WebSocket)

### Setup

```javascript
import * as Ably from 'ably'

const ABLY_KEY = 'your_ably_key_here'
const ably = new Ably.Realtime(ABLY_KEY)
```

### Escutar Atualizações da Sala

```javascript
const roomId = 'a1b2c3d4'
const channel = ably.channels.get(`room:${roomId}`)

// Atualização da sala (jogador entrou, status mudou)
channel.subscribe('room-update', (message) => {
  const room = message.data
  console.log('Sala atualizada:', room.status)
  console.log('Jogadores:', room.players.length)
})

// Movimento no jogo
channel.subscribe('game-move', (message) => {
  const { board, currentTurn } = message.data
  console.log('Movimento realizado!')
  console.log('Próximo turno:', currentTurn)
  console.log('Tabuleiro:', board)
})
```

### Limpar Conexão

```javascript
// Cancelar inscrição
channel.unsubscribe()

// Fechar conexão
ably.close()
```

## Fluxo Completo de Jogo

```javascript
import axios from 'axios'
import * as Ably from 'ably'

const API_URL = 'http://localhost:4000'
const ABLY_KEY = 'your_ably_key_here'

async function playGame() {
  // 1. Criar sala
  const { data: createData } = await axios.post(`${API_URL}/api/rooms`)
  const { roomId } = createData
  console.log('✅ Sala criada:', roomId)

  // 2. Conectar WebSocket
  const ably = new Ably.Realtime(ABLY_KEY)
  const channel = ably.channels.get(`room:${roomId}`)
  
  channel.subscribe('room-update', (msg) => {
    console.log('📡 Sala atualizada:', msg.data.status)
  })
  
  channel.subscribe('game-move', (msg) => {
    console.log('🎮 Movimento:', msg.data.currentTurn)
  })

  // 3. Jogador 1 entra
  const { data: player1Data } = await axios.post(
    `${API_URL}/api/rooms/${roomId}/join`
  )
  console.log('✅ Jogador 1:', player1Data.playerColor)

  // 4. Jogador 2 entra
  const { data: player2Data } = await axios.post(
    `${API_URL}/api/rooms/${roomId}/join`
  )
  console.log('✅ Jogador 2:', player2Data.playerColor)

  // 5. Jogador 1 faz movimento
  await axios.post(`${API_URL}/api/rooms/${roomId}/move`, {
    playerId: player1Data.playerId,
    from: { row: 5, col: 0 },
    to: { row: 4, col: 1 }
  })
  console.log('✅ Movimento realizado!')

  // 6. Limpar
  setTimeout(() => {
    channel.unsubscribe()
    ably.close()
    console.log('👋 Conexão fechada')
  }, 5000)
}

playGame()
```

## Tratamento de Erros

### Sala Não Encontrada (404)

```javascript
try {
  await axios.post('http://localhost:4000/api/rooms/invalid/join')
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Sala não encontrada')
  }
}
```

### Sala Cheia (400)

```javascript
try {
  await axios.post(`http://localhost:4000/api/rooms/${roomId}/join`)
} catch (error) {
  if (error.response?.data?.error === 'Sala cheia') {
    console.error('Esta sala já tem 2 jogadores')
  }
}
```

### Movimento Inválido (400)

```javascript
try {
  await axios.post(`http://localhost:4000/api/rooms/${roomId}/move`, {
    playerId,
    from: { row: 0, col: 0 },
    to: { row: 7, col: 7 }
  })
} catch (error) {
  if (error.response?.data?.error === 'Movimento inválido') {
    console.error('Este movimento não é permitido')
  }
}
```

## Testando com Postman

### 1. Importar Collection

Crie uma collection com estas requests:

- **Health Check**: GET http://localhost:4000/health
- **Create Room**: POST http://localhost:4000/api/rooms
- **Join Room**: POST http://localhost:4000/api/rooms/{{roomId}}/join
- **Move**: POST http://localhost:4000/api/rooms/{{roomId}}/move
- **Get Room**: GET http://localhost:4000/api/rooms/{{roomId}}

### 2. Variables

Configure variáveis:
- `baseUrl`: http://localhost:4000
- `roomId`: (será preenchido após criar sala)
- `playerId`: (será preenchido após entrar)

### 3. Scripts

**Create Room** - Script de Teste:
```javascript
const response = pm.response.json()
pm.collectionVariables.set("roomId", response.roomId)
```

**Join Room** - Script de Teste:
```javascript
const response = pm.response.json()
pm.collectionVariables.set("playerId", response.playerId)
```

## Performance

### Limites (MVP)

- Sem rate limiting
- Sem limite de salas
- Sem timeout de salas
- Armazenamento em memória

### Recomendações para Produção

1. Implementar rate limiting
2. Adicionar timeout de salas inativas
3. Usar banco de dados
4. Adicionar cache (Redis)
5. Implementar autenticação

## WebSocket vs HTTP

### Use HTTP para:
- Criar sala
- Entrar na sala
- Fazer movimento

### Use WebSocket (Ably) para:
- Receber atualizações em tempo real
- Sincronizar estado do jogo
- Notificações de eventos

## Recursos

- [Documentação Ably](https://ably.com/docs)
- [Express.js](https://expressjs.com/)
- [Axios](https://axios-http.com/)

---

**Dúvidas?** Abra uma issue no GitHub!
