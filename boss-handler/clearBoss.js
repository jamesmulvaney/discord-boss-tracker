const { activeBosses } = require("./activeBosses");
const { sendModLog } = require("../utils/sendModLog");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

function clearBoss(msg, args) {
  const alias = args.join(" ");

  //Loop through the current active bosses to find the user specified boss.
  for (let i = 0; i < activeBosses.length; i++) {
    const bossRegex = new RegExp(`${activeBosses[i].bossInfo.aliases}`, "iu");

    if (bossRegex.test(alias)) {
      //Clear the boss if it is a field boss.
      if (!activeBosses[i].bossInfo.isWorldBoss) {
        const bossName = activeBosses[i].bossInfo.shortName;

        if (activeBosses[i].forceClearTask) {
          activeBosses[i].forceClearTask.stop();
        }

        activeBosses[i].clearBoss("manual");

        if (!activeBosses[i].isHidden) activeBosses[i].deleteLastMessage();

        //Send log to #logs
        sendModLog(msg.client, msg.channel, `${bossName}-Cleared`, msg.author);

        Logger.info(`${bossName} cleared by ${msg.author.tag}`);

        //Remove boss from the array
        activeBosses.splice(i, 1);

        msg.reply({ content: `${bossName} cleared` });
      } else {
        msg.reply({
          content: `Only field bosses can be cleared. For world bosses, call them dead or despawned in <#${process.env.STATUS_CHANNEL_ID}>`,
        });
      }

      break;
    }
  }
}

module.exports = {
  clearBoss,
};
