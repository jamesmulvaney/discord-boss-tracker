const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { staticBossList } = require("../queries/getBossList");
const {
  setFreshStatus,
  getFreshWorldStatus,
  getFreshFieldStatus,
} = require("../queries/getFreshStatus");
const { getUberPartner } = require("../queries/getUberPartner");
const { activeBosses } = require("./activeBosses");
const { Boss } = require("./class/Boss");
dayjs.extend(utc);

async function callBoss(msg, args) {
  const alias = args.join(" ");
  const bossList = await staticBossList;

  //Loop through bosses
  for (let boss of bossList) {
    const bossRegex = RegExp(`${boss.aliases}`);

    //Test if alias provided by user matches any of the bosses alias
    if (bossRegex.test(alias)) {
      let isActive = false;

      //Check if boss is already active
      for (let activeBoss of activeBosses) {
        if (activeBoss.id === boss.id) {
          isActive = true;
          break;
        }
      }

      if (!isActive) {
        //Fresh status array
        let freshStatus;
        if (!boss.isWorldBoss) {
          freshStatus = await getFreshFieldStatus();
          setFreshStatus(boss.name, freshStatus);
        } else {
          freshStatus = getFreshWorldStatus();
          setFreshStatus(boss.name, freshStatus);
        }

        let newBoss;

        //Check if uber
        if (boss.isUber) {
          //Check if original is active
          for (let activeBoss of activeBosses) {
            if (activeBoss.id === boss.uberOf) {
              activeBoss.changeToUber(boss, msg.author);
              originalActive = true;
              break;
            }
          }

          if (originalActive) {
            return;
          }

          const original = await getUberPartner(boss.uberOf);
          newBoss = new Boss(
            {
              id: original.id,
              aliases: `${original.aliases}|${boss.aliases}`,
              ...boss,
            },
            dayjs().utc().format(),
            freshStatus,
            true,
            msg.author,
            msg.client,
            false,
            false
          );
        } else {
          newBoss = new Boss(
            boss,
            dayjs().utc().format(),
            freshStatus,
            true,
            msg.author,
            msg.client,
            false,
            false
          );
        }

        activeBosses.push(newBoss);

        //Send log to #logs
        msg.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) => {
          c.send({
            content: `\`${dayjs()
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss")} UTC\` <#${
              process.env.STATUS_CHANNEL_ID
            }> \`${boss.shortName}-Spawned\` <@${msg.author.id}> \`${
              msg.content
            }\``,
          });
        });

        return;
      }
    }

    console.log(`[TEST] ${boss.name}`);
  }
}

module.exports = {
  callBoss,
};
