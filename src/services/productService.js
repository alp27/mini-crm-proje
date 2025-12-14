const { Product } = require('../models');
const logger = require('../lib/logger');

async function createProduct(payload) {
  try {
    const product = await Product.create(payload);
    logger.info(
      `Product created: ${product.name} (SKU: ${product.sku}) - Stock: ${product.stock}`
    );
    return product;
  } catch (error) {
    logger.error(`createProduct Error: ${error.message}`);
    throw error;
  }
}

async function listProducts() {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
    });
    logger.info(`Listed products: Retrieved ${products.length} records`);
    return products;
  } catch (error) {
    logger.error(`listProducts Error: ${error.message}`);
    throw error;
  }
}

async function getProductById(id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      logger.warn(`Get Product Failed: ID ${id} not found`);
    }
    return product;
  } catch (error) {
    logger.error(`getProductById Error: ${error.message}`);
    throw error;
  }
}

async function decreaseStock(productId, quantity) {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      logger.warn(`Stock Update Failed: Product ID ${productId} not found`);
      throw new Error('ProductNotFound');
    }

    if (product.isStockTracking === false) {
      logger.info(
        `Stock tracking disabled for product ${product.sku}. Skipping decrement.`
      );
      return product;
    }

    if (product.stock < quantity) {
      logger.warn(
        `Insufficient Stock: SKU ${product.sku}. Current: ${product.stock}, Requested: ${quantity}`
      );
      throw new Error('InsufficientStock');
    }

    product.stock -= quantity;
    await product.save();

    logger.info(
      `Stock decreased: SKU ${product.sku}. New Stock: ${product.stock} (-${quantity})`
    );
    return product;
  } catch (error) {
    logger.error(`decreaseStock Error: ${error.message}`);
    throw error;
  }
}

async function updateProduct(id, payload) {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      logger.warn(`Update Product Failed: ID ${id} not found`);
      return null;
    }

    await product.update(payload);
    logger.info(`Product updated: ID ${id}`);
    return product;
  } catch (error) {
    logger.error(`updateProduct Error: ${error.message}`);
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      logger.warn(`Delete Product Failed: ID ${id} not found`);
      return null;
    }

    await product.destroy();
    logger.info(`Product deleted: ID ${id}`);
    return true;
  } catch (error) {
    logger.error(`deleteProduct Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  decreaseStock,
  updateProduct,
  deleteProduct,
};
