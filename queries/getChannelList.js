const { prisma } = require("../db");

async function getChannelList() {
  console.log("[LOG] Loading channel list.");
  const channels = await prisma.channel.findMany({ orderBy: { id: "asc" } });

  return channels;
}

module.exports = {
  staticChannelList: getChannelList(),
};
