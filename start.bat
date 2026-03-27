@echo off
echo ==== LIGANDO RACHA A CONTA VIBECODING ====

echo 1. Derrubando servidores antigos se existirem...
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1

echo 2. Subindo Banco de Dados (Docker)...
docker-compose up -d

echo 3. Rodando Backend (Porta 3000)...
start "Backend - Racha a Conta" cmd /k "cd server && npm run start"

echo 4. Rodando Frontend (Porta 5173)...
start "Frontend - Racha a Conta" cmd /k "npm run dev"

echo Tudo pronto! As telas do servidor comecarao a saltar e rodar sozinhas!
echo Acesse localhost:5173 no PC. No celular, veja o IP da Rede local no terminal do Frontend.
