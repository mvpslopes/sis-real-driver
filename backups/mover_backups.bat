@echo off
title Mover Backups Automático - SisRealDriver
echo ========================================
echo    MOVER BACKUPS AUTOMÁTICO
echo ========================================
echo.

:loop
echo Verificando pasta Downloads...
echo %date% %time%

REM Verifica se existem arquivos de backup na pasta Downloads
if exist "%USERPROFILE%\Downloads\BackupAuto_*.json" (
    echo.
    echo Arquivos de backup encontrados:
    dir "%USERPROFILE%\Downloads\BackupAuto_*.json" /b
    
    echo.
    echo Movendo arquivos para pasta backups...
    
    for %%f in ("%USERPROFILE%\Downloads\BackupAuto_*.json") do (
        move "%%f" "%~dp0" >nul 2>&1
        if exist "%~dp0%%~nxf" (
            echo ✓ Movido: %%~nxf
        ) else (
            echo ✗ Erro ao mover: %%~nxf
        )
    )
    
    echo.
    echo Arquivos movidos com sucesso!
    echo.
) else (
    echo Nenhum arquivo de backup encontrado.
)

echo.
echo Aguardando 30 segundos para próxima verificação...
echo Pressione Ctrl+C para sair
echo.

timeout /t 30 /nobreak >nul
goto loop

