const { SlashCommandBuilder } = require("discord.js");
const {
  setMaintenanceTime,
  updateMaintenanceEnd,
} = require("../queries/setConfig");
const { setPostMaintWindow } = require("../queries/bossQueries");
const { config } = require("../config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maint")
    .setDescription("Add or adjust maintenance times.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add maintenance times")
        .addStringOption((option) =>
          option
            .setName("start")
            .setDescription("Start time in ISO format")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("end")
            .setDescription("End time in ISO format")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("adjust")
        .setDescription("Adjust maintenance end time")
        .addStringOption((option) =>
          option
            .setName("end")
            .setDescription("End time in ISO format")
            .setRequired(true)
        )
    )
    .setDMPermission(false),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "add") {
      const start = interaction.options.getString("start");
      const end = interaction.options.getString("end");

      //Date Validation
      if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
        await interaction.reply({
          content: `Invalid ISO time string provided. Current ISO time \`${dayjs()
            .utc()
            .toISOString()}\``,
          ephemeral: true,
        });

        return;
      }

      //Add times to db
      try {
        const newConfig = await setMaintenanceTime(
          dayjs(start).utc().toDate(),
          dayjs(end).utc().toDate()
        );

        config[0] = newConfig;

        await interaction.reply(
          `New maintenance added! Starting at \`${start}\` and ending at \`${end}\``
        );
      } catch (err) {
        console.error(err);
      }
    } else if (interaction.options.getSubcommand() === "adjust") {
      const end = interaction.options.getString("end");

      //Date Validation
      if (!dayjs(end).isValid()) {
        await interaction.reply({
          content: `Invalid ISO time string provided. Current ISO time \`${dayjs()
            .utc()
            .toISOString()}\``,
          ephemeral: true,
        });

        return;
      }

      //Only adjust if there is a scheduled maintenance
      if (!config[0].maintStart) {
        await interaction.reply({
          content: `There is no maintenance set. Use \`/maint add\` to add maintenance times.`,
          ephemeral: true,
        });

        return;
      }

      //Adjust maint times in db and also adjust boss timers if maint has already started
      try {
        const newConfig = await updateMaintenanceEnd(dayjs(end).utc().toDate());

        if (newConfig.isMaintenance) await setPostMaintWindow(end);

        config[0] = newConfig;

        await interaction.reply(`Maintenance adjusted to end at \`${end}\``);
      } catch (err) {
        console.error(err);
      }
    }
  },
};
