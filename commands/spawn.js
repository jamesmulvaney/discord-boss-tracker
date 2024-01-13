const { callBoss } = require("../boss-handler/callBoss");

module.exports = {
  name: "spawn",
  description: "Used to call a boss up. Syntax: `!spawn <bossAlias>`",
  guildOnly: true,
  role: [process.env.HELPFUL_ROLE_ID, process.env.MOD_ROLE_ID],
  execute(msg, args) {
    if (msg.channelId === process.env.STATUS_CHANNEL_ID) {
      callBoss(msg, args);
    }
  },
};
