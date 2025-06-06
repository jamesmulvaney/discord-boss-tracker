const { createChart } = require("../canvas");
const { parseUptime, parseForceDespawnTime } = require("../parseUptime");
const { activeBosses } = require("../activeBosses");
const {
  setWindowTimes,
  updateStatus,
  setLastSpawn,
} = require("../../queries/bossQueries");
const { WebhookClient } = require("discord.js");
const { sendModLog } = require("../../utils/sendModLog");
const Logger = require("../../utils/logger");
const cron = require("node-cron");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

class Boss {
  botMessages = [];
  startTime;
  refreshTime = [];
  statusWebhook = new WebhookClient({
    id: process.env.STATUS_HOOK_ID,
    token: process.env.STATUS_HOOK_TOKEN,
  });

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

    Logger.info(
      `${this.bossInfo.shortName} ${
        this.isRevived ? "revived" : "spawned"
      } by ${this.calledBy ? this.calledBy.tag : "SERVER"}.`
    );

    this.statusHandler();

    //Dont notify if reviving boss via the revive command
    if (!this.isSilent) {
      this.sendNotif();
    }

    if (!this.isRevived) {
      //Update lastSpawn in the database
      setLastSpawn(this.bossInfo.id, this.startTime.format());

      //Start forceClear cron task
      const clearTime = this.startTime.add(
        this.bossInfo.forceClearTime,
        "minutes"
      );

      Logger.log(
        `${this.bossInfo.shortName} auto-clear time set to ${clearTime.format(
          "HH:mm:ss"
        )}.`
      );

      this.forceClearTask = cron.schedule(
        `${clearTime.second()} ${clearTime.minute()} ${clearTime.hour()} * * *`,
        () => {
          if (!this.isHidden) this.deleteLastMessage();
          this.clearBoss("force");
          this.forceClearTask.stop();

          Logger.log(`${this.bossInfo.name} auto-cleared.`);

          this.statusWebhook.destroy();
          this.removeFromActiveBosses();
        }
      );
    }
  }

  //Send a message to #boss-status with information about this boss
  async statusHandler() {
    //Remove the boss from activeBosses array if it is cleared.
    if (!this.isActive) {
      if (!this.isRevived) this.forceClearTask.stop();
      this.statusWebhook.destroy();
      this.removeFromActiveBosses();

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

    this.statusWebhook
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
        this.botMessages.push(message.id);
      });

    const refreshTime = this.bossInfo.isWorldBoss ? 60000 : 59980;

    //Refresh chart if message has not been send within 60 seconds
    const refreshRef = setTimeout(() => {
      this.statusHandler();

      setTimeout(() => {
        if (!this.isActive) return;
        this.deleteLastMessage();
      }, 1000);
    }, refreshTime);

    this.refreshTime.push(refreshRef);
  }

  //Send a notification to users telling them the boss has spawned
  async sendNotif() {
    const notificationWebhook = new WebhookClient({
      id: process.env.NOTIF_HOOK_ID,
      token: process.env.NOTIF_HOOK_TOKEN,
    });

    notificationWebhook.send({
      content: `${this.bossInfo.name} has spawned. <#${
        process.env.STATUS_CHANNEL_ID
      }> ${this.bossInfo.roleId ? `<@&${this.bossInfo.roleId}>` : ""}`,
      username: `${this.bossInfo.name}`,
      avatarURL: this.bossInfo.avatar,
    });

    notificationWebhook.destroy();
  }

  //Set the boss' health
  setHealth(channel, health, message) {
    let type;
    let channelTag;
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
        type = "Dead";
      } else if (this.status[0].currentHealth === "Desp") {
        type = "Despawned";
      } else if (this.status[0].currentHealth === "??") {
        type = "Unknown";
      }

      this.status[0].updated = dayjs().utc().format();

      if (health === "Desp" || health === "Dead") {
        this.isActive = false;
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

    const logMessage = `${channelTag ? `${channelTag}-` : ""}${
      this.bossInfo.shortName
    }-${type ? type : hp}`;

    sendModLog(
      this.client,
      message.channel,
      logMessage,
      message.author,
      message.content
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
    } else if (currentHealth === "??" || previousHealth === "??") {
      return {
        type: "Unknown",
        clear: false,
      };
    } else {
      return {
        type: undefined,
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
    const embedFields = [];
    let embed = {
      author: {
        name: this.bossInfo.name,
        icon_url: this.bossInfo.avatar,
      },
      color: 0x8a0000,
      title: `Boss Clear Summary`,
      fields: embedFields,
    };

    if (type !== "auto") {
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
        )} [Forced Despawn]`;
      } else {
        clearTime = `${parseUptime(this.startTime, true)}`;
      }

      embedFields.push({
        name: "Time Elapsed",
        value: clearTime,
      });

      embed.footer = {
        text:
          type === "force"
            ? "This boss reached it's auto-clear time. @mention a mod if it is still alive."
            : "This boss was cleared by a moderator. @mention a mod if it is still alive.",
      };
    } else {
      embedFields.push({
        name: "Time Elapsed",
        value: parseUptime(this.startTime, true),
      });
    }

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
      author: {
        name: this.bossInfo.name,
        icon_url: this.bossInfo.avatar,
      },
      color: 0x8a0000,
      title: "Boss Clear Summary",
      fields: embedField,
      footer:
        type === "force"
          ? {
              text: "This boss reached it's auto-clear time. @mention a mod if it is still alive.",
            }
          : undefined,
    };

    embedField.push({
      name: "**Time Elapsed**",
      value:
        type === "force"
          ? parseForceDespawnTime(
              this.startTime,
              this.bossInfo.forceDespawnTime
            )
          : parseUptime(this.startTime, true),
    });

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
        await setWindowTimes(
          this.bossInfo.shortName,
          this.bossInfo.windowCooldown,
          this.startTime.add(this.bossInfo.forceDespawnTime, "minutes")
        );
      } else {
        await setWindowTimes(
          this.bossInfo.shortName,
          this.bossInfo.windowCooldown,
          dayjs().utc()
        );
      }
    }
  }

  //Change to uber
  changeToUber(uberInfo, calledBy) {
    this.bossInfo.id = uberInfo.id;
    this.bossInfo.name = uberInfo.name;
    this.bossInfo.shortName = uberInfo.shortName;
    this.bossInfo.aliases += `|${uberInfo.aliases}`;
    this.bossInfo.info = uberInfo.info;
    this.bossInfo.avatar = uberInfo.avatar;
    this.bossInfo.roleId = uberInfo.roleId;
    this.calledBy = calledBy;

    this.statusHandler();
    this.sendNotif();
    setLastSpawn(uberInfo.id, this.startTime.format());

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
    this.statusWebhook.deleteMessage(this.botMessages.shift()).catch((err) => {
      Logger.error(`Failed to delete message.`);
    });

    clearTimeout(this.refreshTime.shift());
  }

  removeFromActiveBosses() {
    for (let i = 0; i < activeBosses.length; i++) {
      if (activeBosses[i].bossInfo.id === this.bossInfo.id) {
        activeBosses.splice(i, 1);
        break;
      }
    }
  }
}

module.exports = { Boss };
