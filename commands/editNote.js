const { sendModLog } = require("../utils/sendModLog");
const { findBossByAlias } = require("../boss-handler/findBossByAlias");
const { setBossNote } = require("../queries/bossQueries");
const Logger = require("../utils/logger");

module.exports = {
  name: "editnote",
  description:
    "Edit a boss's note that is sent along side the status chart. Syntax: `!editnote <alias> [...note]`",
  guildOnly: true,
  role: [process.env.MOD_ROLE_ID],
  async execute(msg) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      const [_cmdName, ...args] = msg.content.trim().split(/\s+/);

      if (args.length < 1) {
        await msg.reply({
          content: `Expected 1 argument, got ${args.length}. Syntax: \`!editnote <alias> [...note]\``,
        });
        return;
      }

      const alias = args.shift();
      const note = args.join(" ").replace("\\n", "\n");
      const { boss } = await findBossByAlias(alias);

      if (!boss) {
        await msg.reply({
          content: `No boss with alias \`${alias}\` found.`,
        });
        return;
      }

      try {
        await setBossNote(boss.id, note);

        await msg.reply({
          content: `${boss.shortName}'s note has been edited.`,
        });
        sendModLog(
          msg.client,
          msg.channel,
          `${boss.shortName}-Note-Edit`,
          msg.author,
          `\`${note}\``
        );
        return;
      } catch (err) {
        Logger.error(err);
      }
    }
  },
};
