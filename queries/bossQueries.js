const { prisma } = require("../db");
const { config } = require("../config");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

/*
  WORLD BOSS
*/

//Queries

//Get empowered version of a world boss
async function getUberPartner(uberId) {
  const boss = await prisma.boss.findUnique({
    where: {
      id: uberId,
    },
  });

  return boss;
}

/*
  FIELD BOSS
*/

//Queries

//Get a list of field bosses sorted by window
async function getFieldBossList() {
  const bosses = await prisma.boss.findMany({
    where: {
      isWorldBoss: false,
    },
    orderBy: [
      {
        windowStart: "asc",
      },
      {
        shortName: "asc",
      },
    ],
  });

  return bosses;
}

//Get a fresh field boss status object
async function freshFieldBossStatus() {
  const channels = await prisma.channel.findMany({ orderBy: { id: "asc" } });
  const formattedArray = [];

  channels.forEach((c) => {
    const statusObj = {
      channel: c,
      currentHealth: "??",
      previousHealth: "??",
      updated: dayjs().utc().format(),
      clear: false,
    };

    formattedArray.push(statusObj);
  });

  return formattedArray;
}

//Mutations

//Update a boss's window based on clear time
async function setWindowTimes(shortName, windowCooldown, cleared) {
  const clearTime = cleared.toDate();
  let windowStart = cleared.add(windowCooldown, "minutes").toDate();
  let windowEnd = cleared.add(windowCooldown + 420, "minutes").toDate();

  if (config[0].maintStart) {
    if (dayjs(windowStart).isAfter(dayjs(config[0].maintStart).utc())) {
      windowStart = dayjs(config[0].maintEnd)
        .utc()
        .add(300, "minutes")
        .toDate();
      windowEnd = dayjs(config[0].maintEnd).utc().add(720, "minutes").toDate();
    }
  }

  const boss = await prisma.boss.update({
    where: {
      shortName,
    },
    data: {
      clearTime,
      windowStart,
      windowEnd,
    },
  });

  return boss;
}

//Update all boss windows based on maintenance end time
async function setPostMaintWindow(maintEnd) {
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

/*
  BOTH
*/

//Queries

//Get a list of all bosses
async function getBossList() {
  const bosses = await prisma.boss.findMany();

  return bosses;
}

//Get boss spawn time schedule
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

//Mutations

//Update boss status
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

//Set the next time the boss is scheduled to spawn.
async function setNextSpawn(name, time) {
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

//Set last spawn time
async function setLastSpawn(id, time) {
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

//Clear spawn times
async function clearSpawnTime() {
  await prisma.boss.updateMany({
    data: {
      nextSpawn: null,
    },
  });
}

//Set a boss's note
async function setBossNote(id, note) {
  await prisma.boss.update({
    where: {
      id,
    },
    data: {
      info: note,
    },
  });
}

module.exports = {
  getUberPartner,
  getFieldBossList,
  freshFieldBossStatus,
  setWindowTimes,
  setPostMaintWindow,
  getBossSchedule,
  updateStatus,
  setNextSpawn,
  setLastSpawn,
  clearSpawnTime,
  setBossNote,
  getBossList,
};
