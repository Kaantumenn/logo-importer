@echo off
setlocal
cd /d "%~dp0"

if not exist ".env.local" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env.local" >nul
    echo .env.local olusturuldu. Lutfen veritabani bilgilerini duzenleyin.
  ) else (
    echo HATA: .env.local bulunamadi.
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo Bagimliliklar yukleniyor...
  call npm install
)

if not exist ".next\standalone\server.js" (
  echo Uygulama derleniyor...
  call npm run build:desktop
)

echo Masaustu uygulamasi baslatiliyor...
call npm run desktop
