import { Iceland } from './supermarkets';
import { Notifier } from './notifier/base';
import { Pushover } from './notifier/pushover';

const username = process.env['SUPERMARKET_USERNAME'];
const password = process.env['SUPERMARKET_PASSWORD'];

if (!username || !password) {
  throw Error('SUPERMARKET_USERNAME and SUPERMARKET_PASSWORD must be set as environment vars');
}

const user = process.env['PUSHOVER_USER'];
const token = process.env['PUSHOVER_TOKEN'];

let notifier
if (user && token) {
  notifier = new Pushover(token, [user]); 
} else {
  notifier = new Notifier();
}

const i = new Iceland(username, password, notifier, 10);
i.run();
