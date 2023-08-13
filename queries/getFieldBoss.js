const { prisma } = require("../db");

async function getFieldBossList() {
  const bosses = await prisma.boss.findMany({
    where: {
      isWorldBoss: false,
    },
    orderBy: {
      windowStart: { sort: "asc", nulls: "last" },
    },
  });

  return bosses;
}

module.exports = {
  getFieldBossList,
};
