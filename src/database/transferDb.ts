import { HugoData } from '../utils/types';
import { updateUserPrefs } from './db';
import { promises as fs } from 'fs';

export const transferDb = async () => {
  const data = await fs.readFile('settings.json', 'utf-8');
  const settings = JSON.parse(data) as HugoData;
  console.log('this is settings', settings);
  for (const guild in settings) {
    const guildToCheck = settings[guild as keyof typeof settings];
    console.log('this is guildtocheck', guildToCheck);
    for (const key in guildToCheck) {
      const player = guildToCheck[key as keyof typeof guildToCheck];
      console.log('this is player', player);
      if (typeof player === 'object') {
        const [fullPlayer] = Object.keys(player);
        const playerId = fullPlayer.substring(2, fullPlayer.length - 1);
        console.log(playerId);
        const [preferences] = Object.values(player);
        console.log(preferences);
        await updateUserPrefs(playerId, preferences);
      }
    }
  }
};
