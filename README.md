# Discord Boss Tracker
A discord bot for tracking world and field bosses in Black Desert Online.

Learn more about this project [here!](https://www.jamesmulvaney.co.uk/projects/discord-boss-tracker)

### Features
- Timers bot - displays a schedule for world bosses as well as window timers for field bosses.
- Status bot - takes information about a bosses health from users and returns it as a readable chart.
- Notification bot - pings users when a world boss is about to spawn, or when a field boss spawns.

# Installation

## ⚠️ Disclaimer ⚠️

**This is a personal project. Bot has not been fully battle tested so I wouldn't recommend running it yourself. However, if you want to check it out, the installation steps are below.**

## Prerequisites

* Discord Developer Application. A guide for setting one up can be found [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
* PostgreSQL database
* Google Calendar Service Account JSON file. [Follow this guide](https://developers.google.com/calendar/api/quickstart/nodejs#authorize_credentials_for_a_desktop_application) until you get your JSON credentials file.
    - The calendar should reflect the world boss schedule found [here](https://www.naeu.playblackdesert.com/en-US/Wiki?wikiNo=83) and ideally be in UTC time.
    - Event summary should match the boss's short name in the database. Example: Black Shadow's summary would be `Shadow`.
* Pm2 in order for the `!restart` command to work.

## Setup

1. Download/clone the repository.
2. Run `npm ci` to install dependencies.
3. Move your Google Calendar API JSON file into the bot directory.
4. Make a `.env` file in the project root directory and follow the example in `.env.example`.
5. Run `npx prisma db push` to sync the database.
6. Run `npx prisma db seed` to seed the database with the default bosses and channels.
7. Run `pm2 start index.js` or `npm start` to launch the bot!

# Questions

### What are the default bosses?

These are the bosses that are set up in the database when `npx prisma db seed` is ran.

| name | shortName | isWorldBoss |
| ---- | --------- | ----------- |
| Karanda | Karanda | true |
| Kzarka | Kzarka | true |
| Nouver | Nouver | true |
| Kutum | Kutum | true |
| Garmoth | Garmoth | true |
| Vell | Vell | true |
| Quint | Quint | true |
| Muraka | Muraka | true |
| Offin | Offin | true |
| Bulgasal | Bulgasal | true |
| Uturi | Uturi | true |
| Sangoon | Sangoon | true |
| Golden Pig King | Pig | true |
| Dastard Bheg | Bheg | false |
| Red Nose | RedNose | false |
| Dim Tree | Tree | false |
| Giant Mudster | Mudster | false |
| Katzvariak | Katzvariak | false |
| Black Shadow | Shadow | false |

### How do I schedule a new spawn?

To schedule a new spawn, simply add the boss's shortName to the calendar along with its spawn time. When the time is reached, the bot will generate the boss chart.

---

✨ **Inspired by BDO NA Bosses and IHA EU Discord bots** ✨
