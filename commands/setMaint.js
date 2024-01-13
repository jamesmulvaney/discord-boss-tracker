const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { setMaintenanceTime } = require("../queries/setConfig");
const { config } = require("../config");
dayjs.extend(utc);

module.exports = {
  name: "setmaint",
  description:
    "Set maintenance time. Syntax: `!setmaint <startTime> <endTime>`",
  guildOnly: true,
  role: "mod",
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (args.length === 2) {
        //Validation
        if (!dayjs(args[0]).isValid() || !dayjs(args[1]).isValid()) {
          msg.reply(
            `Invalid time string provided. Current time string: \`${dayjs()
              .utc()
              .toISOString()}\``
          );

          return;
        }

        const startTime = dayjs(args[0]).utc();
        const endTime = dayjs(args[1]).utc();

        try {
          const newConfig = await setMaintenanceTime(
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
  },
};
