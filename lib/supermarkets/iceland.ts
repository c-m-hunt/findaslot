import puppeteer, { Page, Browser } from 'puppeteer';
import moment from 'moment';
import logger from './../logger';
import { Slot } from './../types';
import { Supermarket } from './base';
import { Notifier } from '../notifier/base';

export class Iceland <T extends Notifier>extends Supermarket<T> {
  username: string;
  password: string;
  refresh: number;

  constructor(username: string, password: string, notifier: T, refresh: number = 30) {
    super(notifier);
    this.username = username;
    this.password = password;
    this.refresh = refresh * 1000;
  }

  run = async () => {
    logger.debug(`Creating browser and launching`);
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1200, height: 800
      }
    });
    logger.debug(`Heading to page and logging in`);
    const page = await this.setup(browser);
    await this.signIn(page);
    await this.checkSlots(page);
  };

  checkSlots = async (page: Page) => {
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
    logger.debug(`Waiting for ${this.refresh / 1000} seconds and then will try again`);
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
      const getAttribute = (name, node) => {
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
        let dateName = getAttribute('data-slots-key', dayNodes[i]);
        let slotNodes = dayNodes[i].querySelectorAll(slotContainerSelector)

        let slots = [];
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