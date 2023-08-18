import { ConfirmedPlayer } from '../../utils/types';

export const figureItOut = (confirmedPlayers: ConfirmedPlayer[]) => {
  const confirmedCopy: ConfirmedPlayer[] = [
    ...confirmedPlayers,
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
      preferences: ['pos5', 'pos4', 'x', 'x', 'x'],
    },
  ];
  const availableRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
  const particularPlayers = confirmedCopy.filter(
    ({ preferences }) => preferences[0] !== 'fill' && preferences.length < 5
  );
  const theContestedObject = [
    {
      role: 'pos1',
      firstPick: 0,
      secondPick: 0,
      thirdPick: 0,
      fourthPick: 0,
      fifthPick: 0,
      undesired: 0,
    },
    {
      role: 'pos2',
      firstPick: 0,
      secondPick: 0,
      thirdPick: 0,
      fourthPick: 0,
      fifthPick: 0,
      undesired: 0,
    },
    {
      role: 'pos3',
      firstPick: 0,
      secondPick: 0,
      thirdPick: 0,
      fourthPick: 0,
      fifthPick: 0,
      undesired: 0,
    },
    {
      role: 'pos4',
      firstPick: 0,
      secondPick: 0,
      thirdPick: 0,
      fourthPick: 0,
      fifthPick: 0,
      undesired: 0,
    },
    {
      role: 'pos5',
      firstPick: 0,
      secondPick: 0,
      thirdPick: 0,
      fourthPick: 0,
      fifthPick: 0,
      undesired: 0,
    },
  ];

  particularPlayers.forEach(player => {
    theContestedObject.forEach(role => {
      const desireindex = player.preferences.indexOf(role.role);
      switch (desireindex) {
        case 0:
          role.firstPick++;
          break;
        case 1:
          role.secondPick++;
          break;
        case 2:
          role.thirdPick++;
          break;
        case 3:
          role.fourthPick++;
          break;
        case 4:
          role.fifthPick++;
          break;
        default:
          break;
      }
    });
  });
  console.log(theContestedObject);
};
