const { prisma } = require("../db");

async function getUberPartner(uberId) {
  const boss = await prisma.boss.findUnique({
    where: {
      id: uberId,
    },
  });

  return boss;
}

module.exports = {
  getUberPartner,
};
