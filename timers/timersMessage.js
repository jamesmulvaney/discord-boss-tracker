const { config } = require("../config");
const { activeBosses } = require("../boss-handler/activeBosses");
const { parseElapsed, parseTimeUntil } = require("../boss-handler/parseUptime");
const { getFieldBossList, getBossSchedule } = require("../queries/bossQueries");
const Logger = require("../utils/logger");
const { updateIsMaintenance } = require("../queries/setConfig");
const { WebhookClient } = require("discord.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
dayjs.extend(utc);
dayjs.extend(duration);

const timerMessageId = [];

async function timersMessage(client) {
  if (timerMessageId.length < 1) await deleteMessageOnStart(client);

  const schedule = await getBossSchedule();
  const config = await getMaintenanceInfo();
  const fieldBosses = await getFieldBossList();

  let mainList = "";
  let activeList = "";
  let notInWindowList = "";
  let inWindowList = "";
  let scheduleList = "";

  const timersWebhook = new WebhookClient({
    id: process.env.TIMER_HOOK_ID,
    token: process.env.TIMER_HOOK_TOKEN,
  });

  //Maintenance Information
  if (config.maintStart) {
    const currentTime = dayjs().utc();
    const nextMaintTime = dayjs(config.maintStart).utc();
    const maintEnd = dayjs(config.maintEnd).utc();

    if (currentTime.isBefore(nextMaintTime)) {
      //maint is scheduled
      maintLength = dayjs
        .duration(maintEnd.diff(nextMaintTime))
        .format("H[h]m[m]");

      mainList = `Maintenance will begin in ${parseTimeUntil(
        nextMaintTime
      )} and last for ${maintLength}`;
    } else if (config.isMaintenance) {
      //maint is now
      mainList = `Maintenance will end in ${parseTimeUntil(maintEnd)}`;
    }
  }

  //Sort active bosses
  for (const activeBoss of activeBosses) {
    const time = parseElapsed(activeBoss.startTime);
    const name = nameWithPadding(activeBoss.bossInfo.shortName, time.length);

    activeList += `${name} ${time} elapsed            \n`;
  }

  //Sort schedule
  for (const boss of schedule) {
    if (
      ((!boss.isWorldBoss || boss.isUber) && !boss.nextSpawn) ||
      activeList.includes(boss.shortName) ||
      (!boss.nextSpawn && !boss.alwaysShow)
    )
      continue;

    const time = boss.nextSpawn ? parseTimeUntil(boss.nextSpawn) : "??";
    const name = nameWithPadding(boss.shortName, time.length);

    scheduleList += `${name} ${time} until ${
      boss.name === "Vell" ? "30m warning " : "spawn        "
    }\n`;
  }

  //Sort field boss windows
  for (const boss of fieldBosses) {
    if (
      boss.windowCooldown === 0 ||
      boss.nextSpawn ||
      activeList.includes(boss.shortName)
    )
      continue;

    //If no window set
    if (!boss.windowStart) {
      const name = nameWithPadding(boss.shortName, 2);

      notInWindowList += `${name} ?? until window opens \n`;
      continue;
    }

    const currentTime = dayjs().utc();
    const windowOpen = dayjs(boss.windowStart).utc();
    const windowClose = dayjs(boss.windowEnd).utc();

    //Not in window
    if (currentTime.isBefore(windowOpen)) {
      const time = parseTimeUntil(windowOpen);
      const name = nameWithPadding(boss.shortName, time.length);

      notInWindowList += `${name} ${time} until window opens \n`;
    } else if (
      currentTime.isAfter(windowOpen) &&
      currentTime.isBefore(windowClose)
    ) {
      const time = parseTimeUntil(windowClose);
      const name = nameWithPadding(boss.shortName, time.length);

      inWindowList += `${name} ${time} until window closes\n`;
    } else {
      const time = parseElapsed(windowClose);
      const name = nameWithPadding(boss.shortName, time.length);

      inWindowList += `${name} ${time} late               \n`;
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
    title: ":crossed_swords: Spawned",
    description: `\`\`\`js\n${activeList}\`\`\``,
  };

  const scheduleEmbed = {
    color: 0xffffff,
    title: ":calendar_spiral: World Boss Timers",
    description: `\`\`\`js\n${scheduleList}\`\`\``,
  };

  const notInWindowEmbed = {
    color: 0x9c0000,
    title: ":no_entry_sign: Window Closed",
    description: `\`\`\`js\n${notInWindowList}\`\`\``,
    footer: {
      text: "Can not spawn until window opens",
    },
  };

  const inWindowEmbed = {
    color: 0xfff269,
    title: ":window: In Window",
    description: `\`\`\`js\n${inWindowList}\`\`\``,
    footer: {
      text: "Will spawn between now and the end of the window",
    },
  };

  const embedArray = [];

  if (mainList) embedArray.push(maintEmbed);
  if (activeList) embedArray.push(activeEmbed);
  if (inWindowList) embedArray.push(inWindowEmbed);
  if (notInWindowList) embedArray.push(notInWindowEmbed);
  if (scheduleList) embedArray.push(scheduleEmbed);

  //Send timers via webhook
  timersWebhook
    .send({
      content: "",
      username: "Timers",
      avatarURL: "",
      embeds: embedArray,
    })
    .then((message) => {
      timerMessageId.push(message.id);
    })
    .catch((err) => {
      Logger.error(`${err}`);
    });

  setTimeout(() => {
    //Resend timers
    timersMessage(client);

    //Delete previous message
    setTimeout(() => {
      timersWebhook.deleteMessage(timerMessageId.shift()).catch((err) => {
        Logger.error(`Failed to delete message.`);
      });
    }, 1000);
  }, 60000);
}

async function getMaintenanceInfo() {
  if (!config[0].maintStart) return config[0];

  const currentTime = dayjs().utc();
  const maintStart = dayjs(config[0].maintStart).utc();
  const maintEnd = dayjs(config[0].maintEnd).utc();

  //Check if maintenance mode is not set and current time is past maintenance start time.
  if (!config[0].isMaintenance) {
    //Set bot to maintenance mode and adjust timers
    if (currentTime.isAfter(maintStart) && currentTime.isBefore(maintEnd)) {
      config[0] = await updateIsMaintenance(true);
    }
  } else {
    //End maintenance mode
    if (currentTime.isSame(maintEnd) || currentTime.isAfter(maintEnd)) {
      config[0] = await updateIsMaintenance(false);
    }
  }

  return config[0];
}

function nameWithPadding(name, timeLength) {
  if (name.length < 17) {
    return name.padEnd(name.length + (18 - (name.length + timeLength)));
  }

  return name;
}

async function deleteMessageOnStart(client) {
  const channel = client.channels.cache.get("871725043409911859");

  await channel.messages.fetch({ limit: 5 }).then((messages) => {
    messages.forEach((message) => {
      if (message.webhookId) {
        Logger.debug(`Deleted timers embed via fetch`);
        message.delete();
        return;
      }
    });
  });
}

module.exports = { timersMessage, timerMessageId };
