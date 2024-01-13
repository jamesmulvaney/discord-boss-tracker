const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { config } = require("../config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { prisma } = require("../db");
const Logger = require("../utils/logger");
dayjs.extend(utc);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modrole")
    .setDescription("Set which roles have moderation privileges for the bot.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a moderation role")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Moderator role")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a moderation role")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Moderator role")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    const role = interaction.options.getRole("role", true);

    if (interaction.options.getSubcommand() === "add") {
      //Check if role already has moderator privileges
      if (config[0].modRoles.includes(role.id)) {
        await interaction.reply({
          content: `\`${role.name}\` role already has moderation privileges.`,
          ephemeral: true,
        });
        return;
      }

      //Edit config and db
      config[0].modRoles.push(role.id);

      try {
        await prisma.config.update({
          where: { id: 1 },
          data: {
            modRoles: config[0].modRoles,
          },
        });

        await interaction.reply({
          content: `Granted moderation privileges to \`${role.name}\` role.`,
        });
      } catch (err) {
        Logger.error(err);
        await interaction.reply({
          content: `Error adding role to the database.`,
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "remove") {
      //Check if role has moderator privileges
      if (!config[0].modRoles.includes(role.id)) {
        await interaction.reply({
          content: `\`${role.name}\` role does not have moderation privileges.`,
          ephemeral: true,
        });
        return;
      }

      //Edit config and db
      config[0].modRoles = config[0].modRoles.filter(
        (modrole) => modrole !== role.id
      );

      try {
        await prisma.config.update({
          where: { id: 1 },
          data: {
            modRoles: config[0].modRoles,
          },
        });

        await interaction.reply({
          content: `Revoked moderation privileges from \`${role.name}\` role.`,
        });
      } catch (err) {
        console.log(err);
        await interaction.reply({
          content: `Error removing role from the database.`,
          ephemeral: true,
        });
      }
    }
  },
};
