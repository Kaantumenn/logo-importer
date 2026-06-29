# AS Çimento — Çek Aktarım

Logo ERP'ye Excel çek aktarımı yapan web uygulaması (Next.js + PWA).

## Vercel'e deploy

1. Projeyi GitHub'a push edin (aşağıya bakın)
2. [vercel.com](https://vercel.com) → **Add New Project** → GitHub reposunu seçin
3. **Environment Variables** ekleyin:

| Değişken | Örnek |
|----------|-------|
| `DB_HOST` | SQL Server IP (dışarıdan erişilebilir olmalı) |
| `DB_PORT` | `1433` |
| `DB_DATABASE` | Logo veritabanı adı |
| `DB_USER` | SQL kullanıcı |
| `DB_PASSWORD` | SQL şifre |
| `DB_ENCRYPT` | `false` |
| `DB_TRUST_CERT` | `true` |

4. **Deploy** — Build komutu otomatik: `npm run build`

> **Önemli:** Vercel sunucuları bulutta çalışır. SQL Server'ınız sadece iç ağdaysa (localhost / 192.168.x.x) Vercel **bağlanamaz**. Bu durumda:
> - SQL Server'ı güvenli şekilde dışarı açın, veya
> - VDS üzerinde `npm run build && npm start` + nginx + HTTPS kullanın (Vercel yerine)

## GitHub'a yükleme

```bash
# GitHub'da yeni boş repo oluşturun: logo-importer

git add .
git commit -m "Logo çek aktarım uygulaması"
git remote add origin https://github.com/KULLANICI_ADINIZ/logo-importer.git
git push -u origin main
```

## Yerel geliştirme

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tarayıcı: http://localhost:3003

## Gereksinimler

- Node.js 20+
- SQL Server erişimi (Logo veritabanı)
- Windows veya Linux masaüstü

## Hızlı başlangıç (geliştirme)

```bash
npm install
cp .env.example .env.local   # veritabanı bilgilerini düzenleyin
npm run desktop:dev          # Next.js + Electron penceresi
```

## Masaüstünde çalıştırma

### Windows

`scripts/start-desktop.bat` dosyasına çift tıklayın.

İlk çalıştırmada bağımlılıklar yüklenir ve uygulama derlenir.

### Linux / macOS

```bash
chmod +x scripts/start-desktop.sh
./scripts/start-desktop.sh
```

### Manuel

```bash
npm install
cp .env.example .env.local
npm run build:desktop
npm run desktop
```

## Kurulum dosyası oluşturma

Projeyi indirip kendi bilgisayarınızda paketleyin:

### Windows (.exe — Linux'tan derlenebilir)

```bash
npm run pack:win
```

Çıktı (`release/` klasörü):

- `AS Çimento Çek Aktarım 0.1.0.exe` — taşınabilir, kurulum gerektirmez
- `AS Çimento Çek Aktarım-0.1.0-win.zip` — zip olarak indirilebilir paket

> **Not:** NSIS kurulum sihirbazı (Setup.exe) Linux'ta **Wine** gerektirir. Kurulum dosyası istiyorsanız Windows'ta `npm run pack:win:setup` çalıştırın.

### Linux (AppImage)

```bash
npm run pack:linux
```

## Veritabanı ayarı

`.env.local` dosyasını düzenleyin:

```env
DB_HOST=192.168.x.x
DB_PORT=1433
DB_DATABASE=...
DB_USER=...
DB_PASSWORD=...
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

Kurulum sonrası Windows'ta `.env.local` dosyası uygulama klasöründe veya kullanıcı veri dizininde aranır. İlk açılışta `.env.example` kopyalanır.

## PWA (Masaüstüne / Ana ekrana ekle)

Uygulama Progressive Web App olarak kurulabilir.

### Kurulum

1. Production modda çalıştırın: `npm run build && npm start`
2. Tarayıcıda siteyi açın (Chrome / Edge önerilir)
3. Sağ üstte **Uygulamayı Yükle** butonuna tıklayın  
   veya adres çubuğundaki yükle ikonunu kullanın

### Gereksinimler

- **HTTPS** gerekir (localhost hariç). VDS'te HTTP üzerinden yükleme istemi çıkmaz.
- API istekleri (`/api/*`) her zaman ağ üzerinden gider; offline çalışmaz.

### İkonları yeniden üretmek

```bash
npm run icons:pwa
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Web geliştirme sunucusu |
| `npm run desktop:dev` | Masaüstü penceresi + hot reload |
| `npm run desktop` | Derlenmiş uygulamayı Electron'da aç |
| `npm run build:desktop` | Standalone Next.js paketi hazırla |
| `npm run pack:win` | Windows kurulum dosyası üret |

## İletişim

**Mahmut Kaan Tümen** — 0 (533) 312 88 64
