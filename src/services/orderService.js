const { Order, Customer, OrderItem, sequelize } = require('../models');
const productService = require('./productService');
const logger = require('../lib/logger');

async function createOrder(payload) {
    let isCommitted = false;
    const transaction = await sequelize.transaction();

    try {
        let customerId = payload.customerId;

        if (!customerId && payload.customer) {
            try {
                const newCustomer = await Customer.create(payload.customer, { transaction });
                customerId = newCustomer.id;
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error('CustomerAlreadyExists: Bu e-posta ile kayıtlı müşteri bulunmaktadır. Lütfen mevcut müşteriyi seçerek devam ediniz.');
                }
                throw error;
            }
        }

        if (!customerId) {
            throw new Error('CustomerRequired');
        }

        let totalAmount = 0;
        const orderItemsData = []; 

        if (payload.items && payload.items.length > 0) {
            for (const item of payload.items) {
                const product = await productService.decreaseStock(item.productId, item.quantity);
                
                const currentPrice = item.unitPrice ? parseFloat(item.unitPrice) : parseFloat(product.price);
                totalAmount += currentPrice * item.quantity;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: currentPrice 
                });
            }
        } else if (payload.totalAmount) {
             totalAmount = payload.totalAmount;
        }

        const order = await Order.create({
            customerId: customerId,
            totalAmount: totalAmount,
            status: payload.status || 'PENDING'
        }, { transaction });

        let itemsWithOrderId = [];
        if (orderItemsData.length > 0) {
            itemsWithOrderId = orderItemsData.map(item => ({
                ...item,
                orderId: order.id
            }));
            
            await OrderItem.bulkCreate(itemsWithOrderId, { transaction });
        }

        await transaction.commit();
        isCommitted = true;
        
        logger.info(`Order created: ID ${order.id} for Customer ${customerId} - Total: ${totalAmount}`);
        
        order.dataValues.items = itemsWithOrderId; 
        return order;

    } catch (error) {
        if (!isCommitted && !transaction.finished) {
            await transaction.rollback();
        }
        logger.error(`createOrder Error: ${error.message}`);
        throw error;
    }
}

async function listOrders(filter = {}) {
    try {
        const where = {};
        if (filter.status) where.status = filter.status;
        if (filter.customerId) where.customerId = filter.customerId;

        const orders = await Order.findAll({
            where,
            include: [
                { 
                    model: Customer, 
                    as: 'customer' 
                },
                { 
                    model: OrderItem, 
                    as: 'items',
                    include: ['product'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        logger.info(`Listed orders: Retrieved ${orders.length} records`);
        return orders;
    } catch (error) {
        logger.error(`listOrders Error: ${error.message}`);
        throw error;
    }
}

async function getOrderById(id) {
    try {
        const order = await Order.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: OrderItem, as: 'items', include: ['product'] }
            ]
        });
        
        if (!order) {
            logger.warn(`Get Order Failed: ID ${id} not found`);
        }
        
        return order;
    } catch (error) {
        logger.error(`getOrderById Error: ${error.message}`);
        throw error;
    }
}

async function updateOrder(id, payload) {
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            logger.warn(`Update Order Failed: ID ${id} not found`);
            return null;
        }

        if (payload.status) {
            order.status = payload.status;
        }
        
        await order.save();
        logger.info(`Order updated: ID ${id} -> Status: ${order.status}`);
        return order;
    } catch (error) {
        logger.error(`updateOrder Error: ${error.message}`);
        throw error;
    }
}

async function deleteOrder(id) {
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            logger.warn(`Delete Order Failed: ID ${id} not found`);
            return null;
        }
        await order.destroy();
        logger.info(`Order deleted: ID ${id}`);
        return true;
    } catch (error) {
        logger.error(`deleteOrder Error: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createOrder,
    listOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};