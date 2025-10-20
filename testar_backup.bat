@echo off
title Testar Backup - SisRealDriver
echo ========================================
echo    TESTAR SISTEMA DE BACKUP
echo ========================================
echo.

echo 1. Abra o sistema (index.html)
echo 2. O backup automático será feito silenciosamente
echo 3. Para verificar, abra o Console do navegador (F12)
echo.

echo Verificando se existem backups na pasta Downloads...
if exist "%USERPROFILE%\Downloads\BackupAuto_*.json" (
    echo.
    echo ✓ Arquivos de backup encontrados na pasta Downloads:
    dir "%USERPROFILE%\Downloads\BackupAuto_*.json" /b
    echo.
    echo Deseja mover para pasta backups? (S/N)
    set /p mover=
    
    if /i "%mover%"=="S" (
        echo.
        echo Movendo arquivos...
        for %%f in ("%USERPROFILE%\Downloads\BackupAuto_*.json") do (
            move "%%f" "backups\"
            echo ✓ Movido: %%~nxf
        )
        echo.
        echo ✓ Arquivos movidos para pasta backups!
    )
) else (
    echo.
    echo ⚠ Nenhum arquivo de backup encontrado na pasta Downloads.
    echo.
    echo Isso é normal se:
    echo - O sistema ainda não foi executado
    echo - O backup está apenas no navegador (localStorage)
    echo.
    echo Para testar:
    echo 1. Abra o sistema (index.html)
    echo 2. Clique "Baixar Auto Backup"
    echo 3. Execute este script novamente
)

echo.
echo Verificando pasta backups...
if exist "backups\BackupAuto_*.json" (
    echo.
    echo ✓ Arquivos de backup na pasta backups:
    dir "backups\BackupAuto_*.json" /b
) else (
    echo.
    echo ⚠ Nenhum arquivo de backup na pasta backups ainda.
)

echo.
echo ========================================
echo    INFORMAÇÕES IMPORTANTES:
echo ========================================
echo.
echo ✓ Backup automático funciona no navegador (localStorage)
echo ✓ Para arquivo físico, use "Baixar Auto Backup"
echo ✓ Script mover_backups.bat organiza automaticamente
echo ✓ Sistema é seguro e confiável
echo.
echo Pressione qualquer tecla para sair...
pause >nul

