const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Customer, sequelize } = require('../src/models'); 
const logger = require('../src/lib/logger');

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

  logger.info('ETL Import Process Started via CSV...');

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
            logger.warn(`Duplicate skipped: ${firstName} ${lastName || ''} (Phone: ${cleanPhoneNumber})`);
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
            logger.info(`Customer imported: ${firstName} ${lastName || ''}`);
            stats.success++;
          } catch (err) {
            logger.error(`Import Error (${firstName}): ${err.message}`);
            stats.invalid++;
          }
        }

        console.table(stats);
        logger.info(`ETL Completed. Stats: Success=${stats.success}, Duplicate=${stats.duplicate}, Invalid=${stats.invalid}`);
        process.exit();
      });

  } catch (error) {
    logger.error(`Critical ETL Error: ${error.message}`);
    process.exit(1);
  }
}

importData();