@echo off
echo ========================================
echo    ORGANIZADOR DE BACKUPS - SisRealDriver
echo ========================================
echo.

echo Verificando pasta Downloads...
if not exist "%USERPROFILE%\Downloads\BackupAuto_*.json" (
    echo Nenhum arquivo de backup encontrado na pasta Downloads.
    echo.
    pause
    exit /b
)

echo Arquivos de backup encontrados:
dir "%USERPROFILE%\Downloads\BackupAuto_*.json" /b

echo.
echo Deseja mover os arquivos para a pasta backups? (S/N)
set /p resposta=

if /i "%resposta%"=="S" (
    echo.
    echo Movendo arquivos...
    
    for %%f in ("%USERPROFILE%\Downloads\BackupAuto_*.json") do (
        move "%%f" "%~dp0"
        echo Movido: %%~nxf
    )
    
    echo.
    echo Arquivos movidos com sucesso!
    echo.
    echo Deseja organizar por data? (S/N)
    set /p organizar=
    
    if /i "%organizar%"=="S" (
        echo.
        echo Organizando por data...
        
        for %%f in ("BackupAuto_*.json") do (
            for /f "tokens=2 delims=_" %%a in ("%%f") do (
                set data=%%a
                set ano=!data:~0,4!
                set mes=!data:~5,2!
                
                if not exist "!ano!-!mes!" mkdir "!ano!-!mes!"
                move "%%f" "!ano!-!mes!\"
                echo Organizado: %%~nxf -^> !ano!-!mes!\
            )
        )
        
        echo.
        echo Organização concluída!
    )
) else (
    echo Operação cancelada.
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul
