const { prisma } = require("../db");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getFreshFieldStatus() {
  console.log("[LOG] Loading fresh field boss status.");

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

// async function getAllChannels() {
//   console.log("[LOG] Loading fresh channel list.");

//   const channels = await prisma.channel.findMany();

//   return channels;
// }

// const allChannels = getAllChannels();

// async function tempFreshFieldStatus() {
//   const channels = await allChannels;

//   const formattedArray = [];

//   channels.forEach((c) => {
//     formattedArray.push({
//       channel: c,
//       currentHealth: "??",
//       previousHealth: "??",
//       updated: dayjs().utc().format(),
//       clear: false,
//     });
//   });

//   return formattedArray;
// }

function getFreshWorldStatus() {
  console.log("[LOG] Loading fresh world boss status.");

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
