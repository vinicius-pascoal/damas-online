# 🚀 Guia de Instalação - Damas Online

## Pré-requisitos

- Docker e Docker Compose instalados
- Conta no Ably (gratuita) - https://ably.com/

## Passos para Configuração

### 1. Obter Chave API do Ably

1. Acesse https://ably.com/ e crie uma conta gratuita
2. No dashboard, vá em "API Keys"
3. Copie a API Key completa (formato: `API_KEY_ID.API_KEY_SECRET`)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e substitua `your_ably_api_key_here` pela sua chave do Ably:

```env
ABLY_API_KEY=sua_chave_api_aqui
NEXT_PUBLIC_ABLY_KEY=sua_chave_api_aqui
```

### 3. Iniciar a Aplicação

```bash
# Construir e iniciar os containers
docker-compose up --build

# Ou em modo detached (background)
docker-compose up -d --build
```

### 4. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🔄 Hot Reload

O projeto está configurado com hot reload:

- **Frontend**: Alterações em `front/src/**` recarregam automaticamente
- **Backend**: Alterações em `backend/src/**` reiniciam o servidor automaticamente (nodemon)

## 🛑 Parar a Aplicação

```bash
# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## 🎮 Como Jogar

1. Acesse http://localhost:3000
2. Clique em "Criar Nova Sala"
3. Compartilhe o link gerado com outro jogador
4. Aguarde o segundo jogador entrar
5. Jogue damas!

## 📝 Desenvolvimento sem Docker

Se preferir rodar sem Docker:

### Frontend
```bash
cd front
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
# Copie .env.example para .env e configure
cp .env.example .env
npm run dev
```

## 🐛 Troubleshooting

### Porta já em uso
Se as portas 3000 ou 4000 já estiverem em uso, edite o `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Mudar porta do host
```

### Erro de conexão Ably
Verifique se a chave API está correta em `.env` e se tem acesso à internet.

### Hot reload não funciona no Windows
No Windows, pode ser necessário usar polling. Adicione ao `package.json` do frontend:

```json
"dev": "next dev --turbo"
```

## 📚 Estrutura do Projeto

```
damas-online/
├── front/              # Frontend Next.js
│   ├── src/
│   │   ├── app/       # Pages e layouts
│   │   └── components/ # Componentes React
│   └── Dockerfile
├── backend/            # Backend Node.js
│   ├── src/
│   │   └── index.js   # Servidor Express
│   └── Dockerfile
└── docker-compose.yml  # Orquestração Docker
```

## 🌐 Deploy em Produção

### Frontend (Vercel)
```bash
cd front
vercel deploy
```

### Backend (Railway/Render)
Configure as variáveis de ambiente:
- `PORT`
- `ABLY_API_KEY`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT
