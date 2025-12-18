# 🎯 Comandos Úteis - Damas Online

## Docker

```bash
# Iniciar projeto
docker-compose up

# Iniciar em background
docker-compose up -d

# Rebuild após mudanças no Dockerfile
docker-compose up --build

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Entrar no container
docker-compose exec frontend sh
docker-compose exec backend sh

# Reiniciar um serviço
docker-compose restart frontend
docker-compose restart backend
```

## NPM (sem Docker)

### Frontend
```bash
cd front
npm install          # Instalar dependências
npm run dev         # Modo desenvolvimento
npm run build       # Build para produção
npm start           # Rodar build de produção
npm run lint        # Verificar código
```

### Backend
```bash
cd backend
npm install          # Instalar dependências
npm run dev         # Modo desenvolvimento (nodemon)
npm start           # Rodar em produção
```

## Git

```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit: Jogo de damas online"

# Adicionar remote e push
git remote add origin https://github.com/seu-usuario/damas-online.git
git push -u origin main
```

## Debugging

### Ver estado dos containers
```bash
docker-compose ps
```

### Ver recursos usados
```bash
docker stats
```

### Limpar tudo (cuidado!)
```bash
# Remove containers, networks, volumes e images
docker-compose down -v --rmi all
```

### Rebuild do zero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Testes

### Testar API do Backend
```bash
# Health check
curl http://localhost:4000/health

# Criar sala
curl -X POST http://localhost:4000/api/rooms

# Verificar sala (substitua ROOM_ID)
curl http://localhost:4000/api/rooms/ROOM_ID
```

## Produção

### Build otimizado do Frontend
```bash
cd front
npm run build
npm start
```

### Variáveis de ambiente para produção
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://seu-backend.com
NEXT_PUBLIC_ABLY_KEY=sua_chave_ably
ABLY_API_KEY=sua_chave_ably
```

## Dicas

1. **Hot Reload não funciona?**
   - Verifique se os volumes estão montados corretamente no docker-compose.yml
   - No Windows, pode ser necessário usar WSL2

2. **Erro de permissão?**
   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **Porta já em uso?**
   ```bash
   # Linux/Mac
   lsof -i :3000
   lsof -i :4000
   
   # Windows PowerShell
   netstat -ano | findstr :3000
   netstat -ano | findstr :4000
   ```

4. **Limpar cache do Next.js**
   ```bash
   rm -rf front/.next
   ```

5. **Ver variáveis de ambiente**
   ```bash
   docker-compose config
   ```
