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
    /* 
      A '/' in the event summary can spawn multiple bosses per event.
      Ex: 'Sangoon/Garmoth' = Sangoon and Garmoth will spawn at the same time
    */
    const bossNames = entry.summary.split("/");
    const startTime = dayjs(entry.start.dateTime).format();

    for (const name of bossNames) {
      if (!completed.includes(name)) {
        schedule.push(await setNextSpawn(name, startTime));
        completed.push(name);
      }
    }
  }

  return schedule;
}

module.exports = {
  parseCalendar,
};
