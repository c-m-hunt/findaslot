import beep from 'beepbeep';
import { Notifier } from '../notifier/base';
import { SupermarketOptions } from './types';

export class Supermarket<T extends Notifier> {
  notifier: T ;
  constructor(options: SupermarketOptions<T>) {
    this.notifier = options.notifier;
  }

  foundSlot = (title, msg) => {
    beep([500, 500, 500, 500, 500, 500])
    this.notifier.send(title, msg);
  }
} 