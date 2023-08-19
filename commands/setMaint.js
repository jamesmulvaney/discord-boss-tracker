const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { updateMaintenanceTime } = require("../queries/setConfig");
const { config } = require("../timers/config");
dayjs.extend(utc);

module.exports = {
  name: "setmaint",
  description: "Set maintenance time. Syntax: `!setmaint <startTime> <length>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        if (args.length === 2) {
          const time = dayjs(args[0]).utc();

          try {
            const newConfig = await updateMaintenanceTime(
              time.toDate(),
              parseInt(args[1])
            );
            config.pop();
            config.push(newConfig);
            msg.reply(
              `Maintenance set. Starting \`${time}\` and lasting for \`${args[1]} minutes\`.`
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
};
