import beep from 'beepbeep';
import puppeteer, { Page, Browser } from 'puppeteer';
import { Notifier } from '../notifier/base';
import { SupermarketOptions } from './types';
import { Spinner } from 'clui';

export class Supermarket<T extends Notifier> {
  notifier: T ;
  refresh: number;
  browser?: Browser;

  browserOptions: puppeteer.LaunchOptions = {
    headless: false,
    defaultViewport: null
  }

  constructor(options: SupermarketOptions<T>, browserOptions?: puppeteer.LaunchOptions) {
    this.notifier = options.notifier;
    this.refresh = options.refresh * 1000;
    this.browserOptions = { ...this.browserOptions, ...browserOptions };
  }

  setup = async(): Promise<Page> => {
    this.browser = await puppeteer.launch(this.browserOptions);
    const page = await this.browser.newPage();
    return page
  }

  foundSlot = async (title: string, msg: string): Promise<void> => {
    beep([500, 500, 500, 500, 500, 500])
    await this.notifier.send(title, msg);
  }

  countdown = async (): Promise<void> => {
    let countdownNumber = this.refresh / 1000;
    const countdown = new Spinner(`Refreshing in ${countdownNumber} seconds`, ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
    countdown.start();
    const timer = setInterval(() => {
      countdown.message(`Refreshing in ${countdownNumber} seconds`);
      countdownNumber --;
      if (countdownNumber == 0) {
        countdown.stop();
        clearInterval(timer);
      }
    }, 1000)
  }
}

export const defaultOptions: SupermarketOptions<Notifier> = {
  refresh: 60,
  notifier: new Notifier()
}