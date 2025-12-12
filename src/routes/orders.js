const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');


router.get('/', async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    
    const orders = await orderService.listOrders({ status, customerId });
    res.json(orders);
  } catch (err) {
    logger.error('Error listing orders', { err });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { customerId, totalAmount } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId zorunludur.' });
    }
    if (totalAmount === undefined || totalAmount < 0) {
      return res.status(400).json({ error: 'Geçerli bir tutar (totalAmount) giriniz.' });
    }

    const newOrder = await orderService.createOrder(req.body);
    res.status(201).json(newOrder);

  } catch (err) {
    if (err.message === 'CustomerNotFound') {
        return res.status(404).json({ error: 'Belirtilen ID ile müşteri bulunamadı. Önce müşteriyi oluşturun.' });
    }
    
    logger.error('Error creating order', { err });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(updatedOrder);
  } catch (err) {
    if (err.name === 'SequelizeDatabaseError' && err.message.includes('invalid input value for enum')) {
        return res.status(400).json({ error: 'Geçersiz sipariş durumu (status). Geçerli değerler: PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;