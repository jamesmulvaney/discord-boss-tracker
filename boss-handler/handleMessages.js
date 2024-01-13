const { activeBosses } = require("./activeBosses");
const { Boss } = require("./class/Boss");
const { findBossByAlias } = require("./findBossByAlias");
const { sendModLog } = require("../utils/sendModLog");
const { callBoss } = require("./callBoss");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { config } = require("../config");
dayjs.extend(utc);

async function checkMessage(message) {
  /*
    Check for spawn command and spawn the boss.
    Ex: "spawn bheg"
  */
  if (message.content.startsWith("spawn")) {
    const allowedRoles = [process.env.HELPFUL_ROLE_ID, ...config[0].modRoles];
    let hasPermission = false;

    allowedRoles.forEach((roleId) => {
      if (message.member?.roles.cache.has(roleId)) {
        hasPermission = true;
        return;
      }
    });

    if (hasPermission) {
      const [_, ...alias] = message.content.trim().split(/\s+/);
      callBoss(message, alias);

      return;
    }
  }

  /* 
    Check for revive command and silently restart the boss session.
    Ex: "bheg revive"
  */
  if (
    message.content.includes("revive") &&
    message.member?.roles.cache.has(process.env.MOD_ROLE_ID)
  ) {
    //Find boss
    const { boss, isActive } = await findBossByAlias(message.content);

    if (!boss || isActive) return;

    //Revive boss
    activeBosses.push(
      new Boss(
        boss,
        boss.lastSpawn,
        boss.status,
        true,
        message.author,
        message.client,
        true,
        true
      )
    );

    //Send log to #logs
    sendModLog(
      message.client,
      message.channel,
      `${boss.shortName}-Revived`,
      message.author,
      message.content
    );

    return;
  }

  //Ignore calls containing these phrases
  const ignoreRegexp =
    /\?|:|!|#|not|who|whoever|which|said|was|lied|someone|some|false|called|call|update|updates|isn'?t|root|leg|shield|stronger|shld|>|\p{Extended_Pictographic}/iu;
  if (ignoreRegexp.test(message.content) || activeBosses.length === 0) return;

  let fullMessage = message.content;

  //Check for boss alias
  let matchedBoss;
  for (const boss of activeBosses) {
    const aliasRegexp = new RegExp(`${boss.bossInfo.aliases}`, "iu");

    if (aliasRegexp.test(fullMessage)) {
      matchedBoss = boss;

      //Remove boss from string
      fullMessage = fullMessage
        .replace(aliasRegexp.exec(fullMessage)[0], "")
        .trim();

      break;
    }
  }

  //If there's no alias and the only active boss is a field boss, no need for alias.
  if (
    !matchedBoss &&
    activeBosses.length === 1 &&
    !activeBosses[0].bossInfo.isWorldBoss
  )
    matchedBoss = activeBosses[0];

  //If more than one boss is active but no alias is provided
  if (!matchedBoss) {
    if (activeBosses[0].bossInfo.isWorldBoss) return;

    message
      .reply({
        content:
          "More than one boss is currently active. Please specify which boss.",
      })
      .then((m) => {
        setTimeout(
          () =>
            m
              .delete()
              .catch((err) => Logger.error(`Failed to delete message.`)),
          10000
        );
      });
    return;
  }

  //Check for channel alias if the boss is a field boss
  let matchedChannel;
  if (!matchedBoss.bossInfo.isWorldBoss) {
    for (const status of matchedBoss.status) {
      const channelRegexp = new RegExp(`${status.channel.aliases}`, "iu");
      if (channelRegexp.test(fullMessage)) {
        if (!status.channel.isArsha) {
          matchedChannel = status.channel.name;

          //Remove channel from string
          fullMessage = fullMessage
            .replace(channelRegexp.exec(fullMessage)[0], "")
            .trim();

          break;
        }

        break;
      }
    }

    //Remind user to specify a channel when calling field boss status
    if (!matchedChannel) {
      message
        .reply({
          content:
            "Field bosses spawn on multiple channels. Please specify which channel.",
        })
        .then((m) => {
          setTimeout(
            () =>
              m
                .delete()
                .catch((err) => Logger.error(`Failed to delete message.`)),
            10000
          );
        });
      return false;
    }
  }

  //Check for health
  let matchedHealth;
  const aliveRegexp = /\b(100|[1-9]?[0-9])(?:$|%)/iu;
  const deadRegexp = /d(?:d|ed|ead)?$|died|rip|killed|down|clear|cleared/iu;
  const despRegexp = /desp?a?w?n?e?d?/;
  const undoRegexp = /undo|revert/;
  const dnsRegexp = /dns/;

  if (aliveRegexp.test(fullMessage)) {
    matchedHealth = aliveRegexp.exec(message);
    if (
      matchedHealth[0] === "0" ||
      matchedHealth[0] === "0%" ||
      matchedHealth[0] === "0hp"
    ) {
      matchedHealth = ["Dead"];
    }
  } else if (despRegexp.test(fullMessage)) {
    matchedHealth = ["Desp"];
  } else if (deadRegexp.test(fullMessage)) {
    matchedHealth = ["Dead"];
  } else if (undoRegexp.test(fullMessage)) {
    matchedHealth = ["undo"];
  } else if (dnsRegexp.test(fullMessage)) {
    if (matchedBoss.bossInfo.isWorldBoss) return false;
    matchedHealth = ["DNS"];
  } else {
    //Ingore
    return false;
  }

  //Set the bosses health, resend the chart, then delete the previous one.
  matchedBoss.setHealth(
    matchedChannel,
    matchedHealth[0].replace("%", ""),
    message
  );
  return true;
}

module.exports = { checkMessage };
