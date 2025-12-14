const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini CRM API Dokümantasyonu',
      version: '1.0.0',
      description:
        'Müşteri, Sipariş ve Ürün yönetimi için geliştirilmiş REST API.',
      contact: {
        name: 'Backend Geliştirici Ekibi',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme Sunucusu (Development)',
      },
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'Ahmet' },
            lastName: { type: 'string', example: 'Yılmaz' },
            email: { type: 'string', example: 'ahmet@mail.com' },
            phone: { type: 'string', example: '5551234567' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            customerId: { type: 'integer', example: 1 },
            totalAmount: { type: 'number', example: 500.0 },
            status: {
              type: 'string',
              enum: ['PENDING', 'SHIPPED', 'DELIVERED'],
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'integer', example: 10 },
                  quantity: { type: 'integer', example: 2 },
                  unitPrice: { type: 'number', example: 250.0 },
                },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Akıllı Telefon X' },
            sku: {
              type: 'string',
              description: 'Stok Tutma Kodu (Unique olmalı)',
              example: 'SMART-PHN-X',
            },
            stock: { type: 'integer', example: 50 },
            price: { type: 'number', format: 'float', example: 999.99 },
            isStockTracking: {
              type: 'boolean',
              description: 'Stok takibi yapılıp yapılmayacağı',
              example: true,
            },
          },
        },
      },
    },
  },
  // API dosyaları yolu (Bir üst dizindeki API klasörüne bak)
  apis: [path.resolve(__dirname, '..', 'api', '*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
