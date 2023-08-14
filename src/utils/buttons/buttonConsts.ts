import { ButtonStyle } from 'discord.js';

export const STACK_BUTTONS = {
  join: { btnText: "I'M IN", btnId: 'join', btnStyle: ButtonStyle.Success },
  leave: { btnText: "I'M OUT", btnId: 'leave', btnStyle: ButtonStyle.Danger },
  dummy: { btnText: 'Dummy', btnId: 'dummy', btnStyle: ButtonStyle.Primary },
  condi: {
    btnText: "I'm in, but (...)",
    btnId: 'condi',
    btnStyle: ButtonStyle.Secondary,
  },
};

export const READY_BUTTONS = {
  rdy: { btnText: '✅', btnId: 'rdy', btnStyle: ButtonStyle.Success },
  stop: { btnText: 'Cancel', btnId: 'stop', btnStyle: ButtonStyle.Danger },
  sudo: {
    btnText: 'FORCE READY',
    btnId: 'sudo',
    btnStyle: ButtonStyle.Primary,
  },
  ping: { btnText: 'Ping!', btnId: 'ping', btnStyle: ButtonStyle.Secondary },
};

export const QUEUE_BUTTON = {
  btnText: 'AND THE QUEUE SHALL ANSWER',
  btnId: 'heedCall',
  btnStyle: ButtonStyle.Primary,
};

export const STACK_IT_BUTTON = {
  btnText: 'Stack it!',
  btnId: 'stack',
  btnStyle: ButtonStyle.Secondary,
};

export const REDO_BUTTON = {
  btnText: 'Re-check',
  btnId: 'redo',
  btnStyle: ButtonStyle.Secondary,
};
