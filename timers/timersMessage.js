const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
const { activeBosses } = require("../boss-handler/activeBosses");
const { parseElapsed, parseTimeUntil } = require("../boss-handler/parseUptime");
const { getBossSchedule } = require("../queries/getBossSchedule");
const { getFieldBossList } = require("../queries/getFieldBoss");
const { checkMaintenanceMode } = require("./checkMaintenance");
const { logger } = require("../utils/logger");
dayjs.extend(utc);
dayjs.extend(duration);

const timerMessageId = [];

async function timersMessage(client) {
  const schedule = await getBossSchedule();
  const config = await checkMaintenanceMode();
  const fieldBosses = await getFieldBossList();

  let mainList = "";
  let activeList = "";
  let notInWindowList = "";
  let inWindowList = "";
  let scheduleList = "";

  //Timer hook
  const timerHook = await client.fetchWebhook(
    process.env.TIMER_HOOK_ID,
    process.env.TIMER_HOOK_TOKEN
  );

  //Maintenance Information
  if (config[0].maintStart) {
    const nextMaintTime = dayjs(config[0].maintStart).utc();
    const maintEnd = dayjs(config[0].maintEnd).utc();
    const now = dayjs().utc();

    if (now.isBefore(nextMaintTime)) {
      //maint is scheduled
      maintLength = dayjs
        .duration(maintEnd.diff(nextMaintTime))
        .format("H[h]m[m]");

      mainList = `Maintenance will begin in ${parseTimeUntil(
        nextMaintTime
      )} and last for ${maintLength}`;
    } else if (config[0].isMaintenance) {
      //maint is now
      mainList = `Maintenance will end in ${parseTimeUntil(maintEnd)}`;
    }
  }

  //Sort active bosses
  for (const activeBoss of activeBosses) {
    const uptime = parseElapsed(activeBoss.startTime);
    let name = activeBoss.bossInfo.shortName;

    if (name.length < 17) {
      name = name.padEnd(name.length + (18 - (name.length + uptime.length)));
    }

    activeList += `${name} ${uptime} elapsed            \n`;
  }

  //Sort schedule
  for (const boss of schedule) {
    if (!boss.nextSpawn || activeList.includes(boss.shortName)) continue;

    const timeUntil = parseTimeUntil(boss.nextSpawn);
    let name = boss.shortName;

    if (name.length < 17) {
      name = name.padEnd(name.length + (18 - (name.length + timeUntil.length)));
    }

    scheduleList += `${name} ${timeUntil} until ${
      boss.name === "Vell" ? "30m warning " : "spawn        "
    }\n`;
  }

  //Sort field boss windows
  for (const boss of fieldBosses) {
    if (!boss.clearTime || activeList.includes(boss.shortName)) continue;

    let name = boss.shortName;
    const windowOpen = dayjs(boss.windowStart).utc();
    const windowClose = dayjs(boss.windowEnd).utc();
    const now = dayjs().utc();

    //Not in window
    if (now.isBefore(windowOpen)) {
      const timeUntil = parseTimeUntil(windowOpen);
      if (name.length < 17) {
        name = name.padEnd(
          name.length + (18 - (name.length + timeUntil.length))
        );
      }

      notInWindowList += `${name} ${timeUntil} until window opens \n`;
    } else if (now.isAfter(windowOpen) && now.isBefore(windowClose)) {
      const timeUntil = parseTimeUntil(windowClose);
      if (name.length < 17) {
        name = name.padEnd(
          name.length + (18 - (name.length + timeUntil.length))
        );
      }

      inWindowList += `${name} ${timeUntil} until window closes\n`;
    } else {
      const timeUntil = parseElapsed(windowClose);
      if (name.length < 17) {
        name = name.padEnd(
          name.length + (18 - (name.length + timeUntil.length))
        );
      }

      inWindowList += `${name} ${timeUntil} late               \n`;
    }
  }

  if (scheduleList === "") scheduleList = "No bosses scheduled.";

  const maintEmbed = {
    color: 0xda8b3c,
    title: ":tools: Maintenance",
    description: `${mainList}`,
  };

  const activeEmbed = {
    color: 0x41a54a,
    title: ":crossed_swords: Active Bosses",
    description: `\`\`\`js\n${activeList}\`\`\``,
  };

  const scheduleEmbed = {
    color: 0xffffff,
    title: ":calendar_spiral: World Boss Timers",
    description: `\`\`\`js\n${scheduleList}\`\`\``,
  };

  const notInWindowEmbed = {
    color: 0x9c0000,
    title: ":hourglass_flowing_sand: Not In Window",
    description: `\`\`\`js\n${notInWindowList}\`\`\``,
    footer: {
      text: "Do not have a chance to spawn until window opens",
    },
  };

  const inWindowEmbed = {
    color: 0xfff269,
    title: ":alarm_clock: In Window",
    description: `\`\`\`js\n${inWindowList}\`\`\``,
    footer: {
      text: "Will spawn between now and the end of window",
    },
  };

  const embedArray = [];

  if (mainList) embedArray.push(maintEmbed);
  if (activeList) embedArray.push(activeEmbed);
  if (inWindowList) embedArray.push(inWindowEmbed);
  if (notInWindowList) embedArray.push(notInWindowEmbed);
  if (scheduleList) embedArray.push(scheduleEmbed);

  await timerHook
    .send({
      content: "",
      username: "Timers",
      avatarURL: "",
      embeds: embedArray,
    })
    .then((message) => {
      timerMessageId.push(message);
    })
    .catch((err) => {
      logger("ERROR", `${err}`);

      timersMessage(client);
    });

  setTimeout(() => {
    timersMessage(client);

    //Delete old timer 1 second after the new timer is sent.
    //Prevents flashing a blank channel
    setTimeout(() => {
      try {
        const toDelete = timerMessageId.shift();
        toDelete.delete();
      } catch (err) {
        logger("ERROR", `Failed to delete message.`);
      }
    }, 1000);
  }, 59450);
}

module.exports = { timersMessage, timerMessageId };
