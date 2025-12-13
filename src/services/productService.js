const { Product } = require('../models');
const logger = require('../lib/logger');

async function createProduct(payload) {
    logger.info(`Creating product: ${payload.name} (Tracking: ${payload.isStockTracking})`);
    const product = await Product.create(payload);
    return product;
}

async function listProducts() {
    return Product.findAll({
        order: [['createdAt', 'DESC']]
    });
}

async function getProductById(id) {
    return Product.findByPk(id);
}

async function decreaseStock(productId, quantity) {
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error('ProductNotFound');
    }

    if (product.isStockTracking === false) {
        logger.info(`Stock tracking disabled for product ${product.sku}. Skipping decrement.`);
        return product; 
    }

    if (product.stock < quantity) {
        logger.warn(`Insufficient stock for product ${product.sku}. Current: ${product.stock}, Requested: ${quantity}`);
        throw new Error('InsufficientStock');
    }

    product.stock -= quantity;
    await product.save();
    
    logger.info(`Stock decreased for ${product.sku}. New stock: ${product.stock}`);
    return product;
}

async function updateProduct(id, payload) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(payload);
    return product;
}

async function deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return true;
}

module.exports = {
    createProduct,
    listProducts,
    getProductById,
    decreaseStock,
    updateProduct,
    deleteProduct
};