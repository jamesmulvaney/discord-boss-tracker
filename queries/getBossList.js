const { prisma } = require("../db");

async function getBossList() {
  console.log("[LOG] Loading boss list.");
  const bosses = await prisma.boss.findMany();

  return bosses;
}

module.exports = {
  getBossList,
  staticBossList: getBossList(),
};
