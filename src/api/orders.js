const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');

router.get('/', async (req, res, next) => {
    try {
        const customers = await customerService.listCustomers();
        res.json(customers);
    } catch (err) {
        logger.error(`API List Customers Error: ${err.message}`);
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) {
            logger.warn(`API Get Customer: Customer ${req.params.id} not found`);
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }
        res.json(customer);
    } catch (err) {
        logger.error(`API Get Customer Error: ${err.message}`);
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { firstName } = req.body;
        if (!firstName || firstName.trim() === '') {
            return res.status(400).json({ error: 'Müşteri adı (firstName) zorunludur.' });
        }

        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (err) {
        logger.error(`API Create Customer Error: ${err.message}`);
        
        if (err.message.includes('CustomerAlreadyExists') || err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Bu telefon numarası veya e-posta adresi zaten kayıtlı.' });
        }
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
        if (!updatedCustomer) {
            logger.warn(`API Update Customer: Customer ${req.params.id} not found`);
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }
        res.json(updatedCustomer);
    } catch (err) {
        logger.error(`API Update Customer Error: ${err.message}`);
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id);
        if (!result) {
            logger.warn(`API Delete Customer: Customer ${req.params.id} not found`);
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }
        res.status(204).send(); 
    } catch (err) {
        logger.error(`API Delete Customer Error: ${err.message}`);
        next(err);
    }
});

module.exports = router;