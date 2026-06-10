@echo off
setlocal
cd /d "%~dp0"

set "OUT=..\vercel-upload"
echo.
echo Dump Center - Vercel upload voorbereiden
echo ==========================================
echo.

if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"
mkdir "%OUT%\app"
mkdir "%OUT%\app\api"
mkdir "%OUT%\app\api\token"
mkdir "%OUT%\app\api\token\validate"
mkdir "%OUT%\app\api\tokens"
mkdir "%OUT%\app\api\tokens\[id]"
mkdir "%OUT%\app\tokens"
mkdir "%OUT%\lib"
mkdir "%OUT%\data"

copy /y package.json "%OUT%\" >nul
copy /y package-lock.json "%OUT%\" >nul
copy /y tsconfig.json "%OUT%\" >nul
copy /y next.config.ts "%OUT%\" >nul
copy /y next-env.d.ts "%OUT%\" >nul
copy /y vercel.json "%OUT%\" >nul
copy /y .gitignore "%OUT%\" >nul

copy /y app\globals.css "%OUT%\app\" >nul
copy /y app\layout.tsx "%OUT%\app\" >nul
copy /y app\page.tsx "%OUT%\app\" >nul
copy /y app\tokens\page.tsx "%OUT%\app\tokens\" >nul
copy /y app\api\token\validate\route.ts "%OUT%\app\api\token\validate\" >nul
copy /y app\api\tokens\route.ts "%OUT%\app\api\tokens\" >nul
copy /y app\api\tokens\[id]\route.ts "%OUT%\app\api\tokens\[id]\" >nul
copy /y lib\tokens.ts "%OUT%\lib\" >nul
copy /y lib\auth.ts "%OUT%\lib\" >nul
copy /y data\.gitkeep "%OUT%\data\" >nul

echo [OK] Schone map aangemaakt: %OUT%
echo [OK] Bevat ~20 bestanden (GEEN node_modules)
echo.
echo Upload naar Vercel:
echo   1. Ga naar vercel.com -^> Add New Project
echo   2. Sleep de map "vercel-upload" naar het upload-veld
echo      OF zip de map en upload de zip
echo   3. Zet ADMIN_KEY in Environment Variables
echo   4. Koppel Upstash Redis (Marketplace)
echo.
echo Tip: node_modules NIET uploaden - Vercel installeert die zelf.
echo.
pause
