import beep from 'beepbeep';
import { sendNotification } from './../notifications';

export class Supermarket {
  constructor() {

  }

  foundSlot = (title, msg) => {
    beep([500, 500, 500, 500, 500, 500])
    sendNotification(title, msg);
  }
}