# MiniCRM (Yarım Kalmış Proje)

Bu proje, küçük bir e-ticaret firmasının müşteri ve sipariş yönetimi için başlanmış bir MiniCRM sistemidir.
# Kurulum ve Yapılandırma Ön Hazırlık
> Node.js (v14+) ve PostgreSQL

## Durum

> Proje tamamlanmıştır.  
> API uçları, testler, loglama ve migration yapısı **tamamlanmıştır**.

## Proje Özellikleri

* **Katmanlı Mimari:** Router, Controller, Service ve Data Access (Model) katmanları ile temiz kod yapısı.
* **İlişkisel Veritabanı:** Sequelize ORM kullanılarak Müşteri-Sipariş-Ürün arasında kurulan güçlü ilişkiler.
* **Transaction Yönetimi:** Sipariş oluşturma işlemlerinde stok düşüşü ve sipariş kaydının atomik olarak yapılması (Başarısızlık durumunda Rollback).
* **ETL Entegrasyonu:** Dış kaynaklardan (CSV/Excel) gelen ham verilerin temizlenerek sisteme aktarılması.
* **Otomatik Testler:** Jest ile yazılmış Birim (Unit) ve Entegrasyon testleri.
* **CI/CD:** GitHub Actions ile her kod gönderiminde çalışan otomatik test ve kontrol süreçleri.
* **API Dokümantasyonu:** Swagger (OpenAPI) ile interaktif uç nokta kılavuzu.
* **Kod Kalitesi:** ESLint ve Prettier ile proje genelinde kod standardizasyonu.

## Kullanılan Teknolojiler

* **Dil:** JavaScript (Node.js)
* **Framework:** Express.js
* **Veritabanı:** PostgreSQL
* **ORM:** Sequelize
* **Test:** Jest, Supertest, Cross-Env
* **Araçlar:** Swagger UI, Winston Logger, Dotenv

## ETL Nasıl Çalıştırılır?

1. Kök dizinde `customers.csv` dosyasının bulunduğundan emin olun.
2. Aşağıdaki node scripts/etl-import.js komutu ile çalıştırın

## Testler Nasıl Çalıştırılır?
1. **npm test**  Testleri Çalıştır.
2. **npm run test:coverage** Kapsam Raporu
3. **npm run lint** Kod standartlarına uyumsuzlukları listeler.
4. **npm run format** Kodu Prettier kurallarına göre otomatik düzenler.

## API Dökümantasyounu
Proje çalışır durumdayken, tüm API uç noktalarını test etmek ve detaylarını görmek için tarayıcınızda şu adrese gidin:

Swagger UI: http://localhost:3000/api-docs

## Kurulum (eksik)

```bash
git clone https://github.com/alp27/min-crm-proje.git
npm run setup
npm install
npm run dev
node scripts/etl-import.js
```
