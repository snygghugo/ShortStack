import {
  Message,
  User,
  CollectedInteraction,
  ComponentType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { prefEmbedMaker } from '../../utils/view';
import { PREFERENCE_BUTTONS } from '../../utils/buttons/buttonConsts';
import { createPrefRows } from '../stack/view';

export const preferenceCollector = async (
  interaction: ChatInputCommandInteraction
) => {
  const chosenRoles: string[] = [];
  const filter = (i: CollectedInteraction) => i.user.id === interaction.user.id;
  const message = await interaction.reply({
    embeds: [prefEmbedMaker(chosenRoles)],
    components: createPrefRows(chosenRoles),
    fetchReply: true,
    ephemeral: true,
  });
  const collector = message.createMessageComponentCollector({
    filter,
    time: 5 * 60000,
    componentType: ComponentType.Button,
  });

  collector.on('collect', async i => {
    if (i.customId === PREFERENCE_BUTTONS.finish.btnId) {
      if (chosenRoles.length === 0) {
        await i.update({ content: 'Cancelling without changing anything!' });
        collector.stop('early');
        return;
      }
      try {
        await i.update({
          embeds: [prefEmbedMaker(chosenRoles)],
          components: createPrefRows(chosenRoles),
        });
      } catch (error) {
        console.error('Failed to update pref interaction:', error);
      }
      collector.stop('finish');
      return;
    }
    chosenRoles.push(i.customId);
    try {
      await i.update({
        embeds: [prefEmbedMaker(chosenRoles)],
        components: createPrefRows(chosenRoles),
      });
      if (chosenRoles.length === 5) {
        collector.stop('finished');
      }
    } catch (error) {
      console.error('Failed to update pref interaction:', error);
    }
  });
  await new Promise((res, _rej) => {
    collector.on('end', async collected => {
      if (collector.endReason !== 'early') {
        await interaction.editReply({
          content: 'All done!',
          components: [],
        });
        return res(collected);
      }
      await interaction.editReply({
        content: 'Cancelled with no changes to preferences!',
        components: [],
        embeds: [],
      });
      return res(collected);
    });
  });
  return chosenRoles;
};
