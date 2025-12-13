const orderService = require('../src/services/orderService');
const customerService = require('../src/services/customerService');
const { sequelize, Order, Customer } = require('../src/models');

let testCustomer;
let createdOrderId;

beforeAll(async () => {
    await sequelize.authenticate();
    testCustomer = await customerService.createCustomer({
        firstName: "Order",
        lastName: "Tester",
        email: "order.cleanup@jest.com",
        phone: "05001234567"
    });
});

afterAll(async () => {
    if (createdOrderId) {
        await Order.destroy({ where: { id: createdOrderId } });
    }
    
    if (testCustomer && testCustomer.id) {
        await Customer.destroy({ where: { id: testCustomer.id } });
    }
    
    console.log('🗑️ Order ve Customer test verileri temizlendi.');
    await sequelize.close();
});

describe('Order Service Birim Testleri', () => {

    test('Sipariş oluşturulmalı', async () => {
        const newOrder = {
            customerId: testCustomer.id,
            totalAmount: 250.00,
            status: 'PENDING'
        };

        const created = await orderService.createOrder(newOrder);
        createdOrderId = created.id; 

        expect(created).toHaveProperty('id');
        expect(created.customerId).toBe(testCustomer.id);
    });

    test('Siparişler listelenmeli', async () => {
        const orders = await orderService.listOrders({ status: 'PENDING' });
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length).toBeGreaterThan(0);
    });

    test('Olmayan müşteriye sipariş verilememeli', async () => {
        await expect(orderService.createOrder({ customerId: 999999, totalAmount: 10 }))
            .rejects.toThrow();
    });
});