const { getBossList } = require("../queries/getBossList");
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
                content: `\`${dayjs()
                  .utc()
                  .format("YYYY-MM-DDTHH:mm:ss")} UTC\` <#${
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

  //Check for boss alias
  let matchedBoss;
  if (activeBosses.length > 1) {
    for (const boss of activeBosses) {
      const aliasRegexp = new RegExp(`${boss.bossInfo.aliases}`);

      if (aliasRegexp.test(message.content)) {
        matchedBoss = boss;
        aliasRegexp.exec(message.content);
        break;
      }
    }
  } else if (activeBosses.length === 1) {
    matchedBoss = activeBosses[0];
  }

  //If more than one boss is active but no alias is provided
  if (!matchedBoss) {
    message
      .reply({
        content:
          "More than one boss is currently active. Please specify which boss.",
      })
      .then((m) => {
        setTimeout(() => m.delete(), 10000);
      });
    return false;
  }

  //Check for channel alias if the boss is a field boss
  let matchedChannel;
  if (!matchedBoss.bossInfo.isWorldBoss) {
    for (const status of matchedBoss.status) {
      const channelRegexp = new RegExp(`${status.channel.aliases}`);
      if (channelRegexp.test(message.content)) {
        if (!status.channel.isArsha) {
          matchedChannel = status.channel.name;
          channelRegexp.exec(message.content);
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
          setTimeout(() => m.delete(), 10000);
        });
      return false;
    }
  }

  //Check for health
  let matchedHealth;
  const aliveRegexp = new RegExp(/(100|[1-9]?[0-9])(?:$|%|hp)/iu);
  const deadRegexp = new RegExp(
    /d(?:d|ed|ead)?$|died|rip|killed|down|clear|cleared/iu
  );
  const despRegexp = new RegExp(/desp?a?w?n?e?d?/);
  const undoRegexp = new RegExp(/undo|revert/);
  const dnsRegexp = new RegExp(/dns/);

  if (aliveRegexp.test(message.content)) {
    matchedHealth = aliveRegexp.exec(message);
    if (
      matchedHealth[0] === "0" ||
      matchedHealth[0] === "0%" ||
      matchedHealth[0] === "0hp"
    ) {
      matchedHealth = ["Dead"];
    }
  } else if (despRegexp.test(message.content)) {
    matchedHealth = ["Desp"];
  } else if (deadRegexp.test(message.content)) {
    matchedHealth = ["Dead"];
  } else if (undoRegexp.test(message.content)) {
    matchedHealth = ["undo"];
  } else if (dnsRegexp.test(message.content)) {
    if (matchedBoss.bossInfo.isWorldBoss) return false;
    matchedHealth = ["DNS"];
  } else {
    //Ingore
    return false;
  }

  console.log(
    `[${dayjs().utc().format("HH:mm:ss")}][LOG] @${
      message.author.tag
    } successful call. Boss: '${matchedBoss.bossInfo.shortName}'${
      matchedChannel ? ` Channel: '${matchedChannel}' ` : " "
    }Health: '${matchedHealth[0]}' Message: '${message.content}'`
  );

  //Set the bosses health, resend the chart, then delete the previous one.
  matchedBoss.setHealth(
    matchedChannel,
    matchedHealth[0].replace("%", ""),
    message
  );
  matchedBoss.statusHandler();
  setTimeout(() => {
    const toDelete = matchedBoss.botMessages.shift();
    const toClear = matchedBoss.refreshTime.shift();
    toDelete.delete();
    clearTimeout(toClear);
  }, 1000);
  return true;
}

module.exports = { checkMessage };
