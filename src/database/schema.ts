import { Schema } from 'mongoose';
export type MongoGuildT = {
  guildId: string;
  queue: string[];
  strictPicking: boolean;
  yaposChannel?: string;
  yaposRole?: string;
  lastQueueMessageId?: string;
};

export const mongoGuildSchema = new Schema<MongoGuildT>({
  guildId: { type: String, required: true },
  queue: [{ type: String, required: true }],
  strictPicking: { type: Boolean, required: true },
  yaposChannel: { type: String, required: false },
  yaposRole: { type: String, required: false },
});

export type MongoUserT = {
  userId: string;
  preferences: string[];
};

export const mongoUserSchema = new Schema<MongoUserT>({
  userId: { type: String, required: true },
  preferences: [{ type: String, required: true }],
});
