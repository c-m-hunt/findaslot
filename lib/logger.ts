import { format, transports, createLogger } from 'winston';

const logLevel = process.env['PRODUCTION'] ? 'info' : 'debug';

const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
});

export default logger;