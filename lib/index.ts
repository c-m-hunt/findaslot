import { Iceland } from './supermarkets';

const username = process.env['SUPERMARKET_USERNAME'];
const password = process.env['SUPERMARKET_PASSWORD'];

if (!username || !password) {
  throw Error('SUPERMARKET_USERNAME and SUPERMARKET_PASSWORD must be set as environment vars');
}

const i = new Iceland(username, password);
i.run();
