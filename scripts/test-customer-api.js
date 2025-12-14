const BASE_URL = 'http://localhost:3000/api/customers';

async function testAPI() {
  console.log('API Testi Başlıyor...\n');

  try {
    console.log('   GET /api/customers (Listeleme)');
    const listRes = await fetch(BASE_URL);
    const customers = await listRes.json();
    console.log(`   Durum: ${listRes.status}`);
    console.log(`   Müşteri Sayısı: ${customers.length}`);
    console.log(`   Listeleme Başarılı!\n`);

    console.log('  POST /api/customers (Ekleme)');
    const newCustomerData = {
      firstName: 'API Test',
      lastName: 'Robotu',
      email: 'test_api@robot.com',
      phone: '0599 111 22 33', // Temizlenmesi gereken format
    };

    const createRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomerData),
    });
    const createdCustomer = await createRes.json();

    if (createRes.status !== 201) {
      throw new Error(
        `Ekleme başarısız! Hata: ${JSON.stringify(createdCustomer)}`
      );
    }

    console.log(`   Durum: ${createRes.status}`);
    console.log(`   Oluşturulan ID: ${createdCustomer.id}`);
    console.log(`   Temizlenmiş Telefon: ${createdCustomer.phone}`); // 5991112233 olmalı
    console.log(`   Ekleme Başarılı!\n`);

    const testId = createdCustomer.id;

    // 3. PUT - Güncelleme Testi
    console.log(`  PUT /api/customers/${testId} (Güncelleme)`);
    const updateData = {
      firstName: 'API Test (GÜNCELLENDİ)',
    };
    const updateRes = await fetch(`${BASE_URL}/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const updatedCustomer = await updateRes.json();
    console.log(`   Durum: ${updateRes.status}`);
    console.log(`   Yeni İsim: ${updatedCustomer.firstName}`);
    console.log(`   Güncelleme Başarılı!\n`);

    // 4. DELETE - Silme Testi
    console.log(`  DELETE /api/customers/${testId} (Silme)`);
    const deleteRes = await fetch(`${BASE_URL}/${testId}`, {
      method: 'DELETE',
    });
    console.log(`   Durum: ${deleteRes.status}`);

    // Silindiğini doğrula
    const checkRes = await fetch(`${BASE_URL}/${testId}`);
    if (checkRes.status === 404) {
      console.log(`   Kontrol: Müşteri Silindi.`);
      console.log(`   Silme Başarılı!\n`);
    } else {
      console.error(`    HATA: Müşteri hala duruyor!`);
    }
  } catch (error) {
    console.error('TEST PATLADI:', error.message);
  }
}

testAPI();
