import { ButtonStyle } from 'discord.js';

export const STACK_BUTTONS = {
  join: { btnText: "I'M IN", btnId: 'join', btnStyle: ButtonStyle.Success },
  leave: { btnText: "I'M OUT", btnId: 'leave', btnStyle: ButtonStyle.Danger },
  dummy: {
    btnText: 'Add absentee (...)',
    btnId: 'dummy',
    btnStyle: ButtonStyle.Primary,
  },
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

export const EMOJI_DICT = {
  '1️⃣': 'pos1',
  '2️⃣': 'pos2',
  '3️⃣': 'pos3',
  '4️⃣': 'pos4',
  '5️⃣': 'pos5',
};

export const PREFERENCE_BUTTONS = {
  pos1: { btnText: '1️⃣', btnId: 'pos1', btnStyle: ButtonStyle.Secondary },
  pos2: { btnText: '2️⃣', btnId: 'pos2', btnStyle: ButtonStyle.Secondary },
  pos3: { btnText: '3️⃣', btnId: 'pos3', btnStyle: ButtonStyle.Secondary },
  pos4: { btnText: '4️⃣', btnId: 'pos4', btnStyle: ButtonStyle.Secondary },
  pos5: { btnText: '5️⃣', btnId: 'pos5', btnStyle: ButtonStyle.Secondary },
  finish: { btnText: 'Done!', btnId: 'finish', btnStyle: ButtonStyle.Success },
};

export const QUEUE_BUTTON = {
  btnText: 'AND THE QUEUE SHALL ANSWER',
  btnId: 'heedCall',
  btnStyle: ButtonStyle.Primary,
};

export const READY_TO_READY_BUTTON = {
  btnText: 'Start Ready Checker!',
  btnId: 'readyToReady',
  btnStyle: ButtonStyle.Secondary,
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
