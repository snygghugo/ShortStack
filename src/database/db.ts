import { model } from 'mongoose';
import {
  MongoGuildT,
  mongoGuildSchema,
  MongoUserT,
  mongoUserSchema,
} from './schema';

const MongoUser = model<MongoUserT>('MongoUser', mongoUserSchema);
const MongoGuild = model<MongoGuildT>('MongoGuild', mongoGuildSchema);

export const getGuildFromDb = async (guildId: string) => {
  const existingGuild = await MongoGuild.findOne({ guildId });
  if (!existingGuild) {
    const newGuild = new MongoGuild({ guildId });
    newGuild.strictPicking = false;
    await newGuild.save();
    return newGuild;
  }
  return existingGuild;
};

export const addUsersToQueue = async (
  guildId: string,
  userIds: string[],
  messageId: string
) => {
  return await MongoGuild.findOneAndUpdate(
    { guildId },
    {
      $addToSet: { queue: { $each: userIds } },
      $set: { lastQueueMessageId: messageId },
    },
    { upsert: true, new: true }
  );
};

export const removeUsersFromQueue = async (
  guildId: string,
  userIds: string[],
  messageId: string
) => {
  return await MongoGuild.findOneAndUpdate(
    { guildId },
    {
      $pull: { queue: { $in: userIds } },
      $set: { lastQueueMessageId: messageId },
    },
    { new: true, upsert: true }
  );
};

export const getUserPrefs = async (userId: string) => {
  const res = await MongoUser.findOne({ userId });
  if (!res) {
    return ['fill'];
  }
  return res.preferences;
};

export const updateUserPrefs = async (
  userId: string,
  preferences: string[]
) => {
  const userHasPrefs = await MongoUser.findOneAndUpdate(
    { userId },
    { $set: { preferences } }
  );
  if (!userHasPrefs) {
    const newUserPrefs = await new MongoUser({ userId, preferences }).save();
    return newUserPrefs;
  }
  return userHasPrefs;
};
