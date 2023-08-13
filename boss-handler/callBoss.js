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
  for (let b of bossList) {
    const bossRegex = RegExp(`${b.aliases}`);

    //Test if alias provided by user matches any of the bosses alias
    if (bossRegex.test(alias)) {
      let isActive = false;

      //Check if boss is already active
      activeBosses.forEach((ab) => {
        if (ab.id === b.id) {
          isActive = true;
          return;
        }
      });

      if (!isActive) {
        //Fresh status array
        let freshStatus;
        if (!b.isWorldBoss) {
          freshStatus = await getFreshFieldStatus();
          setFreshStatus(b.name, freshStatus);
        } else {
          freshStatus = getFreshWorldStatus();
          setFreshStatus(b.name, freshStatus);
        }

        let newBoss;

        //Check if uber
        if (b.isUber) {
          //Check if original is active
          let originalActive = false;
          activeBosses.forEach((ab) => {
            if (ab.id === b.uberOf) {
              ab.changeToUber(b, msg.author);
              originalActive = true;
            }
          });

          if (originalActive) {
            return;
          }

          const original = await getUberPartner(b.uberOf);

          newBoss = new Boss(
            original.id,
            b.name,
            b.shortName,
            `${original.aliases}|${b.aliases}`,
            b.info,
            b.avatar,
            dayjs().utc().format(),
            b.isWorldBoss,
            freshStatus,
            true,
            msg.author,
            b.forceDespawnTime,
            b.forceClearTime,
            b.windowCooldown,
            msg.client,
            false,
            false
          );
        } else {
          newBoss = new Boss(
            b.id,
            b.name,
            b.shortName,
            b.aliases,
            b.info,
            b.avatar,
            dayjs().utc().format(),
            b.isWorldBoss,
            freshStatus,
            true,
            msg.author,
            b.forceDespawnTime,
            b.forceClearTime,
            b.windowCooldown,
            msg.client,
            false,
            false
          );
        }

        activeBosses.push(newBoss);
        return;
      }
    }
  }
}

module.exports = {
  callBoss,
};
