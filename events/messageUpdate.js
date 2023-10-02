const { Events } = require("discord.js");
const { checkMessage } = require("../boss-handler/handleMessages");

module.exports = {
  name: Events.MessageUpdate,
  once: false,
  execute(_oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    if (newMessage.channelId === process.env.STATUS_CHANNEL_ID) {
      checkMessage(newMessage);
    }
  },
};
