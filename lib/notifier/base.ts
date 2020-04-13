import logger from './../logger';

export class Notifier {
  constructor() {

  }

  send = async(title: string, message: string): Promise<void> => {
    logger.warn(`Notifier not configured. Nothing will happen.`)
    Promise.resolve(true);
  }
}