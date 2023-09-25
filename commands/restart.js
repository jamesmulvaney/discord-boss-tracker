const { timerMessageId } = require("../timers/timersMessage");
const { logger } = require("../utils/logger");

module.exports = {
  name: "restart",
  description: "Restart the bot.",
  guildOnly: true,
  async execute(msg) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        await msg.reply({
          content: "Restarting bot, please wait a few seconds...",
        });

        try {
          await timerMessageId.shift().delete();
        } catch (err) {
          logger("ERROR", `Failed to delete message.`);
        }

        logger("LOG", `Bot restarted by ${msg.author.tag}.`);

        process.exit(1);
      }
    }
  },
};
