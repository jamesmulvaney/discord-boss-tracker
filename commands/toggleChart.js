const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { activeBosses } = require("../boss-handler/activeBosses");
const { logger } = require("../utils/logger");
dayjs.extend(utc);

module.exports = {
  name: "togglechart",
  description:
    "Hide or unhide a boss chart. Syntax: `!togglechart <bossAlias>`",
  guildOnly: true,
  execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        const alias = args.join(" ");
        let toggled = false;

        for (boss of activeBosses) {
          const bossRegex = RegExp(`${boss.aliases}`);

          if (bossRegex.test(alias)) {
            //Toggle Chart
            const toggleType = boss.toggleChart();
            msg.reply({
              content: `${boss.bossInfo.shortName}'s chart has been ${
                toggleType ? "hidden" : "unhidden"
              }.`,
            });

            //Send log to #logs
            msg.client.channels.fetch(process.env.LOG_CHANNEL_ID).then((c) => {
              c.send({
                content: `\`${dayjs().utc().toISOString()}\` <#${
                  msg.channel.id
                }> \`${boss.bossInfo.shortName}-${
                  toggleType ? "Hidden" : "Unhidden"
                }\` <@${msg.author.id}>`,
              });
            });

            logger(
              "LOG",
              `${boss.bossInfo.shortName} chart ${
                toggleType ? "hidden" : "unhidden"
              } by ${msg.author.tag}.`
            );

            toggled = true;
            break;
          }
        }

        if (!toggled) {
          msg.reply({
            content: "That boss is not active.",
          });
        }
      }
    }
  },
};
