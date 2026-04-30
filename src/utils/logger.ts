import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Consola
    new winston.transports.Console(),
    // Archivo de errores
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Archivo general
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

export default logger;