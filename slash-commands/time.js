const { SlashCommandBuilder } = require("discord.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Returns the current UTC time in ISO format.")
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.reply(`Current time: \`${dayjs().utc().toISOString()}\``);
  },
};
