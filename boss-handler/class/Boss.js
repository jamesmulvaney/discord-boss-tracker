const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { createChart } = require("../canvas");
const { parseUptime, parseForceDespawnTime } = require("../parseUptime");
const { activeBosses } = require("../activeBosses");
const cron = require("node-cron");
const { updateStatus, updateSpawnTime } = require("../../queries/updateStatus");
const { updateClearTime } = require("../../queries/updateClearTime");
dayjs.extend(utc);

class Boss {
  botMessages = [];
  startTime;
  refreshTime = [];

  constructor(
    id,
    name,
    shortName,
    aliases,
    info,
    avatar,
    lastSpawn,
    isWorldBoss,
    status,
    isActive,
    calledBy,
    forceDespawnTime,
    forceClearTime,
    windowCooldown,
    client,
    isSilent,
    isRevived
  ) {
    this.id = id;
    this.name = name;
    this.shortName = shortName;
    this.aliases = aliases;
    this.info = info;
    this.avatar = avatar;
    this.lastSpawn = lastSpawn;
    this.isWorldBoss = isWorldBoss;
    this.status = status;
    this.isActive = isActive;
    this.calledBy = calledBy;
    this.forceDespawnTime = forceDespawnTime;
    this.forceClearTime = forceClearTime;
    this.windowCooldown = windowCooldown;
    this.client = client;
    this.startTime = dayjs(lastSpawn);
    this.isSilent = isSilent;
    this.isRevived = isRevived;
    this.isHidden = false;

    console.log(
      `[${dayjs().utc().format("HH:mm:ss")}][LOG] ${
        calledBy.tag ? calledBy.tag : "SERVER"
      } has called up ${name}.`
    );

    this.statusHandler();

    //Dont notify if reviving boss via the revive command
    if (!this.isSilent) {
      this.sendNotif();
    }

    if (!isRevived) {
      //Update lastSpawn in the database
      updateSpawnTime(this.id, this.startTime.format());

      //Start forceClear cron task
      const clearTime = this.startTime.add(this.forceClearTime, "minutes");
      console.log(
        `[${dayjs().utc().format("HH:mm:ss")}][LOG] ${
          this.shortName
        } auto-clear time set to ${clearTime.format("HH:mm:ss")}`
      );
      this.forceClearTask = cron.schedule(
        `${clearTime.second()} ${clearTime.minute()} ${clearTime.hour()} * * *`,
        () => {
          if (!this.isHidden) this.deleteLastMessage();
          this.clearBoss("force");

          console.log(
            `[${dayjs().utc().format("HH:mm:ss")}][LOG] ${
              this.shortName
            } auto-cleared.`
          );

          for (let i = 0; i < activeBosses.length; i++) {
            if (activeBosses[i].id === this.id) {
              activeBosses.splice(i, 1);
              break;
            }
          }
        }
      );
    }
  }

  //Send a message to #boss-status with information about this boss
  async statusHandler() {
    //Remove the boss from activeBosses array if it is cleared.
    if (!this.isActive) {
      if (!this.isRevived) this.forceClearTask.stop();
      //clearTimeout(this.refreshTime.shift());
      for (let i = 0; i < activeBosses.length; i++) {
        if (activeBosses[i].id === this.id) {
          activeBosses.splice(i, 1);
          break;
        }
      }

      return;
    }

    if (this.isHidden) return;

    const uptime = parseUptime(this.startTime);
    const chart = await createChart(this);

    const statusHook = await this.client.fetchWebhook(
      process.env.STATUS_HOOK_ID,
      process.env.STATUS_HOOK_TOKEN
    );

    await statusHook
      .send({
        content: dayjs
          .utc()
          .isAfter(this.startTime.add(this.forceDespawnTime, "minutes"))
          ? ":warning: This boss is past it's forced despawn time. :warning:"
          : this.info,
        username: `${this.name} - ${uptime} elapsed`,
        avatarURL: this.avatar,
        files: [chart],
      })
      .then((message) => {
        this.botMessages.push(message);
      });

    //Refresh chart if message has not been send within 60 seconds
    const refreshRef = setTimeout(() => {
      this.statusHandler();
      setTimeout(() => {
        if (!this.isActive) return;
        this.deleteLastMessage();
      }, 1000);
    }, 59450);

    this.refreshTime.push(refreshRef);
  }

  //Send a notification to users telling them the boss has spawned
  async sendNotif() {
    const notifHook = await this.client.fetchWebhook(
      process.env.NOTIF_HOOK_ID,
      process.env.NOTIF_HOOK_TOKEN
    );

    await notifHook.send({
      content: `${this.name} has spawned. Status in <#${
        process.env.STATUS_CHANNEL_ID
      }> @everyone \`${dayjs().utc().format("YYYY/MM/DD HH:mm:ss")} UTC\``,
      username: `${this.name}`,
      avatarURL: this.avatar,
    });

    //Send log to #logs
    this.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) => {
      c.send({
        content: `\`${dayjs().utc().format("YYYY-MM-DDTHH:mm:ss")} UTC\` <#${
          process.env.STATUS_CHANNEL_ID
        }> \`${this.shortName}-UP\` <@${this.calledBy.id}>`,
      });
    });
  }

  //Set the boss' health
  setHealth(channel, health, message) {
    let type = "Alive";
    let channelTag = "ALL";

    if (this.isWorldBoss) {
      if (health === "undo") {
        this.status[0].currentHealth = this.status[0].previousHealth;
      } else {
        this.status[0].previousHealth = this.status[0].currentHealth;
        this.status[0].currentHealth = health;
      }

      if (this.status[0].currentHealth === "Dead") {
        type = "Killed";
      } else if (this.status[0].currentHealth === "Desp") {
        type = "Despawned";
      }

      this.status[0].updated = dayjs().utc().format();

      if (health === "Desp" || health === "Dead") {
        this.clearBoss(health);
        if (!this.isRevived) this.forceClearTask.stop();
      }
    } else {
      this.status.forEach((s) => {
        if (s.channel.name === channel) {
          if (health === "undo") {
            s.currentHealth = s.previousHealth;
          } else {
            s.previousHealth = s.currentHealth;
            s.currentHealth = health;
          }

          s.updated = dayjs().utc().format();
          if (s.currentHealth === "Dead") {
            type = "Killed";
            s.clear = true;
          } else if (s.currentHealth === "Desp") {
            type = "Despawned";
            s.clear = true;
          } else if (s.currentHealth === "DNS") {
            type = "DidNotSpawn";
            s.clear = true;
          }

          channelTag = s.channel.shortName;

          //Check if all the channels are clear
          this.checkIfClear();

          return;
        }
      });
    }

    this.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) =>
      c.send({
        content: `\`${dayjs().utc().format("YYYY-MM-DDTHH:mm:ss")} UTC\` <#${
          process.env.STATUS_CHANNEL_ID
        }> \`${channelTag}-${
          this.shortName
        }-${health.toUpperCase()}-${type}\` <@${message.author.id}> \`${
          message.content
        }\``,
      })
    );

    //Update the boss health in the database
    updateStatus(this.id, this.status);
  }

  //Check if all channels are clear for field boss
  checkIfClear() {
    if (this.isRevived) return;

    let count = 0;

    this.status.forEach((s) => {
      if (s.clear || s.channel.isArsha) {
        count++;
      }
    });

    if (count === this.status.length) {
      this.clearBoss("fieldClear");
      if (!this.isRevived) this.forceClearTask.stop();
      this.isActive = false;
    }
  }

  //Get an embed with the clear information for the field boss. (Number killed, despawned, etc.)
  fieldClearEmbed(type) {
    let embed;
    const embedFields = [];

    //Embed Fields
    const [killed, despawned, didNotSpawn, uncalled] = this.formatFieldStatus();

    if (killed) {
      embedFields.push({
        name: `**Killed**`,
        value: `${killed}`,
        inline: true,
      });
    }

    if (despawned) {
      embedFields.push({
        name: `**Despawned**`,
        value: `${despawned}`,
        inline: true,
      });
    }

    if (didNotSpawn) {
      embedFields.push({
        name: `**Did Not Spawn**`,
        value: `${didNotSpawn}`,
        inline: true,
      });
    }

    if (uncalled) {
      embedFields.push({
        name: `**Uncalled**`,
        value: `${uncalled}`,
        inline: true,
      });
    }

    if (type === "manual") {
      embed = {
        color: 0x8a0000,
        title: `${this.name} all clear after ${parseUptime(this.startTime)}`,
        fields: embedFields,
        thumbnail: {
          url: `${this.avatar}`,
        },
        footer: {
          text: "This boss was cleared by a moderator. @mention them if the boss if still alive on your channel.",
        },
      };
    } else if (type === "force") {
      embed = {
        color: 0x8a0000,
        title: `${this.name} all clear after ${parseForceDespawnTime(
          this.startTime,
          this.forceDespawnTime
        )}, adjusted to initial despawn`,
        fields: embedFields,
        thumbnail: {
          url: `${this.avatar}`,
        },
        footer: {
          text: "This boss reached it's auto-clear time. @mention a mod if it is still alive.",
        },
      };
    } else {
      embed = {
        color: 0x8a0000,
        title: `${this.shortName} all clear after ${parseUptime(
          this.startTime
        )}s`,
        fields: embedFields,
        thumbnail: {
          url: `${this.avatar}`,
        },
      };
    }

    return embed;
  }

  //Categorise clear type
  formatFieldStatus() {
    const killed = [];
    const despawned = [];
    const uncalled = [];
    const didNotSpawn = [];

    this.status.forEach((s) => {
      if (!s.channel.isArsha) {
        if (s.currentHealth === "Dead") {
          killed.push(s.channel.shortName);
        } else if (s.currentHealth === "Desp" || parseInt(s.currentHealth)) {
          despawned.push(s.channel.shortName);
        } else if (s.currentHealth === "DNS") {
          didNotSpawn.push(s.channel.shortName);
        } else {
          uncalled.push(s.channel.shortName);
        }
      }
    });

    return [
      killed.join(", "),
      despawned.join(", "),
      didNotSpawn.join(", "),
      uncalled.join(", "),
    ];
  }

  //Boss all clear
  async clearBoss(type) {
    const embedField = [];
    let embed = {
      color: 0x8a0000,
      title:
        type === "force"
          ? `${this.name} all clear after ${parseForceDespawnTime(
              this.startTime,
              this.forceDespawnTime
            )}, adjusted to initial despawn`
          : `${this.name} all clear after ${parseUptime(this.startTime)}`,
      fields: embedField,
      thumbnail: {
        url: `${this.avatar}`,
      },
      footer:
        type === "force"
          ? {
              text: "This boss reached it's auto-clear time. @mention a mod if it is still alive.",
            }
          : undefined,
    };

    if (this.isWorldBoss) {
      //Killed or desp
      if (type === "dead") {
        embedField.push({
          name: "**Killed**",
          value: "All Channels",
        });
      } else {
        embedField.push({
          name: "**Despawned**",
          value: "All Channels",
        });
      }
    } else {
      if (type === "fieldClear") {
        embed = this.fieldClearEmbed("auto");
      } else if (type === "force") {
        embed = this.fieldClearEmbed("force");
      } else {
        embed = this.fieldClearEmbed("manual");
      }
    }

    //#boss-status
    this.client.channels
      .fetch(process.env.STATUS_CHANNEL_ID)
      .then((channel) => channel.send({ embeds: [embed] }))
      .catch((err) => console.error(err));

    //Update clear time
    if (!this.isWorldBoss && this.windowCooldown !== 0) {
      //If auto-cleared, adjust to actual despawn time. Same with manual clear after despawn time.
      if (
        type === "force" ||
        (type === "manual" &&
          dayjs()
            .utc()
            .isAfter(this.startTime.add(this.forceDespawnTime, "minutes")))
      ) {
        await updateClearTime(
          this.shortName,
          this.windowCooldown,
          this.startTime.add(this.forceDespawnTime, "minutes")
        );
      } else {
        await updateClearTime(
          this.shortName,
          this.windowCooldown,
          dayjs().utc()
        );
      }
    }

    this.isActive = false;
  }

  //Change to uber
  changeToUber(uberInfo, calledBy) {
    this.name = uberInfo.name;
    this.shortName = uberInfo.shortName;
    this.aliases += `|${uberInfo.aliases}`;
    this.info = uberInfo.info;
    this.avatar = uberInfo.avatar;
    this.calledBy = calledBy;

    this.statusHandler();
    this.sendNotif();

    //Cancel self-refresh and delete previous message
    setTimeout(() => {
      this.deleteLastMessage();
    }, 1000);
  }

  //Toggle chart
  toggleChart() {
    if (!this.isHidden) {
      this.isHidden = true;

      this.deleteLastMessage();
    } else {
      this.isHidden = false;
      this.statusHandler();
    }

    return this.isHidden;
  }

  deleteLastMessage() {
    this.botMessages.shift().delete();
    clearTimeout(this.refreshTime.shift());
  }
}

module.exports = { Boss };
