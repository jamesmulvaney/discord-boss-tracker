const { Events } = require("discord.js");
const Logger = require("../utils/logger");
const { checkMessage } = require("../boss-handler/handleMessages");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  execute(message) {
    if (message.author.bot) return;

    if (message.content.startsWith("!")) {
      const [commandName, ...args] = message.content
        .trim()
        .substring(1)
        .split(/\s+/);

      const command = message.client.commands.get(commandName);

      if (!command) return;

      try {
        command.execute(message, args);
      } catch (err) {
        Logger.error(err);

        message.reply({
          content: `There was an error running that command.`,
        });
      }

      return;
    }

    if (message.channelId === process.env.STATUS_CHANNEL_ID) {
      checkMessage(message);
    }
  },
};
