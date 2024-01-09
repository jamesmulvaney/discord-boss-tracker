const { getBossList } = require("../queries/bossQueries");
const { activeBosses } = require("./activeBosses");

async function findBossByAlias(alias) {
  const bossList = await getBossList();

  for (const boss of bossList) {
    const bossRegex = new RegExp(`${boss.aliases}`, "iu");

    if (bossRegex.test(alias)) {
      let isActive = false;

      for (const activeBoss of activeBosses) {
        if (
          activeBoss.bossInfo.id === boss.id ||
          (!boss.uberOf && activeBoss.bossInfo.id === boss.uberOf)
        ) {
          isActive = true;
          break;
        }
      }

      return { boss, isActive };
    }
  }

  return { boss: false, isActive: false };
}

module.exports = {
  findBossByAlias,
};
