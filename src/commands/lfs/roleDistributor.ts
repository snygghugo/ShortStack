import { User } from 'discord.js';
import { ConfirmedPlayer, Dummy } from '../../utils/types';
const confirmedTesters = [
  // {
  //   user: {
  //     name: 'Tester1',
  //     id: 'Tester1',
  //     username: 'Tester1',
  //     user: { username: 'Tester1' },
  //     displayAvatarURL: () => 'https://laggan.online/abb.png',
  //     isDummy: true,
  //   },
  //   nickname: 'Tester1',
  //   preferences: ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'],
  // },
  {
    user: {
      name: 'Tester2',
      id: 'Tester2',
      username: 'Tester2',
      user: { username: 'Tester2' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester2',
    preferences: ['pos2'],
  },
  {
    user: {
      name: 'Tester54',
      id: 'Tester54',
      username: 'Tester54',
      user: { username: 'Tester54' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester54',
    preferences: ['pos5', 'pos4'],
  },
  {
    user: {
      name: 'Tester543',
      id: 'Tester543',
      username: 'Tester543',
      user: { username: 'Tester543' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester543',
    preferences: ['pos5', 'pos4', 'pos3'],
  },
  {
    user: {
      name: 'Tester45',
      id: 'Tester45',
      username: 'Tester45',
      user: { username: 'Tester45' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester45',
    preferences: ['pos4', 'pos5'],
  },
];

export const figureItOut = (confirmedPlayers: ConfirmedPlayer[]) => {
  type ParticularPlayer = {
    id: string;
    user: User | Dummy;
    preferences: string[];
    preferenceWeight: number;
  };

  const particularPlayers: ParticularPlayer[] = confirmedPlayers.map(
    ({ preferences, user }) => ({
      id: user.id,
      user,
      preferences,
      preferenceWeight: 1 / preferences.length,
    })
  );

  type Role = {
    role: string;
    potentialPlayers: (User | Dummy)[];
    restrictedTo: (User | Dummy)[];
    carriedWeight: number;
  };

  const roles: Role[] = [
    { role: 'pos1', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos2', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos3', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos4', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
    { role: 'pos5', potentialPlayers: [], restrictedTo: [], carriedWeight: 0 },
  ];

  //IF THERE ARE TWO PLAYERS WHO ONLY PLAY THE SAME TWO ROLES, THOSE ROLES SHOULD BE UNAVAILABLE FOR ANYONE ELSE
  // ^Check!^

  roles.forEach(role => {
    const prospectiveTakers = particularPlayers.filter(({ preferences }) =>
      preferences.includes(role.role)
    );
    const sortedProspectiveTakers = prospectiveTakers.sort(
      ({ preferenceWeight: a }, { preferenceWeight: b }) => b - a
    );
    for (let i = 0; i < sortedProspectiveTakers.length; i++) {
      const prospectiveTaker = sortedProspectiveTakers[i];
      if (!(role.carriedWeight + prospectiveTaker.preferenceWeight > 1)) {
        console.log(
          `Adding the cw ${role.carriedWeight} to the weight ${prospectiveTaker.preferenceWeight} from ${prospectiveTaker.user.username}`
        );
        role.carriedWeight += prospectiveTaker.preferenceWeight;
        role.potentialPlayers.push(prospectiveTaker.user);
        if (role.carriedWeight >= 1) {
          role.restrictedTo = [...role.potentialPlayers];
          role.potentialPlayers = [];
        }
      }
    }
  });
  return roles;
};
