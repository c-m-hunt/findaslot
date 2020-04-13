import Push from 'pushover-notifications';
import logger from './logger';

const p = new Push( {
  user: process.env['PUSHOVER_USER'],
  token: process.env['PUSHOVER_TOKEN'],
});

export const sendNotification = async(title: string, message: string): Promise<void> => {
  logger.debug("Sending message");
  const msg = {
    message,
    title,
    sound: 'magic',
    device: 'devicename',
    priority: 1
  }

  p.send( msg, ( err, result ) => {
    if ( err ) {
      logger.error(`Message send failed: ${err.message}`);
      throw err
    }
    logger.debug(`Message sent successfully: ${result}`)
    Promise.resolve();
  })
}

