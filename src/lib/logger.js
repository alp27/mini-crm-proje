const { createLogger, format, transports } = require('winston');
const path = require('path');

const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${message} ${stack || ''}`;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    new transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error' 
    }),
    new transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log') 
    })
  ]
});

module.exports = logger;