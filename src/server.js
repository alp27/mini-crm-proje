const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config');
const logger = require('./lib/logger');

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    const PORT = config.app.port || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

  } catch (err) {
    logger.error(`Unable to start server: ${err.message}`);
    process.exit(1);
  }
}

start();