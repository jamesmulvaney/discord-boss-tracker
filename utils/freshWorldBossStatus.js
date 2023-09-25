const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

function freshWorldBossStatus() {
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

module.exports = {
  freshWorldBossStatus,
};
