import settings from '../../settings.json';
import { updateUserPrefs } from './db';

export const transferDb = async () => {
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
