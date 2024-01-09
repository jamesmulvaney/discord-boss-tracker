const { activeBosses } = require("../boss-handler/activeBosses");
const { sendModLog } = require("../utils/sendModLog");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  name: "unspawn",
  description: "Unspawn a false boss spawn. Syntax: `!unspawn <bossAlias>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        const alias = args.join("");
        let unspawned = false;

        for (let i = 0; i < activeBosses.length; i++) {
          const bossRegex = new RegExp(
            `${activeBosses[i].bossInfo.aliases}`,
            "iu"
          );

          if (bossRegex.test(alias)) {
            const bossName = activeBosses[i].bossInfo.name;
            const bossShortName = activeBosses[i].bossInfo.shortName;
            activeBosses[i].isActive = false;
            activeBosses[i].deleteLastMessage();

            if (!activeBosses[i].isRevived)
              activeBosses[i].forceClearTask.stop();

            //Boss status message
            await msg.client.channels
              .fetch(process.env.STATUS_CHANNEL_ID)
              .then((channel) =>
                channel.send({
                  content: `:information_source: **${bossName}** was a false call and has been unspawned.`,
                })
              )
              .catch((err) => console.error(err));

            //Message to mod
            msg.reply({
              content: `${bossShortName} has been unspawned.`,
            });

            //Logs channel message
            sendModLog(
              msg.client,
              msg.channel,
              `${bossShortName}-Unspawned`,
              msg.author
            );

            Logger.info(`${bossShortName} unspawned by ${msg.author.tag}.`);

            //Remove boss from active boss list
            activeBosses.splice(i, 1);
            unspawned = true;

            break;
          }
        }

        if (!unspawned) msg.reply({ content: "That boss is not active." });
      }
    }
  },
};
