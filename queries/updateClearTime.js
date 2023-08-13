const { prisma } = require("../db");
const { config } = require("../timers/config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function updateClearTime(shortName, windowCooldown, time) {
  const cleared = time.toDate();
  let windowOpen = time.add(windowCooldown, "minutes").toDate();
  let windowClose = time.add(windowCooldown + 420, "minutes").toDate();

  if (config[0].nextMaintenance) {
    if (dayjs(windowOpen).isAfter(dayjs(config[0].nextMaintenance).utc())) {
      windowOpen = dayjs(config[0].nextMaintenance)
        .utc()
        .add(config[0].maintenanceLength + 300, "minutes")
        .toDate();
      windowClose = dayjs(config[0].nextMaintenance)
        .utc()
        .add(config[0].maintenanceLength + 720, "minutes")
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

async function adjustClearTime(shortName, time) {
  const bossToAdjust = await prisma.boss.findFirst({
    where: {
      shortName,
    },
  });

  if (!bossToAdjust) return;

  const cleared = time.toDate();
  const windowOpen = time.add(bossToAdjust.windowCooldown, "minutes").toDate();
  const windowClose = time
    .add(bossToAdjust.windowCooldown + 420, "minutes")
    .toDate();

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

module.exports = {
  updateClearTime,
  adjustClearTime,
};
