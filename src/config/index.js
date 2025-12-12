require('dotenv').config();

const dbSettings = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '12345',
  database: process.env.DB_NAME || 'mini_crm_dev',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false 
};

module.exports = {
  app: {
    port: process.env.APP_PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  db: dbSettings,
  
  development: dbSettings,
  test: dbSettings,      
  production: dbSettings  
};