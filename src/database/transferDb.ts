import settings from '../../settings.json';
import { updateUserPrefs } from './db';

export const transferDb = async () => {
  for (const key in settings['209707792314007552']) {
    const player =
      settings['209707792314007552'][
        key as keyof (typeof settings)['209707792314007552']
      ];
    if (typeof player === 'object') {
      const [playerId] = Object.keys(player);
      console.log(playerId.substring(2, playerId.length - 1));
      const [preferences] = Object.values(player);
      console.log(preferences);
      await updateUserPrefs(playerId, preferences);
    }
  }
};
