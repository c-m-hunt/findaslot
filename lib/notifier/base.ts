import logger from './../logger';

export class Notifier {
  send = async(title: string, message: string): Promise<void> => {
    logger.warn(`Notifier not configured. Nothing will happen.`);
    logger.debug(`Notification would have sent:`);
    logger.debug(title);
    logger.debug(message);
    Promise.resolve(true);
  }
}