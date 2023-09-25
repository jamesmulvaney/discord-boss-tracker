const { prisma } = require("../db");
const { maintenanceAdjustment } = require("./updateClearTime");

async function updateIsMaintenance(isMaintenance) {
  let config;

  if (isMaintenance) {
    config = await prisma.config.update({
      where: { id: 1 },
      data: {
        isMaintenance,
      },
    });

    await maintenanceAdjustment(config.maintEnd);
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

async function updateisSeason(isSeason) {
  const config = await prisma.config.update({
    where: { id: 1 },
    data: {
      isSeason,
    },
  });

  return config;
}

module.exports = {
  updateIsMaintenance,
  updateMaintenanceTime,
  updateisSeason,
};
