import {
  MessageComponentInteraction,
  ModalMessageModalSubmitInteraction,
} from 'discord.js';

type Acknowledgeable =
  | MessageComponentInteraction
  | ModalMessageModalSubmitInteraction;

/**
 * Runs async tasks one at a time, in the order they were added.
 */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();

  add<T>(task: () => Promise<T>): Promise<T> {
    const run = this.tail.then(task);
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}

/**
 * Acknowledge an interaction without changing anything so Discord does not show
 * "This interaction failed" after 3 seconds. This can be used when 2 users click the same button,
 *  but only one interaction needs to be processed to achieve the desired result.
 */
export const ackAndDiscard = async (interaction: Acknowledgeable) => {
  if (interaction.replied || interaction.deferred) return;
  try {
    await interaction.deferUpdate();
  } catch (error) {
    console.error('Failed to acknowledge discarded interaction', error);
  }
};
