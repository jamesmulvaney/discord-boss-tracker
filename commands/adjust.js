const { findBossByAlias } = require("../boss-handler/findBossByAlias");
const { setWindowTimes } = require("../queries/bossQueries");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  name: "adjust",
  description:
    "Adjust a bosses clear time and window timer. Syntax: `!adjust <bossAlias> <killTime>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        if (args.length === 2) {
          //Validation
          if (!dayjs(args[1]).isValid()) {
            msg.reply(
              `Invalid time string provided. Current time string: \`${dayjs()
                .utc()
                .toISOString()}\``
            );

            return;
          }

          const time = dayjs(args[1]).utc();
          const { boss, isActive } = await findBossByAlias(args[0]);

          if (!boss) return;
          if (isActive) {
            msg.reply(
              `${boss.shortName} is currently active. You cannot adjust an active boss.`
            );
            return;
          }

          try {
            await setWindowTimes(boss.shortName, boss.windowCooldown, time);

            msg.reply(
              `${boss.shortName} clear time adjusted to \`${time.format(
                "YYYY/MM/DD HH:mm:ss"
              )}\``
            );

            Logger.info(
              `${
                boss.shortName
              } clear time adjusted to ${time.toISOString()} by ${
                msg.author.tag
              }.`
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
};
