const { prisma } = require("../db");
const { logger } = require("../utils/logger");

async function getBossList() {
  logger("LOG", "Loading boss list...");
  const bosses = await prisma.boss.findMany();

  return bosses;
}

module.exports = {
  getBossList,
  staticBossList: getBossList(),
};
