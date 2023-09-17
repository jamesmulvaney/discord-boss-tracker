const { timerMessageId } = require("../timers/timersMessage");

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
        await timerMessageId
          .shift()
          .delete()
          .catch((err) =>
            console.log(
              `[${dayjs()
                .utc()
                .format("HH:mm:ss")}][ERROR] Failed to delete message`
            )
          );
        process.exit(1);
      }
    }
  },
};
