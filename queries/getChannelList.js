const { prisma } = require("../db");
const Logger = require("../utils/logger");

async function getChannelList() {
  Logger.log(`Loading channel list...`);
  const channels = await prisma.channel.findMany({ orderBy: { id: "asc" } });

  return channels;
}

module.exports = {
  staticChannelList: getChannelList(),
};
