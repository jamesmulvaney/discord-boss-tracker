const { Events } = require("discord.js");
const { logger } = require("../utils/logger");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    const command = interaction.client.slashCommands.get(
      interaction.commandName
    );

    if (!command) {
      logger("ERROR", `Command ${interaction.commandName} not found`);
      return;
    }

    if (interaction.isChatInputCommand()) {
      try {
        await command.execute(interaction);
      } catch (err) {
        logger("ERROR", `${err}`);

        await interaction.reply({
          content: "There was an error running that command.",
          ephemeral: true,
        });
      }
    } else if (interaction.isAutocomplete()) {
      try {
        if (!command.autocomplete) return;
        await command.autocomplete(interaction);
      } catch (err) {
        logger("ERROR", `${err}`);
      }
    }
  },
};
