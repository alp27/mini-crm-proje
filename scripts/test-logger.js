const logger = require('../src/lib/logger');

console.log('--- TEST BAŞLIYOR ---');

logger.info('Sistem testi: Her şey yolunda çalışıyor.');

logger.warn('Sistem testi: Bu bir uyarıdır, dikkat!');

logger.error('Sistem testi: Kritik bir hata oluştu! (Test Amaçlı)');

console.log('--- TEST BİTTİ. Şimdi "logs" klasörünü kontrol et. ---');