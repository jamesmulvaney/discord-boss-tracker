const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { prisma } = require("../db");
dayjs.extend(utc);

async function updateNextSpawn(name, time) {
  console.log(
    `[${dayjs()
      .utc()
      .format("HH:mm:ss")}][LOG] Updating spawn time for ${name} to ${time}`
  );

  const boss = await prisma.boss.update({
    where: {
      shortName: name,
    },
    data: {
      nextSpawn: time,
    },
  });

  return boss;
}

module.exports = {
  updateNextSpawn,
};
