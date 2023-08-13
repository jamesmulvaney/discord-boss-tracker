const gcalConfig = require("../config/googleCalendarSettings");
const gcalAPI = require("node-google-calendar");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const gcal = new gcalAPI(gcalConfig);
dayjs.extend(utc);

async function fetchCalendar() {
  const options = {
    timeMin: dayjs().utcOffset("-08:00").format(),
    timeMax: dayjs().utcOffset("-08:00").add(7, "days").format(),
    singleEvents: true,
    orderBy: "startTime",
  };
  let calendar = [];

  await gcal.Events.list(gcalConfig.calendarId.primary, options)
    .then((res) => {
      console.log(
        `[${dayjs()
          .utc()
          .format("HH:mm:ss")}][LOG] Fetched Google Calendar Schedule`
      );
      calendar = res;
    })
    .catch((err) => {
      console.error(err);
    });

  return calendar;
}

module.exports = {
  fetchCalendar,
};
