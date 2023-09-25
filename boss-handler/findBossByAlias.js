const { staticBossList } = require("../queries/bossQueries");
const { activeBosses } = require("./activeBosses");

async function findBossByAlias(alias) {
  const bossList = await staticBossList;

  for (const boss of bossList) {
    const bossRegex = RegExp(`${boss.aliases}`);

    if (bossRegex.test(alias)) {
      let isActive = false;

      for (const activeBoss of activeBosses) {
        if (activeBoss.bossInfo.id === boss.id) {
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
