const { Order, Customer } = require('../models');
const logger = require('../lib/logger');

/**
 * Siparişleri listeler (Filtreleme destekli)
 * @param {Object} filters - { status, customerId }
 */
async function listOrders(filters = {}) {
  const queryOptions = {
    include: [
      {
        model: Customer,
        as: 'customer', 
        attributes: ['id', 'firstName', 'lastName', 'email'] 
      }
    ],
    order: [['createdAt', 'DESC']],
    where: {}
  };

  if (filters.status) {
    queryOptions.where.status = filters.status;
  }
  if (filters.customerId) {
    queryOptions.where.customerId = filters.customerId;
  }

  return Order.findAll(queryOptions);
}


async function getOrderById(id) {
  return Order.findByPk(id, {
    include: [{ model: Customer, as: 'customer' }]
  });
}



async function createOrder(payload) {
  
  const customer = await Customer.findByPk(payload.customerId);
  if (!customer) {
    throw new Error('CustomerNotFound'); 
  }

  const order = await Order.create(payload);
  logger.info(`New order created: ID ${order.id} for Customer ${payload.customerId}`);
  
  return order;
}


async function updateOrder(id, payload) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  await order.update(payload);
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
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};