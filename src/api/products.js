const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Ürün ve Envanter yönetimi API uç noktaları
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listeler
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Ürün listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', async (req, res, next) => {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) {
    logger.error(`API List Products Error: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Belirtilen ID'ye sahip ürünü getirir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     responses:
 *       200:
 *         description: Ürün başarıyla bulundu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün oluşturur
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Ürün başarıyla oluşturuldu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Eksik bilgi veya SKU zaten kayıtlı.
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, sku } = req.body;
    if (!name || !sku) {
      return res
        .status(400)
        .json({ error: 'Ürün adı (name) ve stok kodu (sku) zorunludur.' });
    }

    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    logger.error(`API Create Product Error: ${err.message}`);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(400)
        .json({ error: 'Bu SKU (Stok Kodu) ile kayıtlı ürün zaten var.' });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Belirtilen ID'ye sahip ürünü günceller
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Ürün başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Belirtilen ID'ye sahip ürünü siler
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     responses:
 *       204:
 *         description: Ürün başarıyla silindi.
 *       404:
 *         description: Ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
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
