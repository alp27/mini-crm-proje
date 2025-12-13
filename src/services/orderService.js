const { Order, Customer, sequelize } = require('../models');
const customerService = require('./customerService');
const productService = require('./productService');
const logger = require('../lib/logger');

async function createOrder(payload) {
    const transaction = await sequelize.transaction();

    try {
        let customerId = payload.customerId;

        if (!customerId && payload.customer) {
            try {
                const newCustomer = await customerService.createCustomer(payload.customer);
                customerId = newCustomer.id;
            } catch (error) {
                if (error.message.includes('CustomerAlreadyExists')) {
                   throw new Error('CustomerAlreadyExists: Bu e-posta ile kayıtlı müşteri bulunmaktadır. Lütfen mevcut müşteriyi seçerek devam ediniz.');
                } else {
                    throw error;
                }
            }
        }

        if (!customerId) {
            throw new Error('CustomerRequired');
        }

        let totalAmount = 0;
        
        if (payload.items && payload.items.length > 0) {
            for (const item of payload.items) {
                const product = await productService.decreaseStock(item.productId, item.quantity);
                const price = item.unitPrice || product.price;
                totalAmount += price * item.quantity;
            }
        } else if (payload.totalAmount) {
             totalAmount = payload.totalAmount;
        }

        const order = await Order.create({
            customerId: customerId,
            totalAmount: totalAmount,
            status: payload.status || 'PENDING'
        }, { transaction });

        await transaction.commit();
        logger.info(`Order created: ID ${order.id} for Customer ${customerId}`);
        return order;

    } catch (error) {
        await transaction.rollback();
        logger.error(`Order creation failed: ${error.message}`);
        throw error;
    }
}

async function listOrders(filter = {}) {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.customerId) where.customerId = filter.customerId;

    return Order.findAll({
        where,
        include: [{
            model: Customer,
            as: 'customer'
        }],
        order: [['createdAt', 'DESC']]
    });
}

async function getOrderById(id) {
    return Order.findByPk(id, {
        include: [{ model: Customer, as: 'customer' }]
    });
}

async function updateOrder(id, payload) {
    const order = await Order.findByPk(id);
    if (!order) return null;

    if (payload.status) {
        order.status = payload.status;
    }
    
    await order.save();
    logger.info(`Order updated: ID ${id} -> Status: ${order.status}`);
    return order;
}

async function deleteOrder(id) {
    const order = await Order.findByPk(id);
    if (!order) return null;

    await order.destroy();
    logger.info(`Order deleted: ID ${id}`);
    return true;
}

module.exports = {
    createOrder,
    listOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};