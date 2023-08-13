const { prisma } = require("../db");

async function getConfig() {
  const config = await prisma.config.findUnique({
    where: {
      id: 1,
    },
  });

  return config;
}

module.exports = {
  getConfig,
};
