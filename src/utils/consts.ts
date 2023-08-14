import { credentials as CREDENTIALS } from '../config.json';
import { ButtonStyle } from 'discord.js';
export const CONNECTION = `mongodb+srv://${CREDENTIALS}@hugodata.kl5zxil.mongodb.net/?retryWrites=true&w=majority`;

export const READY_COLOURS = {
  0: 0x000000, //black
  1: 0xcc3300, //red
  2: 0xff9900,
  3: 0xffff00, //yellow
  4: 0xccff33,
  5: 0x99ff33, //green
};
export const ONEHOUR = 60 * 60;
export const FIVEMINUTES = 5 * 60;
export const READYTIME = 2 * 60;
export const STANDARD_TIME = 60;

export const STACK_BUTTON_IDS = {
  join: 'in',
  leave: 'out',
  dummy: 'dummy',
  condi: 'condi',
};
export const READY_BUTTONS_IDS = {
  rdy: 'rdy',
  stop: 'stop',
  sudo: 'sudo',
  ping: 'ping',
};

export const QUEUE_BUTTON = {
  btnText: 'AND THE QUEUE SHALL ANSWER',
  btnId: 'heedCall',
  btnStyle: ButtonStyle.Primary,
};

export const STACK_BUTTON = {
  btnText: 'Stack it!',
  btnId: 'stack',
  btnStyle: ButtonStyle.Secondary,
};

export const REDO_BUTTON = {
  btnText: 'Re-check',
  btnId: 'redo',
  btnStyle: ButtonStyle.Secondary,
};
