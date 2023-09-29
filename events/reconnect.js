const { Events } = require("discord.js");
const { logger } = require("../utils/logger");

module.exports = {
  name: Events.ShardReconnecting,
  once: false,
  execute() {
    logger("LOG", "Reconnecting to Discord...");
  },
};
