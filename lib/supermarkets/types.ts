import { Notifier } from "./../notifier/base";

export interface SupermarketOptions <T extends Notifier>{
  refresh: number;
  notifier: T;
}