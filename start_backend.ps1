# Script para facilitar o inicio do ambiente Anicca

Write-Host "1. Subindo o Banco de Dados (Certifique-se que o Docker Desktop esta aberto!)..."
docker-compose up -d

Write-Host "2. Entrando na pasta da API e rodando Migracoes..."
cd apps\api
.\.venv\Scripts\alembic.exe upgrade head

Write-Host "3. Iniciando Servidor Python Backend..."
Start-Process -NoNewWindow -FilePath ".\.venv\Scripts\uvicorn.exe" -ArgumentList "src.main:app --reload"

Write-Host "Ambiente iniciado com sucesso!"
