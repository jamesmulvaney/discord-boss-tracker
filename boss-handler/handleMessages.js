const { getBossList } = require("../queries/getBossList");
const { logger } = require("../utils/logger");
const { activeBosses } = require("./activeBosses");
const { Boss } = require("./class/Boss");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function checkMessage(message) {
  /* 
    Check for revive command and silently restart the boss session.
    Ex: "bheg revive"
  */
  if (
    message.content.includes("revive") &&
    message.member?.roles.cache.has(process.env.MOD_ROLE_ID)
  ) {
    const bossList = await getBossList();

    //Find boss from alias provided by user
    for (const boss of bossList) {
      const bossRegex = RegExp(`${boss.aliases}`);

      if (bossRegex.test(message.content)) {
        let alreadyUp = false;

        //If the boss is already up, ingnore the call
        for (const activeBoss of activeBosses) {
          if (activeBoss.bossInfo.name === boss.name) {
            alreadyUp = true;
            break;
          }
        }

        if (!alreadyUp) {
          //Create boss object with the old health status, but do not send a new notification
          const revivedBoss = new Boss(
            boss,
            boss.lastSpawn,
            boss.status,
            true,
            message.author,
            message.client,
            true,
            true
          );
          activeBosses.push(revivedBoss);

          //Send log to #logs
          message.client.channels
            .fetch(process.env.LOG_CHANNEL_ID)
            .then((c) => {
              c.send({
                content: `\`${dayjs().utc().toISOString()}\` <#${
                  process.env.STATUS_CHANNEL_ID
                }> \`${boss.shortName}-Revived\` <@${message.author.id}> \`${
                  message.content
                }\``,
              });
            });
        }

        break;
      }
    }

    return;
  }

  //Ignore calls containing these phrases
  const ignoreRegexp = new RegExp(
    /\?|:|!|#|not|who|whoever|which|said|was|lied|someone|some|false|called|call|update|updates|isn'?t|root|leg|shield|stronger|shld|>|\p{Extended_Pictographic}/iu
  );
  if (ignoreRegexp.test(message.content) || activeBosses.length === 0) return;

  let fullMessage = message.content;

  //Check for boss alias
  let matchedBoss;
  for (const boss of activeBosses) {
    const aliasRegexp = new RegExp(`${boss.bossInfo.aliases}`);

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
              .catch((err) => logger("ERROR", `Failed to delete message.`)),
          10000
        );
      });
    return;
  }

  //Check for channel alias if the boss is a field boss
  let matchedChannel;
  if (!matchedBoss.bossInfo.isWorldBoss) {
    for (const status of matchedBoss.status) {
      const channelRegexp = new RegExp(`${status.channel.aliases}`);
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
                .catch((err) => logger("ERROR", `Failed to delete message.`)),
            10000
          );
        });
      return false;
    }
  }

  //Check for health
  let matchedHealth;
  const aliveRegexp = new RegExp(/\b(100|[1-9]?[0-9])(?:$|%|hp)/iu);
  const deadRegexp = new RegExp(
    /d(?:d|ed|ead)?$|died|rip|killed|down|clear|cleared/iu
  );
  const despRegexp = new RegExp(/desp?a?w?n?e?d?/);
  const undoRegexp = new RegExp(/undo|revert/);
  const dnsRegexp = new RegExp(/dns/);

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
