// 1. DÜZELTME: Dosya yolu '../src/models' olarak ayarlandı (Hata buradan geliyordu)
const { Order, Customer, OrderItem, sequelize, Product } = require('../src/models');
const orderService = require('../src/services/orderService');
const customerService = require('../src/services/customerService');
const productService = require('../src/services/productService');

// Test süresince oluşturulan kayıtların ID'lerini burada tutacağız
let createdIds = { orders: [], customers: [], products: [] };

beforeAll(async () => {
    await sequelize.authenticate();
});

afterAll(async () => {
    // 2. DÜZELTME: Temizlik Sırası (Çocuktan Anneye Doğru)
    // Önce Siparişleri sil (Bu işlem OrderItems'ı da otomatik siler - Cascade)
    if (createdIds.orders.length > 0) {
        await Order.destroy({ where: { id: createdIds.orders } });
    }
    
    // Siparişler silindiği için artık Müşterileri silebiliriz (Bağlı veri kalmadı)
    if (createdIds.customers.length > 0) {
        await Customer.destroy({ where: { id: createdIds.customers } });
    }

    // Siparişler (ve içindeki OrderItems) silindiği için Ürünleri silebiliriz
    if (createdIds.products.length > 0) {
        await Product.destroy({ where: { id: createdIds.products } });
    }

    await sequelize.close();
});

describe('Order Service - Entegrasyon Testleri (Stok & Detaylar)', () => {

    test('Senaryo 1: Guest kullanıcı sipariş verdiğinde Stok düşmeli, Detaylar kaydedilmeli VE listelenmeli', async () => {
        console.log('\n--- TEST 1: Tam Sipariş Akışı (Guest) ---');
        
        // A. Ürün Oluştur
        const initialStock = 100;
        const productPrice = 250.00;
        
        const product = await productService.createProduct({
            name: "Entegrasyon Test Ürünü",
            sku: `INT-TEST-${Date.now()}`,
            stock: initialStock,
            price: productPrice
        });
        createdIds.products.push(product.id);

        // B. Sipariş Ver
        const uniqueTime = Date.now();
        const buyQuantity = 2;
        
        const orderPayload = {
            customer: {
                firstName: "Ali",
                lastName: "Veli",
                email: `ali.veli.${uniqueTime}@test.com`,
                phone: `555${String(uniqueTime).slice(-7)}`
            },
            items: [
                { productId: product.id, quantity: buyQuantity }
            ]
        };

        const order = await orderService.createOrder(orderPayload);
        createdIds.orders.push(order.id);
        createdIds.customers.push(order.customerId);

        // C. Kontroller (Create)
        expect(order).toHaveProperty('id');
        expect(parseFloat(order.totalAmount)).toBe(productPrice * buyQuantity);
        console.log(`✅ Sipariş Oluştu: ID ${order.id}, Tutar: ${order.totalAmount}`);

        // Stok Düştü mü?
        const updatedProduct = await Product.findByPk(product.id);
        expect(updatedProduct.stock).toBe(initialStock - buyQuantity);
        console.log(`✅ Stok Kontrolü: ${initialStock} -> ${updatedProduct.stock} (Beklenen düştü)`);

        // Detaylar (OrderItems) Eklendi mi?
        const items = await OrderItem.findAll({ where: { orderId: order.id } });
        expect(items.length).toBe(1);
        expect(items[0].productId).toBe(product.id);
        expect(parseFloat(items[0].unitPrice)).toBe(productPrice); 
        console.log(`✅ Detay Kontrolü: OrderItems tablosunda kayıt var.`);

        // D. Yeni Kontrol: listOrders Çalışıyor mu?
        const listedOrders = await orderService.listOrders({ customerId: order.customerId });
        
        // 1. Kontrol: Listede en az bir sipariş var mı?
        expect(listedOrders.length).toBeGreaterThan(0);
        
        // 2. Kontrol: Çekilen siparişin detayları (ilişkileri) geldi mi?
        const fetchedOrder = listedOrders.find(o => o.id === order.id);
        expect(fetchedOrder).not.toBeNull();
        expect(fetchedOrder.customer).toHaveProperty('firstName', 'Ali'); // Customer ilişkisi geldi mi?
        expect(fetchedOrder.items.length).toBe(1);
        expect(fetchedOrder.items[0].product).toHaveProperty('name', 'Entegrasyon Test Ürünü'); // Product ilişkisi geldi mi?
        
        console.log(`✅ listOrders Kontrolü: Sipariş ve tüm detayları (Customer, Product) başarıyla çekildi.`);
    });

    test('Senaryo 2: Aynı e-posta ile Guest siparişi verilirse hata fırlatmalı', async () => {
        console.log('\n--- TEST 2: Duplicate Email Kontrolü ---');

        const uniqueTime = Date.now();
        const existingEmail = `duplicate.${uniqueTime}@test.com`;
        
        // Mevcut Müşteri
        const existingCustomer = await customerService.createCustomer({
            firstName: "Mevcut",
            email: existingEmail,
            phone: `542${String(uniqueTime).slice(-7)}`
        });
        createdIds.customers.push(existingCustomer.id);

        // Dummy Ürün
        const product = await productService.createProduct({
            name: "Dummy Ürün",
            sku: `DUMMY-${uniqueTime}`,
            stock: 10,
            price: 10
        });
        createdIds.products.push(product.id);

        // Çakışan Sipariş Talebi
        const orderPayload = {
            customer: {
                firstName: "Taklitçi",
                email: existingEmail, 
                phone: "05999999999"
            },
            items: [{ productId: product.id, quantity: 1 }]
        };

        await expect(orderService.createOrder(orderPayload))
            .rejects
            .toThrow('CustomerAlreadyExists');
        
        console.log('✅ Başarılı: Sistem mükerrer e-postayı engelledi.');
    });

    test('Senaryo 3: Stok yetersizse sipariş ve müşteri oluşmamalı (Rollback)', async () => {
        console.log('\n--- TEST 3: Transaction Rollback (Yetersiz Stok) ---');
        
        // 1 Stoklu Ürün
        const product = await productService.createProduct({
            name: "Kritik Stok",
            sku: `LOW-STK-${Date.now()}`,
            stock: 1, 
            price: 100
        });
        createdIds.products.push(product.id);

        const uniqueTime = Date.now();
        const emailThatShouldNotExist = `rollback.${uniqueTime}@mail.com`;

        const orderPayload = {
            customer: {
                 firstName: "Stok", 
                 email: emailThatShouldNotExist, 
                 phone: `533${String(uniqueTime).slice(-7)}`
            },
            // 1 stok var ama 5 istiyoruz -> HATA ÇIKMALI
            items: [{ productId: product.id, quantity: 5 }] 
        };

        // Hata Beklentisi
        await expect(orderService.createOrder(orderPayload))
            .rejects
            .toThrow(/InsufficientStock/);
            
        // Rollback Kontrolü: Müşteri veritabanına girmemiş olmalı
        const checkCustomer = await Customer.findOne({ where: { email: emailThatShouldNotExist } });
        expect(checkCustomer).toBeNull();

        console.log('✅ Başarılı: Hata alındı ve Transaction geri alındı (Müşteri silindi).');
    });

});