#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env.local
    echo ".env.local oluşturuldu. Lütfen veritabanı bilgilerini düzenleyin."
  else
    echo "HATA: .env.local bulunamadı."
    exit 1
  fi
fi

if [[ ! -d node_modules ]]; then
  echo "Bağımlılıklar yükleniyor..."
  npm install
fi

if [[ ! -f .next/standalone/server.js ]]; then
  echo "Uygulama derleniyor..."
  npm run build:desktop
fi

echo "Masaüstü uygulaması başlatılıyor..."
npm run desktop
