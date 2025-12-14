const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Sipariş ve detay yönetimi (Stok ve Transaction işlemleri dahil)
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Tüm siparişleri listeler (Detayları ve Müşteri bilgisini içerir)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Sipariş listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', async (req, res, next) => {
  try {
    const orders = await orderService.listOrders();
    res.json(orders);
  } catch (err) {
    logger.error(`API List Orders Error: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Belirtilen ID'ye sahip siparişi getirir (Detaylı)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sipariş ID
 *     responses:
 *       200:
 *         description: Sipariş detayları başarıyla bulundu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Sipariş bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      logger.warn(`API Get Order: Order ${req.params.id} not found`);
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(order);
  } catch (err) {
    logger.error(`API Get Order Error: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni sipariş oluşturur (Stok düşme ve Transaction içerir)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Mevcut müşteri ID'si
 *                 example: 5
 *               items:
 *                 type: array
 *                 description: Sipariş edilen ürünler listesi
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 10
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Sipariş başarıyla oluşturuldu, stok düşüldü.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Eksik bilgi veya yetersiz stok.
 *       500:
 *         description: Sunucu hatası (Transaction rollback edildi.)
 */
router.post('/', async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    logger.error(`API Create Order Error: ${err.message}`);

    if (err.message.includes('InsufficientStock')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('CustomerRequired')) {
      return res
        .status(400)
        .json({ error: 'Müşteri bilgisi (customerId) zorunludur.' });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Siparişin durumunu günceller
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sipariş ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELED]
 *                 example: SHIPPED
 *     responses:
 *       200:
 *         description: Sipariş durumu başarıyla güncellendi.
 *       404:
 *         description: Sipariş bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrder(
      req.params.id,
      req.body
    );
    if (!updatedOrder) {
      logger.warn(`API Update Order: Order ${req.params.id} not found`);
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(updatedOrder);
  } catch (err) {
    logger.error(`API Update Order Error: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Belirtilen ID'ye sahip siparişi siler (Detayları da silinir)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sipariş ID
 *     responses:
 *       204:
 *         description: Sipariş başarıyla silindi.
 *       404:
 *         description: Sipariş bulunamadı.
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
    if (!result) {
      logger.warn(`API Delete Order: Order ${req.params.id} not found`);
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.status(204).send();
  } catch (err) {
    logger.error(`API Delete Order Error: ${err.message}`);
    next(err);
  }
});

module.exports = router;
