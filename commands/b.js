const { callBoss } = require("../boss-handler/callBoss");

module.exports = {
  name: "b",
  description: "Used to call a boss up. Syntax: `!b <bossAlias>`",
  guildOnly: true,
  execute(msg, args) {
    if (msg.channelId === process.env.STATUS_CHANNEL_ID) {
      if (
        msg.member?.roles.cache.has(process.env.HELPFUL_ROLE_ID) ||
        msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)
      ) {
        callBoss(msg, args);
      }
    }
  },
};
