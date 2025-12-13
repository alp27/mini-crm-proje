const { Customer, Sequelize } = require('../models');
const { Op } = Sequelize;
const logger = require('../lib/logger');

function normalizePhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('90')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return cleaned.length === 10 ? cleaned : null;
}

async function listCustomers() {
  return Customer.findAll({
    order: [['createdAt', 'DESC']], 
    limit: 100 
  });
}

async function getCustomerById(id) {
    return Customer.findByPk(id);
}

async function createCustomer(payload) {
  if (payload.phone) {
      payload.phone = normalizePhone(payload.phone);
  }

  const checks = [];
  if (payload.email) checks.push({ email: payload.email });
  if (payload.phone) checks.push({ phone: payload.phone });

  if (checks.length > 0) {
    const existingCustomer = await Customer.findOne({
      where: {
        [Op.or]: checks
      }
    });

    if (existingCustomer) {
       throw new Error(`CustomerAlreadyExists: ID ${existingCustomer.id}`);
    }
  }

  logger.info(`Creating customer: ${payload.firstName}`);
  const customer = await Customer.create(payload);
  return customer;
}

async function updateCustomer(id, payload) {
    const customer = await Customer.findByPk(id);
    if (!customer) return null;

    if (payload.phone) {
        payload.phone = normalizePhone(payload.phone);
    }

    await customer.update(payload);
    logger.info(`Customer updated: ID ${id}`);
    
    return customer;
}

async function deleteCustomer(id) {
    const customer = await Customer.findByPk(id);
    if (!customer) return null;

    await customer.destroy();
    logger.info(`Customer deleted: ID ${id}`);
    
    return true;
}

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};