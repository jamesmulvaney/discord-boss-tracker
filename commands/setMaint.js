const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { updateMaintenanceTime } = require("../queries/setConfig");
const { config } = require("../timers/config");
dayjs.extend(utc);

module.exports = {
  name: "setmaint",
  description:
    "Set maintenance time. Syntax: `!setmaint <startTime> <endTime>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        if (args.length === 2) {
          const startTime = dayjs(args[0]).utc();
          const endTime = dayjs(args[1]).utc();

          try {
            const newConfig = await updateMaintenanceTime(
              startTime.toDate(),
              endTime.toDate()
            );
            config.pop();
            config.push(newConfig);
            msg.reply(
              `Maintenance set. Starting \`${startTime.toISOString()}\` and ending \`${endTime.toISOString()}\`.`
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
};
