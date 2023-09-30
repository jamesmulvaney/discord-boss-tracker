const { WebhookClient } = require("discord.js");
const { timerMessageId } = require("../timers/timersMessage");
const Logger = require("../utils/logger");

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

        //Delete last timers message
        const timersWebhook = new WebhookClient({
          id: process.env.TIMER_HOOK_ID,
          token: process.env.TIMER_HOOK_TOKEN,
        });

        await timersWebhook
          .deleteMessage(timerMessageId.shift())
          .catch((err) => {
            Logger.error(`Failed to delete message.`);
            Logger.error(`${err}`);
          });

        Logger.info(`Bot restarted by ${msg.author.tag}.`);

        process.exit(1);
      }
    }
  },
};
