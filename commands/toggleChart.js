const { activeBosses } = require("../boss-handler/activeBosses");
const { sendModLog } = require("../utils/sendModLog");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
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
          const bossRegex = new RegExp(`${boss.bossInfo.aliases}`, "iu");

          if (bossRegex.test(alias)) {
            //Toggle Chart
            const toggleType = boss.toggleChart();
            msg.reply({
              content: `${boss.bossInfo.shortName}'s chart has been ${
                toggleType ? "hidden" : "unhidden"
              }.`,
            });

            //Send log to #logs
            sendModLog(
              msg.client,
              msg.channel,
              `${boss.bossInfo.shortName}-${
                toggleType ? "Hidden" : "Unhidden"
              }`,
              msg.author
            );

            Logger.info(
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
