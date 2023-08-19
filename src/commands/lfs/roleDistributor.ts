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
      preferences: ['pos5', 'pos4', 'x', 'x', 'x'],
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
      preferences: ['pos4', 'pos5', 'x', 'x', 'x'],
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
      preferences: ['pos5', 'pos4', 'pos3', 'x', 'x'],
    },
  ];
  const particularPlayers = confirmedCopy.filter(({ preferences }) =>
    preferences.includes('x')
  );

  type Role = {
    role: string;
    potentialPlayers: string[];
    restrictedTo: string[];
  };

  const roles: Role[] = [
    { role: 'pos1', potentialPlayers: [], restrictedTo: [] },
    { role: 'pos2', potentialPlayers: [], restrictedTo: [] },
    { role: 'pos3', potentialPlayers: [], restrictedTo: [] },
    { role: 'pos4', potentialPlayers: [], restrictedTo: [] },
    { role: 'pos5', potentialPlayers: [], restrictedTo: [] },
  ];

  particularPlayers.forEach(player => {
    if (player.preferences.length === 1) {
      console.log('VERY picky player');
      roles;
    }
  });
  //IF THERE ARE TWO PLAYERS WHO ONLY PLAY THE SAME TWO ROLES, THOSE ROLES SHOULD BE UNAVAILABLE FOR ANYONE ELSE

  //IF ONE PERSON ONLY HAS ONE ROLE AS PREFERENCE, THE NEXT PERSON SHOULD HAVE ALL THE OTHER ROLES AS PREFERENCE

  particularPlayers.forEach(player => {
    if (player.preferences.length === 1) {
      //player only wants to play one thing
      const [preferredRole] = player.preferences;
      const roleToRestrict = roles.find(({ role }) => role === preferredRole);
      roleToRestrict?.restrictedTo.push(player.user.id);
    }
  });

  const numberOfPlayers = confirmedCopy.length;
  const availableRoles = roles.filter(role => {
    role.potentialPlayers;
  });
  const rolesPeopleCanPlay = roles.filter(
    ({ potentialPlayers }) => potentialPlayers.length
  );
  console.log(rolesPeopleCanPlay);
  console.log(roles);
};

figureItOut();
