import { HugoData } from '../utils/types';
import { updateUserPrefs } from './db';
import { promises as fs } from 'fs';

export const transferDb = async () => {
  const data = await fs.readFile('settings.json', 'utf-8');
  const settings = JSON.parse(data) as HugoData;
  for (const guild in settings) {
    const guildToCheck = settings[guild as keyof typeof settings];
    for (const key in guildToCheck) {
      const playerList = guildToCheck[key as keyof typeof guildToCheck];
      console.log('this is playerList', playerList);
      if (typeof playerList === 'object') {
        for (let i = 0; i < Object.keys(playerList).length; i++) {
          const playerToUpdate = Object.keys(playerList)[i];
          const playerId = playerToUpdate.substring(
            2,
            playerToUpdate.length - 1
          );
          console.log('playerid', playerId);
          const preferences = Object.values(playerList)[i];
          console.log('preferences', preferences);
          await updateUserPrefs(playerId, preferences);
        }
      }
    }
  }
};
