# ⚡ Início Rápido - 5 Minutos

## 1️⃣ Pré-requisitos (1 min)

Instale:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Crie conta no [Ably](https://ably.com/signup) (gratuito)

## 2️⃣ Configure Ably (2 min)

1. Acesse https://ably.com/dashboard
2. Clique em "Create New App"
3. Vá em "API Keys"
4. Copie a chave (formato: `xxxxx.yyyyy:zzzzzz`)

## 3️⃣ Configure o Projeto (1 min)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/damas-online.git
cd damas-online

# Crie o arquivo .env
cp .env.example .env

# Edite .env e cole sua chave Ably
# Windows: notepad .env
# Mac/Linux: nano .env
```

No arquivo `.env`, cole:
```env
ABLY_API_KEY=sua_chave_completa_aqui
NEXT_PUBLIC_ABLY_KEY=sua_chave_completa_aqui
```

## 4️⃣ Inicie o Projeto (1 min)

### Windows
```bash
start.bat
```

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

Ou manualmente:
```bash
docker-compose up --build
```

## 5️⃣ Jogue! (agora!)

1. Abra: http://localhost:3000
2. Clique em **"✨ Criar Nova Sala"**
3. Copie o link
4. Abra em **outra aba** (ou compartilhe)
5. **Jogue damas!** 🎮

---

## ❓ Problemas?

### Docker não inicia
```bash
# Verifique se Docker está rodando
docker --version
docker-compose --version
```

### Porta em uso
Edite `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "4001:4000"  # Backend
```

### Erro de conexão
- Verifique se `.env` tem a chave Ably correta
- Verifique internet (Ably precisa de conexão)

### Ver logs
```bash
docker-compose logs -f
```

---

## 🎯 Próximos Passos

- 📖 Leia [REGRAS.md](REGRAS.md) - Aprenda a jogar
- 🛠️ Leia [INSTALL.md](INSTALL.md) - Instalação detalhada
- 💻 Leia [TECHNICAL.md](TECHNICAL.md) - Documentação técnica
- 📝 Leia [COMMANDS.md](COMMANDS.md) - Comandos úteis

---

**Divirta-se! 🎮**
