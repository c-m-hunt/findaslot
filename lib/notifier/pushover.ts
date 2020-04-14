import Push from 'pushover-notifications';
import logger from '../logger';
import { Notifier } from './base';

export class Pushover extends Notifier {
  users: string[];
  client: Push;
  constructor(token: string, users: string[]) {
    super();
    this.users = users;
    this.client = new Push( {
      user: process.env['PUSHOVER_USER'],
      token: process.env['PUSHOVER_TOKEN'],
    });
  }

  send = async(title: string, message: string): Promise<void> => {
    logger.debug("Sending message");
    const msg = {
      user: '',
      message,
      title,
      sound: 'magic',
      device: 'devicename',
      priority: 1
    }
    for (const u of this.users) {
      msg.user = u;
      this.client.send( msg, ( err, result ) => {
        if ( err ) {
          logger.error(`Message send failed: ${err.message}`);
          throw err
        }
        logger.debug(`Message sent successfully: ${result}`)
        Promise.resolve();
      })
    }
  }
}