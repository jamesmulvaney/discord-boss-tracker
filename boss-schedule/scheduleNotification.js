const { parseCalendar } = require("./parseCalendar");
const { activeBosses } = require("../boss-handler/activeBosses");
const { Boss } = require("../boss-handler/class/Boss");
const { config } = require("../config");
const Logger = require("../utils/logger");
const { freshWorldBossStatus } = require("../utils/freshWorldBossStatus");
const {
  freshFieldBossStatus,
  updateStatus,
} = require("../queries/bossQueries");
const { WebhookClient } = require("discord.js");
const cron = require("node-cron");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function scheduleNotification(client) {
  const schedule = await parseCalendar();
  const nextBoss = [];
  const reminderTime = 5;

  if (schedule.length === 0) {
    Logger.log("No bosses found in calendar.");

    //Try again in 10mins
    const retryIn = dayjs().utc().add(10, "minutes");
    cron.schedule(
      `${retryIn.second()} ${retryIn.minute()} ${retryIn.hour()} ${retryIn.date()} ${
        retryIn.month() + 1
      } *`,
      () => {
        scheduleNotification(client);
      },
      {
        timezone: "Etc/UTC",
      }
    );

    return;
  }

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
      Logger.log(
        `Scheduled reminder for ${
          boss.shortName
        } at ${reminderAt.toISOString()}.`
      );

      //Do not spawn boss when game is under maintenance
      if (
        !config[0].isMaintenance ||
        (config[0].isMaintenance &&
          !spawnsAt.isBefore(dayjs(config[0].maintEnd).utc()))
      ) {
        //Cron for reminder
        cron.schedule(
          `${reminderAt.second()} ${reminderAt.minute()} ${reminderAt.hour()} ${reminderAt.date()} ${
            reminderAt.month() + 1
          } *`,
          async () => {
            const notificationWebhook = new WebhookClient({
              id: process.env.NOTIF_HOOK_ID,
              token: process.env.NOTIF_HOOK_TOKEN,
            });

            notificationWebhook.send({
              content: `${boss.shortName} spawns in ~${
                boss.shortName === "Vell" ? "30" : reminderTime
              } minutes. <#${process.env.STATUS_CHANNEL_ID}> ${
                boss.roleId && `<@&${boss.roleId}> `
              }\`${dayjs().utc().format("YYYY/MM/DD HH:mm:ss")} UTC\``,
              username: `${boss.name}`,
              avatarURL: boss.avatar,
            });

            Logger.log(`Reminder sent for ${boss.name}.`);
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
              freshStatus = await freshFieldBossStatus();
              updateStatus(boss.id, freshStatus);
            } else {
              freshStatus = freshWorldBossStatus();
              updateStatus(boss.id, freshStatus);
            }

            activeBosses.push(
              new Boss(
                boss,
                dayjs().utc().format(),
                freshStatus,
                true,
                false,
                client,
                true,
                false
              )
            );
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
    `${
      spawnsAt.second() + 1
    } ${spawnsAt.minute()} ${spawnsAt.hour()} ${spawnsAt.date()} ${
      spawnsAt.month() + 1
    } *`,
    () => {
      scheduleNotification(client);
    },
    {
      timezone: "Etc/UTC",
    }
  );
}
module.exports = { scheduleNotification };
