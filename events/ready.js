const { Events } = require("discord.js");
const { config } = require("../config");
const { getConfig } = require("../queries/getConfig");
const {
  scheduleNotification,
} = require("../boss-schedule/scheduleNotification");
const { timersMessage } = require("../timers/timersMessage");
const Logger = require("../utils/logger");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    Logger.log("BDO Boss Tracker started successfully!");
    Logger.log(`Logged in as ${client.user.tag}`);

    config.push(await getConfig());
    await scheduleNotification(client);
    await timersMessage(client);

    client.channels.fetch(process.env.MOD_CHANNEL_ID).then((channel) => {
      channel.send({ content: "Bot online and ready!" });
    });
  },
};
