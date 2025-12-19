# Jogo de Damas Online 🎮

Jogo de damas multiplayer online com salas privadas e comunicação em tempo real via WebSocket.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **WebSocket**: Ably (tempo real)
- **Containerização**: Docker + Docker Compose
- **Hot Reload**: Desenvolvimento otimizado

## ✨ Funcionalidades

- ✅ Criar salas de jogo privadas com ID único
- ✅ Compartilhar link especial para convidar jogador
- ✅ Jogo de damas 1v1 em tempo real
- ✅ Sincronização automática via WebSocket (Ably)
- ✅ Interface responsiva e moderna
- ✅ Sistema de turnos
- ✅ Promoção de peças a Dama (Rei)
- ✅ Detecção de capturas
- ✅ Hot reload em desenvolvimento

## 📦 Estrutura do Projeto

```
damas-online/
├── front/                  # Frontend Next.js
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   │   ├── page.tsx          # Lobby
│   │   │   └── room/[id]/page.tsx # Sala de jogo
│   │   └── components/
│   │       └── CheckersBoard.tsx  # Tabuleiro
│   ├── Dockerfile
│   └── package.json
├── backend/                # Backend Node.js
│   ├── src/
│   │   └── index.js       # API + WebSocket
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orquestração
├── INSTALL.md             # Guia detalhado
└── COMMANDS.md            # Comandos úteis
```

## 🛠️ Instalação Rápida

⚡ **Quer começar agora?** → [QUICKSTART.md](QUICKSTART.md) (5 minutos!)

### Pré-requisitos
- Docker e Docker Compose
- Conta gratuita no [Ably](https://ably.com/)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/damas-online.git
cd damas-online
```

2. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env e adicione sua chave do Ably
# Obtenha em: https://ably.com/dashboard
```

3. **Inicie o projeto**
```bash
# Windows
start.bat

# Mac/Linux
./start.sh

# Ou manualmente
docker-compose up --build
```

4. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

📖 **Guia completo**: Veja [INSTALL.md](INSTALL.md) para instruções detalhadas

## 🎮 Como Jogar

1. Acesse http://localhost:3000
2. Clique em **"✨ Criar Nova Sala"**
3. **Copie e compartilhe** o link gerado
4. Aguarde o segundo jogador entrar
5. **Jogue damas!** 
   - Clique na peça para selecionar
   - Clique no destino para mover
   - Capture peças adversárias pulando sobre elas
   - Chegue ao fim do tabuleiro para virar Dama (👑)

## 🔧 Desenvolvimento

### Hot Reload
O projeto está configurado com hot reload automático:
- **Frontend**: Mudanças em `front/src/**` recarregam instantaneamente
- **Backend**: Mudanças em `backend/src/**` reiniciam o servidor (nodemon)

### Comandos Rápidos (NPM)
```bash
npm run dev          # Iniciar projeto
npm run build        # Build e iniciar
npm run down         # Parar containers
npm run logs         # Ver todos os logs
npm run logs:front   # Ver logs do frontend
npm run logs:back    # Ver logs do backend
npm run clean        # Limpar tudo (cuidado!)
npm run restart      # Reiniciar containers
npm run ps           # Status dos containers
```

### Ver logs
```bash
docker-compose logs -f
```

### Comandos úteis
Veja [COMMANDS.md](COMMANDS.md) para lista completa de comandos

## 🌐 API Endpoints

### Backend (http://localhost:4000)

- `POST /api/rooms` - Criar nova sala
- `POST /api/rooms/:roomId/join` - Entrar em uma sala
- `POST /api/rooms/:roomId/move` - Fazer movimento
- `GET /api/rooms/:roomId` - Obter informações da sala
- `GET /health` - Health check

## 🎨 Screenshots

### Lobby
Interface moderna com gradiente e design responsivo

### Sala de Espera
Aguardando segundo jogador com link para compartilhar

### Jogo em Andamento
Tabuleiro interativo com indicadores visuais de movimentos válidos

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd front
npm run build
```

### Backend (Railway/Render/Heroku)
Configure as variáveis:
- `PORT`
- `ABLY_API_KEY`
- `NODE_ENV=production`

## 📝 Regras do Jogo

- Peças normais se movem uma casa na diagonal
- Peças capturam pulando sobre o adversário
- Ao chegar na última linha, a peça vira Dama (👑)
- Damas podem se mover em todas as direções diagonais
- Vence quem capturar todas as peças do oponente

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT - Veja o arquivo LICENSE para detalhes

---

⭐ Se gostou do projeto, deixe uma estrela!
