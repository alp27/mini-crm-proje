const BASE_URL = 'http://localhost:3000/api';

async function testOrderAPI() {
  console.log(' SİPARİŞ (ORDER) API TESTİ BAŞLIYOR...\n');

  try {
    const custRes = await fetch(`${BASE_URL}/customers`);
    const customers = await custRes.json();

    if (customers.length === 0) {
      throw new Error(
        ' ÖNCE MÜŞTERİ EKLE: Veritabanında hiç müşteri yok, sipariş testi yapılamaz.'
      );
    }

    const validCustomerId = customers[0].id;
    console.log(
      `  Test için kullanılacak Müşteri ID: ${validCustomerId} (${customers[0].firstName})`
    );

    console.log('\n  Test: Olmayan müşteriye sipariş girme (Hata vermeli)');
    const badOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: 999999, totalAmount: 100 }),
    });

    if (badOrderRes.status === 404) {
      console.log('    BAŞARILI: Sistem olmayan müşteriye sipariş açtırmadı.');
    } else {
      console.error(`    HATA: Beklenmeyen durum kodu: ${badOrderRes.status}`);
    }

    console.log('\n  Test: Geçerli Sipariş Oluşturma');
    const newOrderData = {
      customerId: validCustomerId,
      totalAmount: 1500.5,
      status: 'PENDING',
    };

    const createRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderData),
    });
    const createdOrder = await createRes.json();

    if (createRes.status === 201) {
      console.log(`    BAŞARILI: Sipariş oluşturuldu. ID: ${createdOrder.id}`);
    } else {
      throw new Error(
        `Sipariş oluşturulamadı: ${JSON.stringify(createdOrder)}`
      );
    }

    const orderId = createdOrder.id;

    console.log('\n  Test: Sipariş Detayı ve Müşteri Bilgisi (JOIN)');
    const getRes = await fetch(`${BASE_URL}/orders/${orderId}`);
    const orderDetail = await getRes.json();

    if (orderDetail.customer && orderDetail.customer.firstName) {
      console.log(
        `    BAŞARILI: Siparişle birlikte müşteri bilgisi geldi: ${orderDetail.customer.firstName}`
      );
    } else {
      console.error('    HATA: Müşteri bilgisi (include) gelmedi!');
    }

    console.log('\n  Test: Sipariş Durumunu Güncelleme (SHIPPED)');
    const updateRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SHIPPED' }),
    });
    const updatedOrder = await updateRes.json();

    if (updatedOrder.status === 'SHIPPED') {
      console.log('    BAŞARILI: Durum SHIPPED olarak güncellendi.');
    } else {
      console.error('    HATA: Durum güncellenemedi.');
    }

    console.log('\n  Test: Filtreleme (?status=SHIPPED)');
    const filterRes = await fetch(`${BASE_URL}/orders?status=SHIPPED`);
    const filteredList = await filterRes.json();

    const found = filteredList.find((o) => o.id === orderId);
    if (found) {
      console.log(
        `    BAŞARILI: Filtreleme çalışıyor, sipariş listede bulundu.`
      );
    } else {
      console.error('    HATA: Filtreleme çalışmadı veya sipariş bulunamadı.');
    }

    console.log('\n  Test: Siparişi Silme');
    const deleteRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
    });

    if (deleteRes.status === 204) {
      console.log('    BAŞARILI: Sipariş silindi.');
    } else {
      console.error('   HATA: Silme işlemi başarısız.');
    }
  } catch (error) {
    console.error('\n TEST KRİTİK HATA İLE DURDU:', error.message);
  }
}

testOrderAPI();
