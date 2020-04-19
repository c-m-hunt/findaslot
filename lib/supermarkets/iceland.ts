import puppeteer, { Page } from 'puppeteer';
import moment from 'moment';
import Table from 'cli-table';
import logger from './../logger';
import { Slot, SlotTime } from './../types';
import { SupermarketOptions } from './types';
import { Supermarket } from './base';
import { Notifier } from '../notifier/base';


export class Iceland <T extends Notifier>extends Supermarket<T> {
  username: string;
  password: string;

  constructor(username: string, password: string, options: SupermarketOptions<T>, browserOptions?: puppeteer.LaunchOptions) {
    super(options, browserOptions);
    this.username = username;
    this.password = password;
  }

  run = async (): Promise<void> => {
    logger.debug(`Creating browser and launching`);
    const page = await this.setup();
    logger.debug(`Heading to page and logging in`);
    await page.goto('https://www.iceland.co.uk/book-delivery');
    await this.signIn(page);
    await this.checkSlots(page);
  };

  checkSlots = async (page: Page): Promise<void> => {
    logger.debug(`Checking slots`)
    const slots = await this.getSlots(page);
    const table = new Table({ head: ['Date', 'Time', 'Available']})
    let found: { slot: Slot; time: SlotTime } | null = null
    for (const slot of slots) {
      for (const time of slot.slots) {
        table.push([slot.date, time.time, time.available ? 'Available' : `Not available`]);
        found = { slot, time }
      }
    }
    console.log(table.toString());
    if (found) {
      await this.foundSlot(`Slot available for ${this.username}`, `Check ${found.time.time} slot on ${found.slot.date}`);
      return;
    }
    this.countdown();
    await page.waitFor(this.refresh);
    await page.reload();
    await this.checkSlots(page);
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
        let slotBooked = false;
        for (let j = 0; j < slotNodes.length; j ++) {
          const slotNode = slotNodes[j];
          const available = !slotNode.classList.contains('unavailable')

          if (available) {
            const takeSlot = slotNode.querySelector('.delivery-schedule-options button');
            if (takeSlot && !slotBooked) {
              //@ts-ignore
              takeSlot.click();
              slotBooked = true;
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