const { prisma } = require("../db");
const { setPostMaintWindow } = require("./bossQueries");

async function updateIsMaintenance(isMaintenance) {
  let config;

  if (isMaintenance) {
    config = await prisma.config.update({
      where: { id: 1 },
      data: {
        isMaintenance,
      },
    });

    await setPostMaintWindow(config.maintEnd);
  } else {
    config = await prisma.config.update({
      where: { id: 1 },
      data: {
        isMaintenance,
        maintStart: null,
        maintEnd: null,
      },
    });
  }

  return config;
}

async function updateMaintenanceTime(maintStart, maintEnd) {
  const config = await prisma.config.update({
    where: { id: 1 },
    data: {
      maintStart,
      maintEnd,
    },
  });

  return config;
}

module.exports = {
  updateIsMaintenance,
  updateMaintenanceTime,
};
