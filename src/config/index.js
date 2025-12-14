require('dotenv').config();

const dbSettings = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || 'mini_crm',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  app: {
    port: process.env.APP_PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  development: dbSettings,
  test: dbSettings,
  production: dbSettings,
};
