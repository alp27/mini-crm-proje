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
  try {
    const customers = await Customer.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    logger.info(`Listed customers: Retrieved ${customers.length} records`);
    return customers;
  } catch (error) {
    logger.error(`listCustomers Error: ${error.message}`);
    throw error;
  }
}

async function getCustomerById(id) {
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      logger.warn(`Get Customer Failed: ID ${id} not found`);
    }
    return customer;
  } catch (error) {
    logger.error(`getCustomerById Error: ${error.message}`);
    throw error;
  }
}

async function createCustomer(payload) {
  try {
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
        logger.warn(`Create Customer Failed: Duplicate entry for ${payload.email} or ${payload.phone}`);
        throw new Error(`CustomerAlreadyExists: ID ${existingCustomer.id}`);
      }
    }

    const customer = await Customer.create(payload);
    logger.info(`Customer created: ID ${customer.id} - ${customer.firstName}`);
    return customer;
  } catch (error) {
    logger.error(`createCustomer Error: ${error.message}`);
    throw error;
  }
}

async function updateCustomer(id, payload) {
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      logger.warn(`Update Customer Failed: ID ${id} not found`);
      return null;
    }

    if (payload.phone) {
      payload.phone = normalizePhone(payload.phone);
    }

    await customer.update(payload);
    logger.info(`Customer updated: ID ${id}`);
    
    return customer;
  } catch (error) {
    logger.error(`updateCustomer Error: ${error.message}`);
    throw error;
  }
}

async function deleteCustomer(id) {
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      logger.warn(`Delete Customer Failed: ID ${id} not found`);
      return null;
    }

    await customer.destroy();
    logger.info(`Customer deleted: ID ${id}`);
    
    return true;
  } catch (error) {
    logger.error(`deleteCustomer Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};