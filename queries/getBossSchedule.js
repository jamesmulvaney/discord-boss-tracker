const { prisma } = require("../db");

async function getBossSchedule() {
  const schedule = await prisma.boss.findMany({
    orderBy: {
      nextSpawn: {
        sort: "asc",
        nulls: "last",
      },
    },
  });

  return schedule;
}

module.exports = {
  getBossSchedule,
};
