const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { config } = require("../config");
const { setPostMaintWindow } = require("../queries/bossQueries");
const { updateMaintenanceEnd } = require("../queries/setConfig");
dayjs.extend(utc);

module.exports = {
  name: "adjustmaint",
  description:
    "Adjust a maintenance's end time. Syntax: `!adjustmaint <endTime>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        if (args.length === 1) {
          //Validation
          if (!dayjs(args[0]).isValid()) {
            msg.reply(
              `Invalid time string provided. Current time string: \`${dayjs()
                .utc()
                .toISOString()}\``
            );

            return;
          }

          const endTime = dayjs(args[0]).utc();

          try {
            const newConfig = await updateMaintenanceEnd(endTime.toDate());

            if (newConfig.isMaintenance) await setPostMaintWindow(args[0]);

            config[0] = newConfig;

            msg.reply(
              `Maintenance adjusted to end at \`${endTime.toISOString()}\`.`
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
};
