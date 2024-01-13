const { clearBoss } = require("../boss-handler/clearBoss");

module.exports = {
  name: "clear",
  description: "Used to clear an active boss. Syntax: `!clear <bossAlias>`",
  guildOnly: true,
  role: [process.env.MOD_ROLE_ID],
  execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      clearBoss(msg, args);
    }
  },
};
