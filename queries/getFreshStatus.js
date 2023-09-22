const { prisma } = require("../db");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getFreshFieldStatus() {
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

function getFreshWorldStatus() {
  const freshStatus = [
    {
      channel: {
        name: "all",
      },
      currentHealth: "??",
      previousHealth: "??",
      updated: dayjs().utc().format(),
    },
  ];

  return freshStatus;
}

async function setFreshStatus(name, status) {
  try {
    await prisma.boss.update({
      where: {
        name,
      },
      data: {
        status,
      },
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getFreshFieldStatus,
  getFreshWorldStatus,
  setFreshStatus,
  freshFieldStatus: getFreshFieldStatus(),
  freshWorldStatus: getFreshWorldStatus(),
};
