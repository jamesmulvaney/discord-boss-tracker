const { prisma } = require("../db");
const { logger } = require("../utils/logger");

async function getChannelList() {
  logger("LOG", `Loading channel list...`);
  const channels = await prisma.channel.findMany({ orderBy: { id: "asc" } });

  return channels;
}

module.exports = {
  staticChannelList: getChannelList(),
};
