# 📋 Documentação Técnica - Damas Online

## Arquitetura do Sistema

### Visão Geral
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Cliente   │ ◄─────► │   Backend   │ ◄─────► │    Ably     │
│  (Next.js)  │   HTTP  │  (Express)  │   WS    │ (WebSocket) │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │
      └────────────────────────┘
           Docker Network
```

### Componentes

#### Frontend (Next.js 14)
- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS
- **Porta**: 3000
- **Features**:
  - Server Components (páginas)
  - Client Components (interatividade)
  - Hot Module Replacement (HMR)

#### Backend (Node.js)
- **Framework**: Express.js
- **Linguagem**: JavaScript (ES6+)
- **Porta**: 4000
- **Features**:
  - RESTful API
  - Integração Ably
  - Armazenamento em memória

#### WebSocket (Ably)
- **Tipo**: Serviço gerenciado
- **Protocolo**: WebSocket/SSE
- **Uso**: Comunicação em tempo real
- **Channels**: `room:{roomId}`

## Fluxo de Dados

### 1. Criação de Sala
```
Cliente                 Backend                 Storage
   │                       │                       │
   ├─ POST /api/rooms ────►│                       │
   │                       ├─ gera UUID ──────────►│
   │                       │◄──────────────────────┘
   │◄─ { roomId } ─────────┤
   │                       │
```

### 2. Entrar na Sala
```
Cliente                 Backend                 Ably
   │                       │                       │
   ├─ POST /rooms/:id/join►│                       │
   │                       ├─ adiciona player      │
   │                       ├─ publish ────────────►│
   │◄─ { playerId } ───────┤                       │
   │◄─────────────────────────────────────────────┤
   │         room-update event                     │
```

### 3. Movimento no Jogo
```
Cliente A              Backend              Ably              Cliente B
   │                      │                  │                    │
   ├─ POST /move ────────►│                  │                    │
   │                      ├─ valida          │                    │
   │                      ├─ atualiza board  │                    │
   │                      ├─ publish ────────►│                    │
   │◄─ OK ────────────────┤                  ├─ game-move ───────►│
   │                      │                  │                    │
```

## Estrutura de Dados

### Room
```javascript
{
  id: string,              // UUID curto (8 chars)
  players: [               // Array de jogadores
    {
      id: string,          // UUID do jogador
      color: 'red'|'black',// Cor das peças
      joinedAt: Date       // Timestamp
    }
  ],
  currentTurn: 'red'|'black', // Turno atual
  status: 'waiting'|'playing'|'finished',
  board: {                 // Estado do tabuleiro
    'row-col': {
      color: 'red'|'black',
      type: 'normal'|'king'
    }
  },
  createdAt: Date,
  winner?: 'red'|'black'   // Opcional
}
```

### Board State
```javascript
{
  '0-1': { color: 'black', type: 'normal' },
  '0-3': { color: 'black', type: 'normal' },
  // ...
  '7-0': { color: 'red', type: 'king' },
  // Chave: 'linha-coluna'
  // Valor: null se vazio, objeto Piece se ocupado
}
```

## API Endpoints

### POST /api/rooms
Cria nova sala de jogo

**Request**: (vazio)

**Response**:
```json
{
  "roomId": "a1b2c3d4",
  "room": { /* Room object */ }
}
```

### POST /api/rooms/:roomId/join
Entra em uma sala existente

**Request**: (vazio)

**Response**:
```json
{
  "room": { /* Room object */ },
  "playerId": "uuid-v4",
  "playerColor": "red"
}
```

**Errors**:
- `404`: Sala não encontrada
- `400`: Sala cheia (2 jogadores)

### POST /api/rooms/:roomId/move
Executa movimento no jogo

**Request**:
```json
{
  "playerId": "uuid-v4",
  "from": { "row": 5, "col": 0 },
  "to": { "row": 4, "col": 1 }
}
```

**Response**:
```json
{
  "room": { /* Room object atualizado */ }
}
```

**Errors**:
- `404`: Sala não encontrada
- `400`: Jogo não está em andamento
- `400`: Não é seu turno
- `400`: Movimento inválido

### GET /api/rooms/:roomId
Obtém informações da sala

**Response**:
```json
{
  "room": { /* Room object */ }
}
```

### GET /health
Health check do servidor

**Response**:
```json
{
  "status": "ok",
  "rooms": 5
}
```

## Eventos WebSocket (Ably)

### Channel: `room:{roomId}`

#### room-update
Atualização geral da sala (jogador entrou, status mudou)

**Payload**:
```javascript
{
  // Room object completo
}
```

#### game-move
Movimento realizado no jogo

**Payload**:
```javascript
{
  board: { /* Board state */ },
  currentTurn: 'red'|'black'
}
```

## Lógica do Jogo

### Inicialização do Tabuleiro
```javascript
// Peças pretas: linhas 0-2, casas escuras
for (row = 0; row < 3; row++) {
  for (col = 0; col < 8; col++) {
    if ((row + col) % 2 === 1) {
      board[`${row}-${col}`] = { color: 'black', type: 'normal' }
    }
  }
}

// Peças vermelhas: linhas 5-7, casas escuras
for (row = 5; row < 8; row++) {
  for (col = 0; col < 8; col++) {
    if ((row + col) % 2 === 1) {
      board[`${row}-${col}`] = { color: 'red', type: 'normal' }
    }
  }
}
```

### Cálculo de Movimentos Válidos

#### Peça Normal
```javascript
const directions = piece.color === 'red'
  ? [[-1, -1], [-1, 1]]  // Move para cima
  : [[1, -1], [1, 1]]     // Move para baixo

// Movimento simples (1 casa)
// Captura (2 casas, pulando adversário)
```

#### Dama (King)
```javascript
const directions = [
  [-1, -1], [-1, 1],  // Diagonal superior
  [1, -1], [1, 1]      // Diagonal inferior
]

// Move em todas as direções
```

### Promoção a Dama
```javascript
if ((piece.color === 'red' && to.row === 0) ||
    (piece.color === 'black' && to.row === 7)) {
  piece.type = 'king'
}
```

### Detecção de Vitória
```javascript
const redPieces = Object.values(board)
  .filter(p => p?.color === 'red').length

const blackPieces = Object.values(board)
  .filter(p => p?.color === 'black').length

if (redPieces === 0 || blackPieces === 0) {
  room.status = 'finished'
  room.winner = redPieces === 0 ? 'black' : 'red'
}
```

## Docker

### Volumes (Hot Reload)
```yaml
volumes:
  - ./front:/app           # Código fonte
  - /app/node_modules     # Preserva node_modules
  - /app/.next            # Preserva build cache
```

### Networks
```yaml
networks:
  damas-network:
    driver: bridge
```

Ambos os serviços na mesma rede para comunicação interna.

## Variáveis de Ambiente

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ABLY_KEY=your_ably_key
```

### Backend (.env)
```bash
PORT=4000
ABLY_API_KEY=your_ably_key
```

### Docker Compose (.env)
```bash
ABLY_API_KEY=your_ably_key
NEXT_PUBLIC_ABLY_KEY=your_ably_key
```

## Segurança

### Implementado
- ✅ CORS configurado
- ✅ Validação de turno
- ✅ Validação de movimento
- ✅ Limite de 2 jogadores por sala

### Não Implementado (Melhorias Futuras)
- ❌ Autenticação de usuário
- ❌ Rate limiting
- ❌ Sanitização de entrada
- ❌ Persistência em banco de dados
- ❌ Recuperação de sessão

## Performance

### Otimizações
- Armazenamento em memória (rápido para MVP)
- WebSocket para comunicação eficiente
- Hot reload apenas em desenvolvimento
- Docker multi-stage build (produção)

### Limitações
- Salas são perdidas ao reiniciar servidor
- Sem limpeza automática de salas antigas
- Sem limite de salas simultâneas

## Melhorias Futuras

### Funcionalidades
1. Capturas múltiplas obrigatórias
2. Temporizador de turno
3. Chat entre jogadores
4. Histórico de movimentos
5. Replay da partida
6. Ranking/leaderboard
7. Matchmaking automático

### Técnicas
1. Banco de dados (PostgreSQL/MongoDB)
2. Redis para cache e sessões
3. Autenticação JWT
4. Testes unitários e E2E
5. CI/CD pipeline
6. Monitoramento (Sentry, DataDog)
7. Logs estruturados

## Testes

### Como Testar Localmente

1. **Criar Sala**
```bash
curl -X POST http://localhost:4000/api/rooms
```

2. **Verificar Health**
```bash
curl http://localhost:4000/health
```

3. **Testar Frontend**
- Abra duas abas do navegador
- Crie sala em uma aba
- Entre na sala na segunda aba
- Jogue!

### Debugging

**Backend Logs**:
```bash
docker-compose logs -f backend
```

**Frontend Logs**:
```bash
docker-compose logs -f frontend
```

**Entrar no Container**:
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Stack Completa

```
┌─────────────────────────────────────┐
│          Apresentação               │
│    Next.js + React + Tailwind       │
├─────────────────────────────────────┤
│          Aplicação                  │
│    TypeScript + JavaScript          │
├─────────────────────────────────────┤
│          Comunicação                │
│      Ably WebSocket + REST          │
├─────────────────────────────────────┤
│          Backend                    │
│      Node.js + Express              │
├─────────────────────────────────────┤
│          Infraestrutura             │
│      Docker + Docker Compose        │
└─────────────────────────────────────┘
```

## Recursos

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Ably**: https://ably.com/docs
- **Express**: https://expressjs.com/
- **Docker**: https://docs.docker.com/

---

Última atualização: Dezembro 2025
