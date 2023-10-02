const { SlashCommandBuilder } = require("discord.js");
const { activeBosses } = require("../boss-handler/activeBosses");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { logger } = require("../utils/logger");
dayjs.extend(utc);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear an active boss")
    .addStringOption((option) =>
      option
        .setName("boss")
        .setDescription("Boss to clear")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const alias = interaction.options.getString("boss");
    let cleared = false;

    //Loop through the current active bosses to find the user specified boss.
    for (let i = 0; i < activeBosses.length; i++) {
      const bossRegex = RegExp(`${activeBosses[i].bossInfo.aliases}`);

      if (bossRegex.test(alias)) {
        cleared = true;

        //Clear the boss if it is a field boss.
        if (!activeBosses[i].bossInfo.isWorldBoss) {
          const bossName = activeBosses[i].bossInfo.shortName;

          if (activeBosses[i].forceClearTask) {
            activeBosses[i].forceClearTask.stop();
          }

          activeBosses[i].clearBoss("manual");

          if (!activeBosses[i].isHidden) activeBosses[i].deleteLastMessage();

          //Send log to #logs
          interaction.client.channels
            .fetch(process.env.LOG_CHANNEL_ID)
            .then((c) => {
              c.send({
                content: `\`${dayjs().utc().toISOString()}\` <#${
                  interaction.channel.id
                }> \`${bossName}-Cleared\` <@${interaction.member.user.id}>`,
              });
            });

          logger(
            "LOG",
            `${bossName} cleared by ${interaction.member.user.tag}`
          );

          //Remove boss from the array
          activeBosses.splice(i, 1);

          await interaction.reply({ content: `${bossName} cleared` });

          return;
        } else {
          await interaction.reply({
            content: `Only field bosses can be cleared. For world bosses, call them dead or despawned in <#${process.env.STATUS_CHANNEL_ID}>`,
            ephemeral: true,
          });

          return;
        }
      }
    }

    if (!cleared) {
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
