const { getBossSchedule } = require("../queries/getBossSchedule");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const cron = require("node-cron");
const { parseCalendar } = require("./parseCalendar");
const {
  getFreshFieldStatus,
  setFreshStatus,
  getFreshWorldStatus,
} = require("../queries/getFreshStatus");
const { activeBosses } = require("../boss-handler/activeBosses");
const { Boss } = require("../boss-handler/class/Boss");
dayjs.extend(utc);

async function scheduleNotification(client) {
  const schedule = await parseCalendar();
  const nextBoss = [];
  const reminderTime = 5;

  //Check for double spawn
  if (dayjs(schedule[0].nextSpawn).isSame(dayjs(schedule[1].nextSpawn))) {
    nextBoss.push(schedule[0], schedule[1]);
  } else {
    nextBoss.push(schedule[0]);
  }

  const spawnsAt = dayjs(nextBoss[0].nextSpawn).utc();
  const reminderAt = spawnsAt.subtract(reminderTime, "minutes");

  //Schedule a reminder in boss-notifications
  if (!dayjs().utc().isAfter(reminderAt)) {
    nextBoss.forEach((b) => {
      console.log(
        `[LOG] Scheduled reminder for ${b.shortName} at ${reminderAt.format(
          "YYYY/MM/DD HH:mm:ss"
        )} UTC`
      );
    });

    cron.schedule(
      `${reminderAt.second()} ${reminderAt.minute()} ${reminderAt.hour()} ${reminderAt.date()} ${
        reminderAt.month() + 1
      } *`,
      async () => {
        const notifHook = await client.fetchWebhook(
          process.env.NOTIF_HOOK_ID,
          process.env.NOTIF_HOOK_TOKEN
        );

        nextBoss.forEach(async (b) => {
          await notifHook.send({
            content: `${
              b.shortName
            } spawns in ~${reminderTime} minutes. Status in <#${
              process.env.STATUS_CHANNEL_ID
            }> @everyone \`${dayjs()
              .utc()
              .format("YYYY/MM/DD HH:mm:ss")} UTC\``,
            username: `${b.name}`,
            avatarURL: b.avatar,
          });

          console.log(
            `[LOG] Reminder for ${b.name} sent at ${reminderAt.format(
              "YYYY/MM/DD HH:mm:ss"
            )} UTC`
          );
        });
      },
      {
        timezone: "Etc/UTC",
      }
    );
  }

  //Spawn the boss in the bot
  if (!dayjs().utc().isAfter(spawnsAt)) {
    cron.schedule(
      `${spawnsAt.second()} ${spawnsAt.minute()} ${spawnsAt.hour()} ${spawnsAt.date()} ${
        spawnsAt.month() + 1
      } *`,
      async () => {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const botAuthor = await guild.members.fetch(process.env.BOT_AUTHOR_ID);
        nextBoss.forEach(async (b) => {
          let freshStatus;
          if (!b.isWorldBoss) {
            freshStatus = await getFreshFieldStatus();
            setFreshStatus(b.name, freshStatus);
          } else {
            freshStatus = getFreshWorldStatus();
            setFreshStatus(b.name, freshStatus);
          }
          const newBoss = new Boss(
            b.id,
            b.name,
            b.shortName,
            b.aliases,
            b.info,
            b.avatar,
            dayjs().utc().format(),
            b.isWorldBoss,
            freshStatus,
            true,
            botAuthor,
            b.forceDespawnTime,
            b.forceClearTime,
            b.windowCooldown,
            client,
            true,
            false
          );
          activeBosses.push(newBoss);
        });

        setTimeout(async () => {
          scheduleNotification(client);
        }, 60000);
      },
      {
        timezone: "Etc/UTC",
      }
    );
  }
}

module.exports = { scheduleNotification };
