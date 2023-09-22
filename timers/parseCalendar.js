const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { updateNextSpawn } = require("../queries/updateNextSpawn");
const { fetchCalendar } = require("./getCalendar");
dayjs.extend(utc);

async function parseCalendar() {
  const calendar = await fetchCalendar();
  const completed = [];
  const schedule = [];

  for (const entry of calendar) {
    if (!completed.includes(entry.summary)) {
      const startTime = dayjs(entry.start.dateTime).utc().format();
      const updatedBoss = await updateNextSpawn(entry.summary, startTime);

      schedule.push(updatedBoss);
      completed.push(entry.summary);
    }
  }

  return schedule;
}

module.exports = {
  parseCalendar,
};
