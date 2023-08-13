# BDO Boss Tracker
A discord bot for tracking world and field bosses in Black Desert Online.

### Features
- Timers bot - displays a schedule for world bosses as well as window timers for field bosses.
- Status bot - takes information about a bosses health from users and returns it as a readable chart.
- Notification bot - pings users when a world boss is about to spawn, or when a field boss spawns.

### Requirements
- Discord bot application
- Google calendar API key
- Postgres database

#### Google Calendar
This bot pulls data from Google Calendar for boss timers. Information about making a service account and getting an API key can be found [here](https://github.com/yuhong90/node-google-calendar/wiki#preparations-needed).

Once created, you can populate the calendar with the boss schedule from the [Black Desert wiki](https://www.naeu.playblackdesert.com/en-US/Wiki?wikiNo=83). **Note that the event title must be equal to the bosses short name in the database.**

### Setup
1. Setup the environment variables using the example.
2. Create a folder in the root directory called 'config' and follow [these steps](https://github.com/yuhong90/node-google-calendar/wiki#preparations-needed), renaming `settings.js` to `googleCalendarSettings.js`.
3. Install the dependencies using `npm install`.
4. Run `npx prisma migrate deploy` to initialize the database.
5. Run `npx prisma db seed` to populate the database with the default bosses and channels.
6. Launch the bot with `npm run bot`.

---

Visit the wiki to learn more about this bot, such as how to use it and how to add more bosses.

✨ Inspired by BDO NA Bosses Discord ✨
