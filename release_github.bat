@echo off
setlocal

echo ==========================================
echo      MEUBOLSO - SCRIPT DE RELEASE
echo ==========================================

set /p VERSION=Digite a versao (ex: 1.0.0): 

if "%VERSION%"=="" (
    echo Versao nao pode ser vazia.
    pause
    exit
)

set TAG=v%VERSION%

echo.
echo Verificando se ha commits...

git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    echo Nenhum commit encontrado. Criando commit inicial...
    git add .
    git commit -m "chore: initial commit"
)

echo.
echo Detectando branch atual...

for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo Branch atual: %CURRENT_BRANCH%

echo.
echo Criando commit de release...
git add .
git commit -m "release: %TAG%"

echo.
echo Criando tag...
git tag %TAG%

echo.
echo Enviando para o GitHub...
git push -u origin %CURRENT_BRANCH%
git push origin %TAG%

echo.
echo ==========================================
echo Release %TAG% enviada com sucesso!
echo ==========================================
pause