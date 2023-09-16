const { prisma } = require("../db");

async function updateIsMaintenance(isMaintenance, maintStart, maintEnd) {
  let config;

  if (maintEnd) {
    config = await prisma.config.update({
      where: { id: 1 },
      data: {
        isMaintenance,
      },
    });

    //Update field boss windows (5 hours from maint end)
    const windowStart = maintEnd.add(5, "hours").toDate();
    const windowEnd = maintEnd.add(12, "hours").toDate();

    await prisma.boss.updateMany({
      where: {
        AND: [
          {
            isWorldBoss: {
              equals: false,
            },
          },
          {
            shortName: {
              not: "Shadow",
            },
          },
        ],
      },
      data: {
        windowStart,
        windowEnd,
      },
    });
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
