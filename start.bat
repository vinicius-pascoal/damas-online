@echo off
echo 🎮 Configuracao do Jogo de Damas Online
echo ========================================
echo.

REM Verificar se Docker está instalado
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker nao encontrado. Por favor, instale o Docker primeiro.
    echo    Visite: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Verificar se Docker Compose está instalado
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose nao encontrado. Por favor, instale o Docker Compose.
    echo    Visite: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker e Docker Compose encontrados
echo.

REM Verificar se .env existe
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edite o arquivo .env e adicione sua chave do Ably
    echo    Obtenha em: https://ably.com/dashboard
    echo.
    pause
)

echo 🚀 Iniciando aplicacao com Docker...
echo.

REM Build e start
docker-compose up --build

echo.
echo 🎉 Aplicacao rodando!
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:4000
pause
