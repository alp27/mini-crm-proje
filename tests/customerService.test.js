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
});