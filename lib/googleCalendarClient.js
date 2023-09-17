const calendar = require("@googleapis/calendar");

async function getCalendarClient() {
  const auth = new calendar.auth.GoogleAuth({
    keyFilename: process.env.GOOGLE_CALENDAR_KEY_PATH,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });

  const authClient = await auth.getClient();

  const calClient = calendar.calendar({
    version: "v3",
    auth: authClient,
  });

  return calClient;
}

module.exports.getCalendarClient = getCalendarClient();
