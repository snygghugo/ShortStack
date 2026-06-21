import { credentials as CREDENTIALS } from '../config.json';
import { BLANK } from './textContent';
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

// --- /stack latency simulation (dev only, OFF by default) ------------------
// Reproduces the production 3s interaction-ack deadline bug locally. Enable in
// PowerShell with:
//   $env:SIMULATE_STACK_LATENCY=1; npm start        (default 4000ms, past 3s)
export const SIMULATE_STACK_LATENCY =
  process.env.SIMULATE_STACK_LATENCY === '1' ||
  process.env.SIMULATE_STACK_LATENCY === 'true';
export const SIMULATE_STACK_LATENCY_MS =
  Number(process.env.SIMULATE_STACK_LATENCY_MS) || 4000;

export const QUEUE_OPTIONS = {
  join: 'join',
  leave: 'leave',
  invoke: 'invoke',
};

export const BLANK_FIELD = { name: BLANK, value: BLANK, inline: false };
export const BLANK_FIELD_INLINE = { name: BLANK, value: BLANK, inline: true };
