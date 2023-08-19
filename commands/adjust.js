const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { adjustClearTime } = require("../queries/updateClearTime");
dayjs.extend(utc);

module.exports = {
  name: "adjust",
  description:
    "Adjust a bosses clear time and window timer. Syntax: `!adjust <bossShortName> <killTime>`",
  guildOnly: true,
  async execute(msg, args) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        if (args.length === 2) {
          const time = dayjs(args[1]).utc();

          try {
            await adjustClearTime(args[0], time);
            msg.reply(
              `${args[0]} clear time adjusted to \`${time.format(
                "YYYY/MM/DD HH:mm:ss"
              )}\``
            );

            console.log(
              `[${dayjs().utc().format("HH:mm:ss")}][LOG] ${
                args[0]
              } adjusted to '${time.format("YYYY/MM/DD HH:mm:ss")}' by ${
                msg.author.tag
              }`
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
};
