const { prisma } = require("../db");
const { config } = require("../timers/config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function updateClearTime(shortName, windowCooldown, time) {
  const cleared = time.toDate();
  let windowOpen = time.add(windowCooldown, "minutes").toDate();
  let windowClose = time.add(windowCooldown + 420, "minutes").toDate();

  if (config[0].maintStart) {
    if (dayjs(windowOpen).isAfter(dayjs(config[0].maintStart).utc())) {
      windowOpen = dayjs(config[0].maintEnd).utc().add(300, "minutes").toDate();
      windowClose = dayjs(config[0].maintEnd)
        .utc()
        .add(720, "minutes")
        .toDate();
    }
  }

  const boss = await prisma.boss.update({
    where: {
      shortName,
    },
    data: {
      clearTime: cleared,
      windowStart: windowOpen,
      windowEnd: windowClose,
    },
  });

  return boss;
}

async function maintenanceAdjustment(maintEnd) {
  const endTime = dayjs(maintEnd).utc();
  const windowStart = endTime.add(5, "hours").toDate();
  const windowEnd = endTime.add(12, "hours").toDate();

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
}

module.exports = {
  updateClearTime,
  maintenanceAdjustment,
};
