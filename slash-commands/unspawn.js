const { SlashCommandBuilder } = require("discord.js");
const { activeBosses } = require("../boss-handler/activeBosses");
const { sendModLog } = require("../utils/sendModLog");
const Logger = require("../utils/logger");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unspawn")
    .setDescription("Unspawn a false boss spawn")
    .addStringOption((option) =>
      option
        .setName("boss")
        .setDescription("Boss to unspawn")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const alias = interaction.options.getString("boss");
    let unspawned = false;

    //Loop through the current active bosses to find the user specified boss.
    for (let i = 0; i < activeBosses.length; i++) {
      const bossRegex = new RegExp(`${activeBosses[i].bossInfo.aliases}`, "iu");

      if (bossRegex.test(alias)) {
        const bossName = activeBosses[i].bossInfo.name;
        const bossShortName = activeBosses[i].bossInfo.shortName;
        activeBosses[i].isActive = false;
        activeBosses[i].deleteLastMessage();

        if (!activeBosses[i].isRevived) activeBosses[i].forceClearTask.stop();

        interaction.client.channels.cache
          .get(process.env.STATUS_CHANNEL_ID)
          .send({
            content: `:information_source: **${bossName}** was a false call and has been unspawned.`,
          })
          .catch((err) => Logger.error(err));

        //Send log to #logs
        sendModLog(
          interaction.client,
          interaction.channel,
          `${bossShortName}-Unspawned`,
          interaction.user
        );

        Logger.info(
          `${bossShortName} unspawned by ${interaction.member.user.tag}`
        );

        //Remove boss from the array
        activeBosses.splice(i, 1);
        unspawned = true;
        await interaction.reply({
          content: `${bossShortName} has been unspawned.`,
        });

        return;
      }
    }

    if (!unspawned) {
      await interaction.reply({
        content: "That boss is not active.",
        ephemeral: true,
      });
    }
  },
  async autocomplete(interaction) {
    const focus = interaction.options.getFocused();
    const choices = activeBosses.map((boss) => boss.bossInfo.shortName);
    const filtered = choices.filter((choice) => choice.startsWith(focus));

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice.toLowerCase() }))
    );
  },
};
