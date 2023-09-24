const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { createChart } = require("../canvas");
const { parseUptime, parseForceDespawnTime } = require("../parseUptime");
const { activeBosses } = require("../activeBosses");
const cron = require("node-cron");
const { updateStatus, updateSpawnTime } = require("../../queries/updateStatus");
const { updateClearTime } = require("../../queries/updateClearTime");
const { logger } = require("../../utils/logger");
dayjs.extend(utc);

class Boss {
  botMessages = [];
  startTime;
  refreshTime = [];

  constructor(
    bossInfo,
    lastSpawn,
    status,
    isActive,
    calledBy,
    client,
    isSilent,
    isRevived
  ) {
    this.bossInfo = bossInfo;
    this.lastSpawn = lastSpawn;
    this.status = status;
    this.isActive = isActive;
    this.calledBy = calledBy;
    this.client = client;
    this.startTime = dayjs(lastSpawn);
    this.isSilent = isSilent;
    this.isRevived = isRevived;
    this.isHidden = false;

    logger(
      "LOG",
      `${this.bossInfo.shortName} spawned by ${
        this.calledBy ? this.calledBy.tag : "SERVER"
      }.`
    );

    this.statusHandler();

    //Dont notify if reviving boss via the revive command
    if (!this.isSilent) {
      this.sendNotif();
    }

    if (!this.isRevived) {
      //Update lastSpawn in the database
      updateSpawnTime(this.bossInfo.id, this.startTime.format());

      //Start forceClear cron task
      const clearTime = this.startTime.add(
        this.bossInfo.forceClearTime,
        "minutes"
      );

      logger(
        "LOG",
        `${this.bossInfo.shortName} auto-clear time set to ${clearTime.format(
          "HH:mm:ss"
        )}.`
      );

      this.forceClearTask = cron.schedule(
        `${clearTime.second()} ${clearTime.minute()} ${clearTime.hour()} * * *`,
        () => {
          if (!this.isHidden) this.deleteLastMessage();
          this.clearBoss("force");

          logger("LOG", `${this.bossInfo.name} auto-cleared.`);

          for (let i = 0; i < activeBosses.length; i++) {
            if (activeBosses[i].bossInfo.id === this.bossInfo.id) {
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
        if (activeBosses[i].bossInfo.id === this.bossInfo.id) {
          activeBosses.splice(i, 1);
          break;
        }
      }

      return;
    }

    if (this.isHidden) return;
    if (
      !dayjs()
        .utc()
        .isBefore(
          this.startTime.add(this.bossInfo.forceClearTime, "minutes")
        ) &&
      !this.isRevived
    )
      return;

    const uptime = parseUptime(this.startTime, true);
    const chart = await createChart(this);

    const statusHook = await this.client.fetchWebhook(
      process.env.STATUS_HOOK_ID,
      process.env.STATUS_HOOK_TOKEN
    );

    statusHook
      .send({
        content: dayjs
          .utc()
          .isAfter(
            this.startTime.add(this.bossInfo.forceDespawnTime, "minutes")
          )
          ? ":warning: This boss is past its forced despawn time. :warning:"
          : this.bossInfo.info,
        username: `${this.bossInfo.name} - ${uptime} elapsed`,
        avatarURL: this.bossInfo.avatar,
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
    }, 59800);

    this.refreshTime.push(refreshRef);
  }

  //Send a notification to users telling them the boss has spawned
  async sendNotif() {
    const notifHook = await this.client.fetchWebhook(
      process.env.NOTIF_HOOK_ID,
      process.env.NOTIF_HOOK_TOKEN
    );

    notifHook.send({
      content: `${this.bossInfo.name} has spawned. <#${
        process.env.STATUS_CHANNEL_ID
      }> @everyone \`${dayjs().utc().format("YYYY/MM/DD HH:mm:ss")} UTC\``,
      username: `${this.bossInfo.name}`,
      avatarURL: this.bossInfo.avatar,
    });
  }

  //Set the boss' health
  setHealth(channel, health, message) {
    let type = "Alive";
    let channelTag = "ALL";
    let hp = health;

    if (this.bossInfo.isWorldBoss) {
      if (health === "undo") {
        this.status[0].currentHealth = this.status[0].previousHealth;
        hp = this.status[0].currentHealth;
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
        this.clearBoss("auto");
        if (!this.isRevived) this.forceClearTask.stop();
      }
    } else {
      for (const status of this.status) {
        if (status.channel.name === channel) {
          //Undo current health to previous health
          if (health === "undo") {
            status.currentHealth = status.previousHealth;
            hp = status.currentHealth;

            const healthType = this.getHealthType("", status.previousHealth);
            type = healthType.type;
            status.clear = healthType.clear;
          } else {
            //If already marked as dead/desp/dns, don't reupdate.
            if (!parseInt(health) && health === status.currentHealth) return;

            status.previousHealth = status.currentHealth;
            status.currentHealth = health;

            const healthType = this.getHealthType(status.currentHealth, "");
            type = healthType.type;
            status.clear = healthType.clear;
          }

          status.updated = dayjs().utc().format();
          channelTag = status.channel.shortName;

          //Check if all the channels are clear
          this.checkIfClear();

          break;
        }
      }
    }

    if (hp === "Dead" || hp === "Desp" || hp === "DNS") hp = "0";

    this.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) =>
      c.send({
        content: `\`${dayjs().utc().toISOString()}\` <#${
          process.env.STATUS_CHANNEL_ID
        }> \`${channelTag}-${this.bossInfo.shortName}-${hp}-${type}\` <@${
          message.author.id
        }> \`${message.content}\``,
      })
    );

    //Update the boss health in the database
    updateStatus(this.bossInfo.id, this.status);

    this.statusHandler();
    setTimeout(() => {
      this.deleteLastMessage();
    }, 1000);
  }

  getHealthType(currentHealth, previousHealth) {
    if (currentHealth === "Dead" || previousHealth === "Dead") {
      return {
        type: "Dead",
        clear: true,
      };
    } else if (currentHealth === "Desp" || previousHealth === "Desp") {
      return {
        type: "Despawned",
        clear: true,
      };
    } else if (currentHealth === "DNS" || previousHealth === "Desp") {
      return {
        type: "DidNotSpawn",
        clear: true,
      };
    } else {
      return {
        type: "Alive",
        clear: false,
      };
    }
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
      this.clearBoss("auto");
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

    if (type === "force" || type === "manual") {
      const currTime = dayjs().utc();
      const forceTime = this.startTime.add(
        this.bossInfo.forceDespawnTime,
        "minutes"
      );
      let clearTime = "";

      if (!currTime.isBefore(forceTime)) {
        clearTime = `${parseForceDespawnTime(
          this.startTime,
          this.bossInfo.forceDespawnTime
        )}, adjusted to force despawn`;
      } else {
        clearTime = `${parseUptime(this.startTime, true)}`;
      }

      embed = {
        color: 0x8a0000,
        title: `${this.bossInfo.name} all clear after ${clearTime}`,
        fields: embedFields,
        thumbnail: {
          url: `${this.bossInfo.avatar}`,
        },
        footer: {
          text:
            type === "force"
              ? "This boss reached it's auto-clear time. @mention a mod if it is still alive."
              : "This boss was cleared by a moderator. @mention a mod if it is still alive.",
        },
      };
    } else {
      embed = {
        color: 0x8a0000,
        title: `${this.bossInfo.shortName} all clear after ${parseUptime(
          this.startTime,
          true
        )}`,
        fields: embedFields,
        thumbnail: {
          url: `${this.bossInfo.avatar}`,
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
          ? `${this.bossInfo.name} all clear after ${parseForceDespawnTime(
              this.startTime,
              this.bossInfo.forceDespawnTime
            )}`
          : `${this.bossInfo.name} all clear after ${parseUptime(
              this.startTime,
              true
            )}`,
      fields: embedField,
      thumbnail: {
        url: `${this.bossInfo.avatar}`,
      },
      footer:
        type === "force"
          ? {
              text: "This boss reached it's auto-clear time. @mention a mod if it is still alive.",
            }
          : undefined,
    };

    if (this.bossInfo.isWorldBoss) {
      //Killed or desp
      if (this.status[0].currentHealth === "Dead") {
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
      embed = this.fieldClearEmbed(type);
    }

    //#boss-status
    this.client.channels
      .fetch(process.env.STATUS_CHANNEL_ID)
      .then((channel) => channel.send({ embeds: [embed] }))
      .catch((err) => console.error(err));

    //Update clear time
    if (!this.bossInfo.isWorldBoss && this.bossInfo.windowCooldown !== 0) {
      //If auto-cleared, adjust to actual despawn time. Same with manual clear after despawn time.
      if (
        type === "force" ||
        (type === "manual" &&
          dayjs()
            .utc()
            .isAfter(
              this.startTime.add(this.bossInfo.forceDespawnTime, "minutes")
            ))
      ) {
        await updateClearTime(
          this.bossInfo.shortName,
          this.bossInfo.windowCooldown,
          this.startTime.add(this.bossInfo.forceDespawnTime, "minutes")
        );
      } else {
        await updateClearTime(
          this.bossInfo.shortName,
          this.bossInfo.windowCooldown,
          dayjs().utc()
        );
      }
    }

    this.isActive = false;
  }

  //Change to uber
  changeToUber(uberInfo, calledBy) {
    this.bossInfo.name = uberInfo.name;
    this.bossInfo.shortName = uberInfo.shortName;
    this.bossInfo.aliases += `|${uberInfo.aliases}`;
    this.bossInfo.info = uberInfo.info;
    this.bossInfo.avatar = uberInfo.avatar;
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
    this.botMessages
      .shift()
      .delete()
      .catch((err) => logger("ERROR", `Failed to delete message.`));
    clearTimeout(this.refreshTime.shift());
  }
}

module.exports = { Boss };
