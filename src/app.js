const express = require('express');
const logger = require('./lib/logger');

const customersRouter = require('./api/customers');
const productsRouter = require('./api/products');
const ordersRouter = require('./api/orders');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use((err, req, res, next) => {
  logger.error(`Unhandled Application Error: ${err.message} \nStack: ${err.stack}`);
  res.status(500).json({ error: 'Sunucu tarafında beklenmeyen bir hata oluştu.' });
});

module.exports = app;