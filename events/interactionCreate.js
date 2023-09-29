const { Events } = require("discord.js");
const { logger } = require("../utils/logger");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(
      interaction.commandName
    );

    if (!command) {
      logger("ERROR", `Command ${interaction.commandName} not found`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      logger("ERROR"`${err}`);

      await interaction.reply({
        content: "There was an error running that command.",
        ephemeral: true,
      });
    }
  },
};
