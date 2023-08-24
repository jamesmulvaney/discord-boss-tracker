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
const { config } = require("./config");
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
  const reminderAt =
    nextBoss[0].shortName === "Vell"
      ? spawnsAt
      : spawnsAt.subtract(reminderTime, "minutes");

  //Schedule a reminder in boss-notifications
  if (!dayjs().utc().isAfter(reminderAt)) {
    for (const boss of nextBoss) {
      console.log(
        `[LOG] Scheduled reminder for ${boss.shortName} at ${reminderAt.format(
          "YYYY/MM/DD HH:mm:ss"
        )} UTC`
      );

      //Do not spawn boss when game is under maintenance
      if (
        !config[0].nextMaintenance ||
        !spawnsAt.isBefore(
          dayjs(config[0].nextMaintenance)
            .utc()
            .add(config[0].maintenanceLength, "minutes")
        )
      ) {
        //Cron for reminder
        cron.schedule(
          `${reminderAt.second()} ${reminderAt.minute()} ${reminderAt.hour()} ${reminderAt.date()} ${
            reminderAt.month() + 1
          } *`,
          async () => {
            const notifHook = await client.fetchWebhook(
              process.env.NOTIF_HOOK_ID,
              process.env.NOTIF_HOOK_TOKEN
            );

            notifHook.send({
              content: `${
                boss.shortName
              } spawns in ~${reminderTime} minutes. Status in <#${
                process.env.STATUS_CHANNEL_ID
              }> @everyone \`${dayjs()
                .utc()
                .format("YYYY/MM/DD HH:mm:ss")} UTC\``,
              username: `${boss.name}`,
              avatarURL: boss.avatar,
            });

            console.log(
              `[LOG] Reminder for ${boss.name} sent at ${reminderAt.format(
                "YYYY/MM/DD HH:mm:ss"
              )} UTC`
            );
          },
          {
            timezone: "Etc/UTC",
          }
        );

        //Cron for spawn
        cron.schedule(
          `${spawnsAt.second()} ${spawnsAt.minute()} ${spawnsAt.hour()} ${spawnsAt.date()} ${
            spawnsAt.month() + 1
          } *`,
          async () => {
            let freshStatus;
            if (!boss.isWorldBoss) {
              freshStatus = await getFreshFieldStatus();
              setFreshStatus(boss.name, freshStatus);
            } else {
              freshStatus = getFreshWorldStatus();
              setFreshStatus(boss.name, freshStatus);
            }
            const newBoss = new Boss(
              boss,
              dayjs().utc().format(),
              freshStatus,
              true,
              false,
              client,
              true,
              false
            );
            activeBosses.push(newBoss);
          },
          {
            timezone: "Etc/UTC",
          }
        );
      }
    }
  }

  //Cron for reschedule
  cron.schedule(
    `${spawnsAt.second()} ${
      spawnsAt.minute() + 1
    } ${spawnsAt.hour()} ${spawnsAt.date()} ${spawnsAt.month() + 1} *`,
    () => {
      scheduleNotification(client);
    },
    {
      timezone: "Etc/UTC",
    }
  );
}
module.exports = { scheduleNotification };
