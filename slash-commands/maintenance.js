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
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Add or Adjust")
        .setRequired(true)
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Adjust", value: "adjust" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription("Start time in ISO format.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("end")
        .setDescription("End time in ISO format.")
        .setRequired(false)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const start = interaction.options.getString("start");
    const end = interaction.options.getString("end");

    //Validation
    //Both types require an end time
    if (!end) {
      await interaction.reply(
        `You must specify an end time when using \`${type}\``
      );

      return;
    }

    if (!dayjs(end).isValid()) {
      await interaction.reply(
        `Invalid ISO time string provided. Current ISO time \`${dayjs()
          .utc()
          .toISOString()}\``
      );

      return;
    }

    //Add or Adjust
    if (type === "add") {
      //Validation
      if (!start) {
        await interaction.reply(
          `You must specify a start time when using \`add\``
        );

        return;
      }

      if (!dayjs(start).isValid()) {
        await interaction.reply(
          `Invalid ISO time string provided. Current ISO time \`${dayjs()
            .utc()
            .toISOString()}\``
        );

        return;
      }

      //Add maint times to db
      try {
        const newConfig = await setMaintenanceTime(
          dayjs(start).utc().toDate(),
          dayjs(end).utc().toDate()
        );

        config[0] = newConfig;

        await interaction.reply(
          `Maintenance added. Starting at \`${start}\` and ending at \`${end}\``
        );
      } catch (err) {
        console.error(err);
      }
    } else if (type === "adjust") {
      //Validation
      if (!config[0].maintStart) {
        await interaction.reply(
          `There is no maintenance set. Use the \`add\` option to add maintenance times.`
        );

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
