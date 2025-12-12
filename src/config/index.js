require('dotenv').config();

module.exports = {
  app: {
    port: process.env.APP_PORT || 3000,
    // TODO: environment ayrımı (dev, test, prod) henüz tam düşünülmedi
    env: process.env.NODE_ENV || 'development'
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1', // prod'da böyle olmamalı aslında
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mini_crm_dev', // env ile tutarsız
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '12345',
    dialect: 'postgres',
    logging: false // TODO: loglama ile entegre edilecek
  },
  development: { // Burayı ekledim migration için 
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '12345',
    database: process.env.DB_NAME || 'mini_crm_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
};
