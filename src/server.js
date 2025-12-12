const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config');
const logger = require('./lib/logger');

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection successful.');

    const PORT = config.app.port || 3000;
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });

  } catch (err) {
    logger.error(' Unable to start server', { err });
    console.error('Kritik Hata:', err);
    process.exit(1);
  }
}

start();