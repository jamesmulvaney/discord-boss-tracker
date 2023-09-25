const { fetchCalendar } = require("./getCalendar");
const { setNextSpawn } = require("../queries/bossQueries");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function parseCalendar() {
  const calendar = await fetchCalendar();
  const completed = [];
  const schedule = [];

  for (const entry of calendar) {
    if (!completed.includes(entry.summary)) {
      const startTime = dayjs(entry.start.dateTime).utc().format();
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
