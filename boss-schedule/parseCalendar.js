const { fetchCalendar } = require("./getCalendar");
const { setNextSpawn, clearSpawnTime } = require("../queries/bossQueries");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function parseCalendar() {
  const calendar = await fetchCalendar();
  const completed = [];
  const schedule = [];

  //Clear next spawn times incase a boss doesn't have a next spawn
  await clearSpawnTime();

  for (const entry of calendar) {
    if (!completed.includes(entry.summary)) {
      const startTime = dayjs(entry.start.dateTime).format();
      const updatedBoss = await setNextSpawn(entry.summary, startTime);

      schedule.push(updatedBoss);
      completed.push(entry.summary);
    }
  }

  return schedule;
}

module.exports = {
  parseCalendar,
};
