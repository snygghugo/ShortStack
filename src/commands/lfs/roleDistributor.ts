import { ConfirmedPlayer } from '../../utils/types';

export const figureItOut = () => {
  const confirmedCopy = [
    {
      user: {
        name: 'Tester',
        id: 'Tester',
        username: 'Tester',
        user: { username: 'Tester' },
        displayAvatarURL: () => 'https://laggan.online/abb.png',
        isDummy: true,
      },
      nickname: 'Tester',
      preferences: ['pos5', 'pos4'],
    },
    {
      user: {
        name: 'Tester2',
        id: 'Tester',
        username: 'Tester',
        user: { username: 'Tester' },
        displayAvatarURL: () => 'https://laggan.online/abb.png',
        isDummy: true,
      },
      nickname: 'Tester',
      preferences: ['pos4', 'pos5'],
    },
    {
      user: {
        name: 'Tester3',
        id: 'Tester',
        username: 'Tester',
        user: { username: 'Tester' },
        displayAvatarURL: () => 'https://laggan.online/abb.png',
        isDummy: true,
      },
      nickname: 'Tester',
      preferences: ['pos5', 'pos4', 'pos3'],
    },
  ];
  type ParticularPlayer = {
    id: string;
    preferences: string[];
    preferenceWeight: number;
  };
  const particularPlayers: ParticularPlayer[] = confirmedCopy
    .filter(({ preferences }) => preferences.length !== 5)
    .map(({ preferences, user }) => ({
      id: user.id,
      preferences,
      preferenceWeight: 1 / preferences.length,
    }));

  type Role = {
    role: string;
    potentialPlayers: string[];
    restrictedTo: string[];
    carriedWeight: number;
  };

  const roles: Role[] = [
    { role: 'pos1', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos2', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos3', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos4', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos5', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
  ];

  particularPlayers.forEach(player => {
    if (player.preferences.length === 1) {
      console.log('VERY picky player');
      roles;
    }
  });
  //IF THERE ARE TWO PLAYERS WHO ONLY PLAY THE SAME TWO ROLES, THOSE ROLES SHOULD BE UNAVAILABLE FOR ANYONE ELSE

  //IF ONE PERSON ONLY HAS ONE ROLE AS PREFERENCE, THE NEXT PERSON SHOULD HAVE ALL THE OTHER ROLES AS PREFERENCE

  roles; //DO THE LOGIC HERE INSTEAD

  //THIS SHOULD BE REVERSED, IT SHOULD BE ROLES DOING THE LOGIC
  particularPlayers.forEach(player => {
    console.log('thiis is preference weight', player.preferenceWeight);
    player.preferences.forEach(preference => {
      const foundPreference = roles.find(({ role }) => role === preference);
      if (foundPreference) {
        foundPreference.potentialPlayers.push(player.id);
        foundPreference.carriedWeight += player.preferenceWeight;
      }
    });
  });

  console.log(roles);
};

figureItOut();
