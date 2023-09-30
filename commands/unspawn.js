const { activeBosses } = require("../boss-handler/activeBosses");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const Logger = require("../utils/logger");
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
          const bossRegex = RegExp(`${activeBosses[i].bossInfo.aliases}`);

          if (bossRegex.test(alias)) {
            bossName = activeBosses[i].bossInfo.shortName;
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
              content: `${bossName} has been unspawned.`,
            });

            //Logs channel message
            msg.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) =>
              c.send({
                content: `\`${dayjs().utc().toISOString()}\` <#${
                  process.env.MOD_CHANNEL_ID
                }> \`${bossName}-Unspawned\` <@${msg.author.id}>`,
              })
            );

            Logger.info(`${bossName} unspawned by ${msg.author.tag}.`);

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
