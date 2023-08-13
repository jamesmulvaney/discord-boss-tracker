const { prisma } = require("../db");

async function getOldStatus(id) {
  const boss = await prisma.boss.findUnique({
    where: {
      id,
    },
    select: {
      lastSpawn: true,
      status: true,
    },
  });

  return boss;
}

module.exports = {
  getOldStatus,
};
