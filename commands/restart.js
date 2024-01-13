const { WebhookClient } = require("discord.js");
const { timerMessageId } = require("../timers/timersMessage");
const { sendModLog } = require("../utils/sendModLog");
const Logger = require("../utils/logger");

module.exports = {
  name: "restart",
  description: "Restart the bot.",
  guildOnly: true,
  role: "mod",
  async execute(msg) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      await msg.reply({
        content: "Restarting bot, please wait a few seconds...",
      });

      await sendModLog(msg.client, msg.channel, "Restart Bot", msg.author);

      Logger.info(`Bot restarted by ${msg.author.tag}.`);

      process.exit(1);
    }
  },
};
