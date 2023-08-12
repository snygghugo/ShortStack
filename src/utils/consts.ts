import { credentials as CREDENTIALS } from '../config.json';
export const CONNECTION = `mongodb+srv://${CREDENTIALS}@hugodata.kl5zxil.mongodb.net/?retryWrites=true&w=majority`;

export const readyColours = {
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
export const buttonOptions = {
  in: 'in',
  out: 'out',
  dummy: 'dummy',
  condi: 'condi',
};
export const readyOptions = {
  rdy: 'rdy',
  stop: 'stop',
  sudo: 'sudo',
  ping: 'ping',
};
export const standardTime = 60;

export const rdyButtonsCustomIds = {
  rdy: 'rdy',
  stop: 'stop',
  sudo: 'sudo',
  ping: 'ping',
};

export const stackButtonCustomIds = {
  join: 'in',
  leave: 'out',
  dummy: 'dummy',
  condi: 'condi',
};
