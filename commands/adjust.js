const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { adjustClearTime } = require("../queries/updateClearTime");
const { staticBossList } = require("../queries/getBossList");
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
          const bossList = await staticBossList;

          for (const boss of bossList) {
            const bossRegex = RegExp(`${boss.aliases}`);

            if (bossRegex.test(args[0])) {
              try {
                await adjustClearTime(boss.shortName, time);
                msg.reply(
                  `${boss.shortName} clear time adjusted to \`${time.format(
                    "YYYY/MM/DD HH:mm:ss"
                  )}\``
                );

                console.log(
                  `[${dayjs().utc().format("HH:mm:ss")}][LOG] ${
                    boss.shortName
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
      }
    }
  },
};
