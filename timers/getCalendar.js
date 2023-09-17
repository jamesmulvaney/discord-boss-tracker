const { getCalendarClient } = require("../lib/googleCalendarClient");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function fetchCalendar() {
  const calClient = await getCalendarClient;
  let calendarRes = [];

  await calClient.events
    .list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: dayjs().utcOffset("-08:00").toISOString(),
      timeMax: dayjs().utcOffset("-08:00").add(7, "days").toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })
    .then((res) => {
      console.log(
        `[${dayjs()
          .utc()
          .format("HH:mm:ss")}][LOG] Fetched Google Calendar Schedule`
      );

      calendarRes = res.data.items;
    })
    .catch((err) => {
      console.error(err);
    });

  return calendarRes;
}

module.exports = {
  fetchCalendar,
};
