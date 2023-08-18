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
      preferences: ['pos5', 'pos4', 'x', 'x', 'x'],
    },
  ];
  const particularPlayers = confirmedCopy.filter(({ preferences }) =>
    preferences.includes('x')
  );
  const theContestedObject = [
    {
      role: 'pos1',
      firstPref: 0,
      secondPref: 0,
      thirdPref: 0,
      fourthPref: 0,
      fifthPref: 0,
      undesired: 0,
    },
    {
      role: 'pos2',
      firstPref: 0,
      secondPref: 0,
      thirdPref: 0,
      fourthPref: 0,
      fifthPref: 0,
      undesired: 0,
    },
    {
      role: 'pos3',
      firstPref: 0,
      secondPref: 0,
      thirdPref: 0,
      fourthPref: 0,
      fifthPref: 0,
      undesired: 0,
    },
    {
      role: 'pos4',
      firstPref: 0,
      secondPref: 0,
      thirdPref: 0,
      fourthPref: 0,
      fifthPref: 0,
      undesired: 0,
    },
    {
      role: 'pos5',
      firstPref: 0,
      secondPref: 0,
      thirdPref: 0,
      fourthPref: 0,
      fifthPref: 0,
      undesired: 0,
    },
  ];

  particularPlayers.forEach(player => {
    theContestedObject.forEach(role => {
      const desireindex = player.preferences.indexOf(role.role);
      switch (desireindex) {
        case 0: //If it's found early, it means it's desired
          role.firstPref++;
          break;
        case 1:
          role.secondPref++;
          break;
        case 2:
          role.thirdPref++;
          break;
        case 3:
          role.fourthPref++;
          break;
        case 4:
          role.fifthPref++;
          break;
        case -1: //if it's not found at all, it's undesired
          role.undesired++;
          break;
      }
    });
  });
  console.log(theContestedObject);
};

figureItOut();
