const customerService = require('../src/services/customerService');
const { sequelize, Customer } = require('../src/models');

let createdCustomerId; 

beforeAll(async () => {
    await sequelize.authenticate();
});

afterAll(async () => {
    if (createdCustomerId) {
        await Customer.destroy({ where: { id: createdCustomerId } });
        console.log(`🗑️ Test verisi temizlendi: Customer ID ${createdCustomerId}`);
    }
    await sequelize.close();
});

describe('Customer Service Birim Testleri', () => {

    test('Yeni bir müşteri başarıyla oluşturulmalı (Create)', async () => {
        const newCustomer = {
            firstName: "Jest",
            lastName: "Cleaner",
            email: "cleanup.test@jest.com",
            phone: "0(555) 777 88 99"
        };

        const created = await customerService.createCustomer(newCustomer);
        
        createdCustomerId = created.id; 

        expect(created).toHaveProperty('id');
        expect(created.firstName).toBe("Jest");
        expect(created.phone).toBe("5557778899");
    });

    test('Müşteri listesi getirilmeli', async () => {
        const customers = await customerService.listCustomers();
        expect(Array.isArray(customers)).toBe(true);
        expect(customers.length).toBeGreaterThan(0);
    });

    test('İsimsiz müşteri hata vermeli', async () => {
        const invalidCustomer = { lastName: "NoName", phone: "5550000000" };
        await expect(customerService.createCustomer(invalidCustomer)).rejects.toThrow();
    });
    test('Soyadı olmayan müşteri başarıyla kaydedilmeli', async () => {
        const uniqueId = Date.now();
        const payload = {
            firstName: "TekİsimliMüşteri",
            email: `no.surname.${uniqueId}@test.com`,
            phone: `555${String(uniqueId).slice(-7)}`
        };

        const result = await customerService.createCustomer(payload);

        expect(result).toHaveProperty('id'); 
        expect(result.firstName).toBe("TekİsimliMüşteri");
        expect(result.lastName).toBeNull();
        
        console.log(`Soyadı olmayan müşteri testi geçti: ID ${result.id}`);
    });

    test('Talep 2.1: İsim ve Soyisim AYNI olsa bile iletişim bilgileri farklıysa kaydedilmeli', async () => {
        const uniqueId = Date.now();
        
        console.log('1. Müşteri oluşturuluyor: Ahmet Yılmaz (Tel: ...1)');
        const customer1 = await customerService.createCustomer({
            firstName: "Ahmet",
            lastName: "Yılmaz",
            email: `ahmet1.${uniqueId}@test.com`,
            phone: `0555${String(uniqueId).slice(-7)}`
        });

        const phoneNum = parseInt(String(uniqueId).slice(-7)) + 1;
        console.log('2. Müşteri oluşturuluyor: Ahmet Yılmaz (Tel: ...2) -> Farklı Kişi');
        
        const customer2 = await customerService.createCustomer({
            firstName: "Ahmet", 
            lastName: "Yılmaz", 
            email: `ahmet2.${uniqueId}@test.com`, 
            phone: `0555${phoneNum}` 
        });

        expect(customer1.id).not.toBe(customer2.id); 
        console.log(`BAŞARILI: İki farklı "Ahmet Yılmaz" sisteme eklendi. (ID: ${customer1.id} ve ${customer2.id})`);
    });

   test('Talep 2.2: Aynı EMAIL adresiyle ikinci kayıt engellenmeli', async () => {
        console.log('\n--- TEST BAŞLIYOR: Aynı Email Kontrolü ---');
        const uniqueId = Date.now();
        const email = `duplicate.email.${uniqueId}@test.com`;
        
        const randomPhone = `555${String(uniqueId).slice(-7)}`; 

        await customerService.createCustomer({
            firstName: "Orjinal",
            lastName: "Kişi",
            email: email, 
            phone: randomPhone 
        });
        console.log(`1. Müşteri oluşturuldu (Email: ${email})`);

        console.log('2. Müşteri (Taklitçi) aynı email ile eklenmeye çalışılıyor...');
        const duplicatePayload = {
            firstName: "Taklitçi",
            email: email, 
            phone: `5559998877` 
        };

        try {
            await customerService.createCustomer(duplicatePayload);
        } catch (error) {
            console.log(`BEKLENEN HATA YAKALANDI: "${error.message}"`);
        }

        await expect(customerService.createCustomer(duplicatePayload))
            .rejects
            .toThrow('CustomerAlreadyExists');
        
        console.log('BAŞARILI: Sistem aynı email ile kaydı engelledi.');
    });

    test('Talep 2.3: Aynı TELEFON numarasıyla ikinci kayıt engellenmeli', async () => {
        console.log('\n--- TEST BAŞLIYOR: Aynı Telefon Kontrolü ---');
        const uniqueId = Date.now();
        const randPhone = Math.floor(1000000 + Math.random() * 9000000);
        const phoneInput = `0(532) ${randPhone}`;

        await customerService.createCustomer({
            firstName: "Telefoncu",
            email: `tel1.${uniqueId}@test.com`,
            phone: phoneInput
        });
        console.log(`1. Müşteri oluşturuldu (Tel: ${phoneInput})`);

        console.log('2. Müşteri aynı telefon numarası ile eklenmeye çalışılıyor...');
        const duplicatePayload = {
            firstName: "Taklitçi",
            email: `tel2.${uniqueId}@test.com`, 
            phone: phoneInput 
        };

        try {
            await customerService.createCustomer(duplicatePayload);
        } catch (error) {
             console.log(` BEKLENEN HATA YAKALANDI: "${error.message}"`);
        }

        await expect(customerService.createCustomer(duplicatePayload))
            .rejects
            .toThrow('CustomerAlreadyExists');

        console.log('✅ BAŞARILI: Sistem aynı telefon ile kaydı engelledi.');
    });
});