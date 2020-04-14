import puppeteer, { Page, Browser } from 'puppeteer';
import moment from 'moment';
import logger from './../logger';
import { Slot } from './../types';
import { SupermarketOptions } from './types';
import { Supermarket } from './base';
import { Notifier } from '../notifier/base';


export class Iceland <T extends Notifier>extends Supermarket<T> {
  username: string;
  password: string;

  constructor(username: string, password: string, options: SupermarketOptions<T>) {
    super(options);
    this.username = username;
    this.password = password;
  }

  run = async (): Promise<void> => {
    logger.debug(`Creating browser and launching`);
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });
    logger.debug(`Heading to page and logging in`);
    const page = await this.setup(browser);
    await this.signIn(page);
    await this.checkSlots(page);
  };

  checkSlots = async (page: Page): Promise<void> => {
    logger.debug(`Checking slots`)
    const slots = await this.getSlots(page);
    for (const slot of slots) {
      console.log(`------------------------------------------`);
      console.log(`${slot.date}`)
      for (const time of slot.slots) {
        console.log(`${time.time}        ${time.available ? 'Available' : `Not available`}`);
        if (time.available) {
          this.foundSlot(`Slot available for ${this.username}`, `Check ${time.time} slot on ${slot.date}`);
          Promise.resolve();
        }
      }
    }
    this.countdown();
    await page.waitFor(this.refresh);
    await page.reload();
    await this.checkSlots(page);
  }

  setup = async(browser: Browser): Promise<Page> => {
    const page = await browser.newPage();
    await page.goto('https://www.iceland.co.uk/book-delivery');
    return page
  }

  getSlots = async(page: Page): Promise<Slot[]> => {
    const slots = await page.evaluate(() => {
      const slotsContainerSelector = '.delivery-schedule-slots';  
      const slotContainerSelector = '.delivery-schedule-slot';
      const getAttribute = (name, node): string | null => {
        if (node.hasAttributes()) {
          const attrs = node.attributes;
          for(let i = 0; i < attrs.length; i++) {
            if (attrs[i].name === name) {
              return attrs[i].value;
            }
          }
        }
        return null;
      }

      const days = [];
      const dayNodes = document.querySelectorAll(slotsContainerSelector);

      for (let i = 0; i < dayNodes.length; i ++) {
        const dateName = getAttribute('data-slots-key', dayNodes[i]);
        const slotNodes = dayNodes[i].querySelectorAll(slotContainerSelector)

        const slots = [];
        for (let j = 0; j < slotNodes.length; j ++) {
          const slotNode = slotNodes[j];
          const available = !slotNode.classList.contains('unavailable')

          if (available) {
            const takeSlot = slotNode.querySelector('.delivery-schedule-options button');
            if (takeSlot) {
              //@ts-ignore
              takeSlot.click();
            }
          }

          // @ts-ignore
          const time = slotNode.querySelector('.delivery-schedule-slot-range div').innerText;
          slots.push({
            // @ts-ignore
            time, available
          });
        }

        days.push({
          // @ts-ignore
          date: dateName,
          // @ts-ignore
          slots
        })
      }
      return days;
    })
    const slotsTidied = slots.map((slot) => {
      // @ts-ignore
      slot.date = moment(slot.date).format('ddd DD MMM YYYY');
      return slot;
    })
    return slotsTidied;
  }

  signIn = async(page: Page): Promise<void> => {
    const signInSelector = '.user-info .user-account';
    await page.waitFor(2000);
    await page.waitForSelector(signInSelector);
    await page.click(signInSelector);
    await page.waitFor(1000);
    await page.type('#dwfrm_login_username', this.username);
    await page.type('#dwfrm_login_password', this.password);
    await page.click('.login-form-button');
    await page.waitForNavigation();
    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("Welcome back")'
    );
  }
}