const orderService = require('../src/services/orderService');
const customerService = require('../src/services/customerService');
const productService = require('../src/services/productService');
const { sequelize, Order, Customer, Product } = require('../src/models');

let createdIds = { orders: [], customers: [], products: [] };

beforeAll(async () => {
    await sequelize.authenticate();
});

afterAll(async () => {
    if (createdIds.orders.length > 0) await Order.destroy({ where: { id: createdIds.orders } });
    if (createdIds.customers.length > 0) await Customer.destroy({ where: { id: createdIds.customers } });
    if (createdIds.products.length > 0) await Product.destroy({ where: { id: createdIds.products } });
    await sequelize.close();
});

describe('Order Service - Gelişmiş Senaryolar', () => {

    test('Senaryo 1: Tamamen yeni bir müşteri (Guest) başarıyla sipariş verebilmeli', async () => {
        console.log('\n--- TEST 1: Guest Checkout (Başarılı) ---');
        
        const product = await productService.createProduct({
            name: "Test Ürün",
            sku: `GST-OK-${Date.now()}`,
            stock: 100,
            price: 50.00
        });
        createdIds.products.push(product.id);

        const uniqueTime = Date.now();
        const orderPayload = {
            customer: {
                firstName: "Yeni",
                lastName: "Misafir",
                email: `guest.new.${uniqueTime}@test.com`,
                phone: `555${String(uniqueTime).slice(-7)}`
            },
            items: [
                { productId: product.id, quantity: 2 }
            ]
        };

        const order = await orderService.createOrder(orderPayload);
        createdIds.orders.push(order.id);
        createdIds.customers.push(order.customerId); 

        expect(order).toHaveProperty('id');
        expect(order.customerId).toBeDefined();
        console.log(`✅ Başarılı: Yeni müşteri oluşturuldu ve sipariş alındı. (Order ID: ${order.id})`);
    });

    test('Senaryo 2: Zaten kayıtlı bir e-posta ile misafir siparişi verilirse HATA fırlatmalı', async () => {
        console.log('\n--- TEST 2: Guest Checkout (Existing Email - Hata Bekleniyor) ---');

        const uniqueTime = Date.now();
        const existingEmail = `existing.${uniqueTime}@test.com`;
        
        const existingCustomer = await customerService.createCustomer({
            firstName: "Mevcut",
            lastName: "Müşteri",
            email: existingEmail,
            phone: `542${String(uniqueTime).slice(-7)}`
        });
        createdIds.customers.push(existingCustomer.id);
        console.log(`1. Mevcut müşteri oluşturuldu: ${existingEmail}`);

        const product = await productService.createProduct({
            name: "Çakışma Testi Ürünü",
            sku: `CONFLICT-${uniqueTime}`,
            stock: 50,
            price: 100
        });
        createdIds.products.push(product.id);

        const orderPayload = {
            customer: {
                firstName: "Taklitçi",
                email: existingEmail, // <--- AYNI EMAIL!
                phone: "05999999999"
            },
            items: [{ productId: product.id, quantity: 1 }]
        };

        try {
            await orderService.createOrder(orderPayload);
        } catch (error) {
            console.log(`Beklenen hata yakalandı: "${error.message}"`);
        }

        await expect(orderService.createOrder(orderPayload))
            .rejects
            .toThrow('CustomerAlreadyExists');
        
        console.log('Başarılı: Sistem mevcut e-postayı fark etti ve işlemi reddetti.');
    });

    test('Senaryo 3: Stok yetersizse sipariş reddedilmeli', async () => {
        console.log('\n--- TEST 3: Yetersiz Stok ---');
        
        const product = await productService.createProduct({
            name: "Az Stoklu",
            sku: `LOW-STK-${Date.now()}`,
            stock: 1, 
            price: 100,
            isStockTracking: true
        });
        createdIds.products.push(product.id);

        const uniqueTime = Date.now();
        const orderPayload = {
            customer: {
                 firstName: "Stok", 
                 email: `stock.${uniqueTime}@mail.com`, 
                 phone: `533${String(uniqueTime).slice(-7)}`
            },
            items: [{ productId: product.id, quantity: 5 }]
        };

        await expect(orderService.createOrder(orderPayload))
            .rejects
            .toThrow('InsufficientStock');
            
        console.log('Başarılı: Yetersiz stok hatası alındı.');
    });

});