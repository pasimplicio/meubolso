@echo off
title MeuBolso — Servidor de Desenvolvimento

echo.
echo  ================================
echo    MeuBolso - Iniciando servidor
echo  ================================
echo.

:: Mata processos nas portas 5173 e 5174 (se existirem)
echo  Liberando portas...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Aguarda um momento para liberar as portas
timeout /t 1 /nobreak >nul

:: Inicia o servidor
echo  Iniciando Vite...
echo.
npm run dev

pause
