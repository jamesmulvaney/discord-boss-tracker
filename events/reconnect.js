const { Events } = require("discord.js");
const Logger = require("../utils/logger");

module.exports = {
  name: Events.ShardReconnecting,
  once: false,
  execute() {
    Logger.warn("Reconnecting to Discord...");
  },
};
