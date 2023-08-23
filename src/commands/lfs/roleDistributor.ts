import { User } from 'discord.js';
import { ConfirmedPlayer, Dummy } from '../../utils/types';
type ParticularPlayer = {
  id: string;
  user: User | Dummy;
  preferences: string[];
  preferenceWeight: number;
};

type Role = {
  role: string;
  potentialPlayers: ParticularPlayer[];
  particularPlayers: ParticularPlayer[];
  restrictedTo: (User | Dummy)[];
  carriedWeight: number;
};
const testerSet1 = [
  {
    user: {
      name: 'Tester1',
      id: 'Tester1',
      username: 'Tester1',
      user: { username: 'Tester1' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester1',
    preferences: ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'],
  },
  {
    user: {
      name: 'Tester34',
      id: 'Tester34',
      username: 'Tester34',
      user: { username: 'Tester34' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester34',
    preferences: ['pos3', 'pos4'],
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
      name: 'Tester12',
      id: 'Tester12',
      username: 'Tester12',
      user: { username: 'Tester12' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester12',
    preferences: ['pos1', 'pos2'],
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
];

const testerSet2 = [
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
      name: 'Tester34',
      id: 'Tester34',
      username: 'Tester34',
      user: { username: 'Tester34' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester34',
    preferences: ['pos3', 'pos4'],
  },
  {
    user: {
      name: 'Tester12',
      id: 'Tester12',
      username: 'Tester12',
      user: { username: 'Tester12' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester12',
    preferences: ['pos1', 'pos2'],
  },
  {
    user: {
      name: 'Tester531',
      id: 'Tester531',
      username: 'Tester531',
      user: { username: 'Tester531' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester531',
    preferences: ['pos5', 'pos3', 'pos1'],
  },
  {
    user: {
      name: 'Tester12',
      id: 'Tester12',
      username: 'Tester12',
      user: { username: 'Tester12' },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    },
    nickname: 'Tester12',
    preferences: ['pos1', 'pos2'],
  },
];

const roles: Role[] = [
  {
    role: 'pos1',
    potentialPlayers: [],
    particularPlayers: [],
    restrictedTo: [],
    carriedWeight: 0,
  },
  {
    role: 'pos2',
    potentialPlayers: [],
    particularPlayers: [],
    restrictedTo: [],
    carriedWeight: 0,
  },
  {
    role: 'pos3',
    potentialPlayers: [],
    particularPlayers: [],
    restrictedTo: [],
    carriedWeight: 0,
  },
  {
    role: 'pos4',
    potentialPlayers: [],
    particularPlayers: [],
    restrictedTo: [],
    carriedWeight: 0,
  },
  {
    role: 'pos5',
    potentialPlayers: [],
    particularPlayers: [],
    restrictedTo: [],
    carriedWeight: 0,
  },
];

const findOverlaps = (particularPlayers: ParticularPlayer[]) => {
  const foundOverlaps = [];
  for (let i = 0; i < particularPlayers.length; i++) {
    const thisPlayer = particularPlayers[i];
    const completeOverlap = particularPlayers.filter(({ preferences, id }) => {
      return (
        thisPlayer.id !== id &&
        preferences.every(preference => {
          return thisPlayer.preferences.includes(preference);
        })
      );
    });
    const overLappingPlayers = [thisPlayer, ...completeOverlap];

    if (overLappingPlayers.length === thisPlayer.preferences.length) {
      //three players would include the player we're using for comparison
      console.log(
        'This player ' + thisPlayer.id + ' has the following mess',
        overLappingPlayers
      );
      foundOverlaps.push(overLappingPlayers);
    }
  }
  return foundOverlaps;
};

export const figureItOut = (confirmedPlayers: ConfirmedPlayer[]) => {
  const playersWithPrefs: ParticularPlayer[] = confirmedPlayers.map(
    ({ preferences, user }) => ({
      id: user.id,
      user,
      preferences,
      preferenceWeight: 1 / preferences.length,
    })
  );
  //IF THERE ARE TWO PLAYERS WHO ONLY PLAY THE SAME TWO ROLES, THOSE ROLES SHOULD BE UNAVAILABLE FOR ANYONE ELSE
  // ^Check!^
  //IF THERE ARE THREE PLAYERS WITH 345, 34, 45, THEN 12 SHOULD BE THE ONLY OPTIONS
  //^Check!^
  const particularPlayers = playersWithPrefs.filter(
    ({ preferences }) => preferences.length < 5
  );
  const overlaps = findOverlaps(particularPlayers);
  const overLappedRoles = overlaps.map(overlapArray => {
    const [originatingPlayer] = overlapArray;
    return originatingPlayer.preferences;
  });
  console.log('This is overlapped roles', overLappedRoles);
  const availableRoles = roles.filter(({ role }) => {
    return !overLappedRoles.some(overLappedRoles => {
      return overLappedRoles.includes(role);
    });
  });
  console.log('this is available roles', availableRoles);

  roles.forEach(role => {
    // const prospectiveTakers = playersWithPrefs.filter(({ preferences }) =>
    //   preferences.includes(role.role)
    // );
    // const sortedProspectiveTakers = prospectiveTakers.sort(
    //   ({ preferences: a }, { preferences: b }) => {
    //     return a.length - b.length;
    //   }
    // );
    // role.potentialPlayers = sortedProspectiveTakers;
    // role.particularPlayers = sortedProspectiveTakers.filter(
    //   ({ preferences }) => preferences.length < 5
    // );
    // console.log('this is current role', role);
    // const sortedProspectiveTakers = prospectiveTakers.sort(
    //   ({ preferenceWeight: a }, { preferenceWeight: b }) => b - a
    // );
    // for (let i = 0; i < sortedProspectiveTakers.length; i++) {
    //   const prospectiveTaker = sortedProspectiveTakers[i];
    //   if (
    //     !(role.carriedWeight + prospectiveTaker.preferenceWeight > 1) &&
    //     prospectiveTaker.preferenceWeight < 20 //Someone who wants all roles doesn't really matter
    //   ) {
    //     console.log(
    //       `Adding the cw ${role.carriedWeight} to the weight ${prospectiveTaker.preferenceWeight} from ${prospectiveTaker.user.username}`
    //     );
    //     role.carriedWeight += prospectiveTaker.preferenceWeight;
    //     role.potentialPlayers.push(prospectiveTaker.user);
    //     if (role.carriedWeight >= 1) {
    //       role.restrictedTo = [...role.potentialPlayers];
    //       role.potentialPlayers = [];
    //     }
    //   }
    // }
  });
  return availableRoles;
};

const parsedRoles = figureItOut(testerSet1);
// console.log(
//   'Restricted to',
//   roles.map(({ role, restrictedTo }) => {
//     return `${role} is restricted to ${restrictedTo.map(({ id }) => id)}`;
//   })
// );
