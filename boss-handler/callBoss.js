const {
  freshFieldBossStatus,
  getUberPartner,
  updateStatus,
} = require("../queries/bossQueries");
const { freshWorldBossStatus } = require("../utils/freshWorldBossStatus");
const { sendModLog } = require("../utils/sendModLog");
const { activeBosses } = require("./activeBosses");
const { Boss } = require("./class/Boss");
const { findBossByAlias } = require("./findBossByAlias");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function callBoss(msg, args) {
  const alias = args.join(" ");

  //Find boss
  const { boss, isActive } = await findBossByAlias(alias);

  if (!boss || isActive) return;

  //Get a fresh status
  let freshStatus;
  if (!boss.isWorldBoss) {
    freshStatus = await freshFieldBossStatus();
    updateStatus(boss.id, freshStatus);
  } else {
    freshStatus = freshWorldBossStatus();
    updateStatus(boss.id, freshStatus);
  }

  //Check if uber
  if (boss.isUber) {
    //If original version of the boss is active, change it to the empowered version
    for (const activeBoss of activeBosses) {
      if (activeBoss.bossInfo.id === boss.uberOf) {
        activeBoss.changeToUber(boss, msg.author);

        //Send log to #logs
        sendModLog(
          msg.client,
          msg.channel,
          `${boss.shortName}-Spawned`,
          msg.author,
          msg.content
        );

        return;
      }
    }

    //Allow normal and empowered aliases to be called
    const original = await getUberPartner(boss.uberOf);
    activeBosses.push(
      new Boss(
        {
          ...boss,
          aliases: `${original.aliases}|${boss.aliases}`,
        },
        dayjs().utc().format(),
        freshStatus,
        true,
        msg.author,
        msg.client,
        false,
        false
      )
    );
  } else {
    activeBosses.push(
      new Boss(
        boss,
        dayjs().utc().format(),
        freshStatus,
        true,
        msg.author,
        msg.client,
        false,
        false
      )
    );
  }

  //Send log to #logs
  sendModLog(
    msg.client,
    msg.channel,
    `${boss.shortName}-Spawned`,
    msg.author,
    msg.content
  );
}

module.exports = {
  callBoss,
};
