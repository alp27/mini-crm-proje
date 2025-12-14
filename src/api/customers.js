const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Müşteri yönetimi API uç noktaları
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listeler
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Müşteri listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers();
    res.json(customers);
  } catch (err) {
    logger.error('Error listing customers', { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Belirtilen ID'ye sahip müşteriyi getirir
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Müşteri ID
 *     responses:
 *       200:
 *         description: Müşteri başarıyla bulundu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(customer);
  } catch (err) {
    logger.error(`Error getting customer ${req.params.id}`, { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Yeni müşteri oluşturur
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Müşteri başarıyla oluşturuldu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Eksik veya hatalı giriş.
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', async (req, res, next) => {
  try {
    const { firstName } = req.body;
    if (!firstName || firstName.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Müşteri adı (firstName) zorunludur.' });
    }

    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    logger.error('Error creating customer', { err });

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(400)
        .json({
          error: 'Bu telefon numarası veya e-posta adresi zaten kayıtlı.',
        });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Belirtilen ID'ye sahip müşteriyi günceller
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Müşteri ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Müşteri başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', async (req, res, next) => {
  try {
    const updatedCustomer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(updatedCustomer);
  } catch (err) {
    logger.error(`Error updating customer ${req.params.id}`, { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Belirtilen ID'ye sahip müşteriyi siler
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Müşteri ID
 *     responses:
 *       204:
 *         description: Müşteri başarıyla silindi.
 *       404:
 *         description: Müşteri bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.status(204).send();
  } catch (err) {
    logger.error(`Error deleting customer ${req.params.id}`, { err });
    next(err);
  }
});
//alparslan test

module.exports = router;
