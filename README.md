# MiniCRM (Yarım Kalmış Proje)

Bu proje, küçük bir e-ticaret firmasının müşteri ve sipariş yönetimi için başlanmış **ama tamamlanmamış** bir MiniCRM sistemidir.

## Durum

> Proje yaklaşık %40 civarında tamamlanmıştır.  
> API uçları, testler, loglama ve migration yapısı **tamamlanmamıştır**.
> Kurulmu için npm run setupgit checkout main

## ETL
Bu proje, eski sistemlerden veya Excel dosyalarından gelen kirli müşteri verilerini temizleyerek sisteme aktaran özel bir **ETL (Extract-Transform-Load)** scripti içerir.

**Özellikleri:**
*  **Veri Okuma:** `customers.csv` dosyasındaki verileri okur.
*  **Veri Temizliği:**
    * Telefon numaralarını standart hale getirir (Örn: `+90 532...` -> `532...`).
    * İsimlerdeki gereksiz karakterleri ve tırnak işaretlerini temizler.
*  **Validasyon:** Eksik bilgileri yönetir ve e-posta formatını doğrular.
*  **Duplicate Kontrolü:** Aynı telefon veya e-posta adresiyle kayıtlı müşteri varsa tekrar eklemez.

### Nasıl Çalıştırılır?

1. Kök dizinde `customers.csv` dosyasının bulunduğundan emin olun.
2. Aşağıdaki komutu terminalde çalıştırın:

## Kurulum (eksik)

```bash
npm run setup
npm install
npm run dev
node scripts/etl-import.js