import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { READYTIME } from '../../utils/consts';
import { modalComponent } from '../../utils/view';
export const getDummyNameModal = async (interaction: ButtonInteraction) => {
  const uniqueId = Date.now().toString();
  const modal = new ModalBuilder().setCustomId(uniqueId).setTitle('Ok, buddy');
  const avatarInput = new TextInputBuilder()
    .setCustomId('dummyName')
    .setLabel('Who are you reserving a spot for?')
    .setPlaceholder('This spot is for...')
    .setMaxLength(25)
    .setStyle(TextInputStyle.Short);
  const modalInput = modalComponent(avatarInput);
  modal.addComponents(modalInput);
  await interaction.showModal(modal);
  const submitted = await interaction
    .awaitModalSubmit({
      time: READYTIME * 1000,
      filter: i => i.user.id === interaction.user.id && i.customId === uniqueId,
    })
    .catch(error => {
      console.log('This is inside the modal error thing');
      console.error(error);
      return null;
    });
  return submitted;
};

export const condiModal = async (interaction: ButtonInteraction) => {
  const uniqueId = Date.now().toString();
  const modal = new ModalBuilder().setCustomId(uniqueId).setTitle('Ok, buddy');
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel("What's the holdup? Include ETA")
    .setPlaceholder("Describe what's stopping you from being IN RIGHT NOW")
    .setMaxLength(140)
    .setStyle(TextInputStyle.Short);
  const modalInput = modalComponent(reasonInput);
  modal.addComponents(modalInput);
  await interaction.showModal(modal);
  const submitted = await interaction
    .awaitModalSubmit({
      time: READYTIME * 1000,
      filter: i => i.user.id === interaction.user.id && i.customId === uniqueId,
    })
    .catch(error => {
      console.error(error);
      return null;
    });
  return submitted;
};
