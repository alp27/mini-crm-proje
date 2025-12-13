const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

router.get('/', async (req, res, next) => {
    try {
        const products = await productService.listProducts();
        res.json(products);
    } catch (err) {
        logger.error(`API List Products Error: ${err.message}`);
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            logger.warn(`API Get Product: Product ${req.params.id} not found`);
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        res.json(product);
    } catch (err) {
        logger.error(`API Get Product Error: ${err.message}`);
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, sku } = req.body;
        if (!name || !sku) {
            return res.status(400).json({ error: 'Ürün adı (name) ve stok kodu (sku) zorunludur.' });
        }

        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        logger.error(`API Create Product Error: ${err.message}`);
        
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Bu SKU (Stok Kodu) ile kayıtlı ürün zaten var.' });
        }
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        if (!updatedProduct) {
            logger.warn(`API Update Product: Product ${req.params.id} not found`);
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        res.json(updatedProduct);
    } catch (err) {
        logger.error(`API Update Product Error: ${err.message}`);
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        if (!result) {
            logger.warn(`API Delete Product: Product ${req.params.id} not found`);
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        res.status(204).send();
    } catch (err) {
        logger.error(`API Delete Product Error: ${err.message}`);
        next(err);
    }
});

module.exports = router;