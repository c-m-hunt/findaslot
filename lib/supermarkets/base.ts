import beep from 'beepbeep';
import { Notifier } from '../notifier/base';
import { SupermarketOptions } from './types';

export class Supermarket<T extends Notifier> {
  notifier: T ;
  constructor(options: SupermarketOptions<T>) {
    this.notifier = options.notifier;
  }

  foundSlot = async (title: string, msg: string): Promise<void> => {
    beep([500, 500, 500, 500, 500, 500])
    await this.notifier.send(title, msg);
  }
}

export const defaultOptions: SupermarketOptions<Notifier> = {
  refresh: 60,
  notifier: new Notifier()
}