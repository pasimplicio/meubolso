# config-android.ps1
# Execute como Administrador

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "CONFIGURADOR DE AMBIENTE ANDROID" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$androidSdkPath = "C:\Users\caema43907\AppData\Local\Android\Sdk"
$javaHomePath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10"

Write-Host ""
Write-Host "Configuracoes detectadas:" -ForegroundColor Yellow
Write-Host "  ANDROID_HOME: $androidSdkPath"
Write-Host "  JAVA_HOME: $javaHomePath"

# PASSO 1: Configurar ANDROID_HOME
Write-Host ""
Write-Host "Configurando ANDROID_HOME..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidSdkPath, 'User')
Write-Host "  OK - ANDROID_HOME configurado" -ForegroundColor Green

# PASSO 2: Configurar JAVA_HOME
Write-Host ""
Write-Host "Configurando JAVA_HOME..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHomePath, 'User')
Write-Host "  OK - JAVA_HOME configurado" -ForegroundColor Green

# PASSO 3: Atualizar o PATH
Write-Host ""
Write-Host "Atualizando PATH..." -ForegroundColor Yellow

$pathsToAdd = @(
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\tools",
    "$androidSdkPath\tools\bin",
    "$androidSdkPath\cmdline-tools\latest\bin",
    "$androidSdkPath\emulator",
    "$javaHomePath\bin"
)

$validPaths = @()
foreach ($path in $pathsToAdd) {
    if (Test-Path $path) {
        $validPaths += $path
        Write-Host "  OK - Encontrado: $path" -ForegroundColor Green
    } else {
        Write-Host "  AVISO - Nao encontrado: $path" -ForegroundColor Yellow
    }
}

$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = $currentPath + ";" + ($validPaths -join ';')
[Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

Write-Host "  OK - PATH atualizado com $($validPaths.Count) diretorios" -ForegroundColor Green

# PASSO 4: Verificar platform-tools
Write-Host ""
Write-Host "Verificando platform-tools..." -ForegroundColor Yellow
if (Test-Path "$androidSdkPath\platform-tools\adb.exe") {
    Write-Host "  OK - platform-tools instalado" -ForegroundColor Green
} else {
    Write-Host "  AVISO - platform-tools nao encontrado. Instalando..." -ForegroundColor Yellow
    if (Test-Path "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat") {
        & "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"
        Write-Host "  OK - platform-tools instalado" -ForegroundColor Green
    } else {
        Write-Host "  ERRO - sdkmanager nao encontrado. Instale as command-line tools pelo Android Studio" -ForegroundColor Red
    }
}

# PASSO 5: Aceitar licenças
Write-Host ""
Write-Host "Verificando licencas..." -ForegroundColor Yellow
if (Test-Path "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat") {
    Write-Host "Aceitando licencas (pressione 'y' quando solicitado)..." -ForegroundColor Yellow
    & "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
}

# PASSO 6: Testar configuração
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "TESTANDO CONFIGURACAO" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Testar ANDROID_HOME
$testAndroidHome = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
Write-Host ""
Write-Host "ANDROID_HOME: $testAndroidHome" -ForegroundColor White

# Testar Java
Write-Host ""
Write-Host "Java version:" -ForegroundColor White
& "$javaHomePath\bin\java" -version 2>&1

# Testar adb
if (Test-Path "$androidSdkPath\platform-tools\adb.exe") {
    Write-Host ""
    Write-Host "ADB version:" -ForegroundColor White
    & "$androidSdkPath\platform-tools\adb.exe" --version
} else {
    Write-Host ""
    Write-Host "ADB nao encontrado" -ForegroundColor Red
}

# Testar sdkmanager
if (Test-Path "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat") {
    Write-Host ""
    Write-Host "SDK Manager version:" -ForegroundColor White
    & "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat" --version
} else {
    Write-Host ""
    Write-Host "SDK Manager nao encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Feche este PowerShell" -ForegroundColor White
Write-Host "2. Abra um NOVO PowerShell como Administrador" -ForegroundColor White
Write-Host "3. Navegue ate seu projeto: cd C:\Users\caema43907\meubolso" -ForegroundColor White
Write-Host "4. Execute: ./gradlew clean build" -ForegroundColor White
Write-Host ""