const { sequelize, Order, Customer, Product, OrderItem } = require('../src/models');

let ids = { orderId: null, customerId: null, productId: null };

beforeAll(async () => {
    await sequelize.authenticate();
});

afterAll(async () => {
    if (ids.orderId) await Order.destroy({ where: { id: ids.orderId } });
    if (ids.customerId) await Customer.destroy({ where: { id: ids.customerId } });
    if (ids.productId) await Product.destroy({ where: { id: ids.productId } });
    await sequelize.close();
});

describe('OrderItem Model & İlişkiler', () => {

    test('Order ve Product oluşturup bunları OrderItem ile bağlayabilmeli', async () => {
        console.log('\n--- TEST: OrderItem İlişki Kontrolü ---');

        const customer = await Customer.create({ firstName: "Test", email: `test.item.${Date.now()}@m.com` });
        ids.customerId = customer.id;

        const product = await Product.create({ name: "Item Test Prd", sku: `ITM-${Date.now()}`, stock: 50, price: 100 });
        ids.productId = product.id;

        const order = await Order.create({ customerId: customer.id, totalAmount: 200, status: 'PENDING' });
        ids.orderId = order.id;

        const orderItem = await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: 2,
            unitPrice: 100.00
        });

        expect(orderItem).toBeDefined();
        expect(orderItem.orderId).toBe(order.id);
        console.log(`OrderItem oluşturuldu. (ID: ${orderItem.id})`);
    });

    test('Bir Sipariş silindiğinde (CASCADE) ona ait OrderItem da silinmeli', async () => {
        console.log('\n--- TEST: Cascade Delete Kontrolü ---');

        const countBefore = await OrderItem.count({ where: { orderId: ids.orderId } });
        expect(countBefore).toBeGreaterThan(0);

        await Order.destroy({ where: { id: ids.orderId } });
        console.log('Sipariş silindi.');

        const countAfter = await OrderItem.count({ where: { orderId: ids.orderId } });
        expect(countAfter).toBe(0);

        console.log('Başarılı: Sipariş silinince detayları da otomatik silindi.');
        
        ids.orderId = null; 
    });
});