const { prisma } = require("../db");

async function updateStatus(id, status) {
  const boss = await prisma.boss.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return boss;
}

async function updateSpawnTime(id, time) {
  const boss = await prisma.boss.update({
    where: {
      id,
    },
    data: {
      lastSpawn: time,
    },
  });

  return boss;
}

module.exports = {
  updateStatus,
  updateSpawnTime,
};
