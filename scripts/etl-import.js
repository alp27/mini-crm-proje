const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Customer, sequelize } = require('../src/models'); 
const csvFilePath = path.join(__dirname, '../customers.csv');
function cleanPhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('90')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  
  return cleaned.length === 10 ? cleaned : null;
}

function isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
async function importData() {
  const results = [];
  let stats = {
    total: 0,
    success: 0,
    duplicate: 0,
    invalid: 0
  };

  console.log('------------------------------------------------');

  try {
    await sequelize.authenticate();
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        separator: ';', 
        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
      }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        
        for (const row of results) {   
          stats.total++;
          let firstName = row['Ad'] ? row['Ad'].trim().replace(/"/g, '') : 'Bilinmiyor';
          let lastName = row['Soyad'] ? row['Soyad'].trim() : null;
          
          let rawPhone = row['Telefon'];
          let cleanPhoneNumber = cleanPhone(rawPhone);

          let email = row['Email'] && isValidEmail(row['Email']) ? row['Email'].trim() : null;

          
          const existingCustomer = await Customer.findOne({
            where: {
              [sequelize.Sequelize.Op.or]: [
                cleanPhoneNumber ? { phone: cleanPhoneNumber } : null,
                email ? { email: email } : null
              ].filter(val => val !== null) 
            }
          });

          if (existingCustomer) {
            console.log(`⚠️  Duplicate Atlandı: ${firstName} ${lastName || ''} (Tel: ${cleanPhoneNumber})`);
            stats.duplicate++;
            continue; 
          }
          try {
            await Customer.create({
              firstName: firstName,
              lastName: lastName,
              phone: cleanPhoneNumber,
              email: email,
              address: row['Adres'] || null,
              isActive: true
            });
            console.log(`✅ Eklendi: ${firstName} ${lastName || ''}`);
            stats.success++;
          } catch (err) {
            console.error(`❌ DB Hatası (${firstName}):`, err.message);
            stats.invalid++;
          }
        }

        

        console.log('\n------------------------------------------------');
        console.log('📊 ETL SONUÇ RAPORU');
        console.log('------------------------------------------------');
        console.table(stats);
        console.log('------------------------------------------------');
        process.exit();
      });

  } catch (error) {
    console.error('Kritik Hata:', error);
    process.exit(1);
  }
}
importData();