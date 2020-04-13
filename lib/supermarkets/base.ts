import beep from 'beepbeep';
import { Notifier } from '../notifier/base';

export class Supermarket<T extends Notifier> {
  notifier: T ;
  constructor(notifier: T) {
    this.notifier = notifier;
  }

  foundSlot = (title, msg) => {
    beep([500, 500, 500, 500, 500, 500])
    this.notifier.send(title, msg);
  }
} 