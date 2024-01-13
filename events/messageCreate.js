const { Events } = require("discord.js");
const { checkMessage } = require("../boss-handler/handleMessages");
const { config } = require("../config");
const Logger = require("../utils/logger");

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

      //Check if user has permission
      if (command.role) {
        let hasPermission = false;

        if (command.role === "mod") {
          config[0].modRoles.forEach((roleId) => {
            if (message.member?.roles.cache.has(roleId)) {
              hasPermission = true;
              return;
            }
          });
        } else {
          command.role.forEach((roleId) => {
            if (message.member?.roles.cache.has(roleId)) {
              hasPermission = true;
              return;
            }
          });
        }

        if (!hasPermission) return;
      }

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
