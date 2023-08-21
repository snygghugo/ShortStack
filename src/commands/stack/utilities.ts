import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  CollectedInteraction,
} from 'discord.js';
import { PlayerObject } from '../../utils/types';
import { shuffle } from '../../utils/generalUtilities';

export const strictPicking = (
  i: CollectedInteraction,
  nextUp: PlayerObject,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  const interactor = i.user;
  const stackCreator = interaction.user;
  const expectedInteractor = nextUp.user;
  console.log('this is i.user.bot', i.user.bot);
  if ('isDummy' in nextUp.user || i.user.bot) {
    //TODO: explore why the i.user.bot thing doesn't seem to work
    console.log('this one has isDummy in nextUp, so anything goes');
    return true;
  }
  if (interactor.id === stackCreator.id) {
    return true;
  }
  if (interactor.id === expectedInteractor.id) {
    return true;
  }
  return false;
};

export const whosNext = (playerArray: PlayerObject[]): PlayerObject | null => {
  const unpickedPlayer = playerArray.find(player => !player.position);
  if (unpickedPlayer) {
    unpickedPlayer.position = '👈';
    return unpickedPlayer;
  }
  const filledPlayer = playerArray.findLast(
    player => player.position === 'fill'
  );
  if (filledPlayer) {
    filledPlayer.position = '👈';
    filledPlayer.fillFlag = true;
    return filledPlayer;
  }
  return null;
};

export const appropriateRole = (available: string[], nextUp: PlayerObject) => {
  const foundPreference = nextUp.preferences.find(preference =>
    available.includes(preference)
  );
  if (foundPreference) return foundPreference;
  if (!nextUp.fillFlag) return 'fill';
  return shuffle(available)[0];
};

export const getTimestampInSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

export const availableRoles = (playerArray: PlayerObject[]) => {
  const standardRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
  for (const player of playerArray) {
    if (player.position.startsWith('pos')) {
      standardRoles.splice(standardRoles.indexOf(player.position), 1);
    }
  }
  return standardRoles;
};
