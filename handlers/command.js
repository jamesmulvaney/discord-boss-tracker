const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { logger } = require("../utils/logger");

module.exports = (client) => {
  const slashCommands = [];
  const normalCommands = [];

  const slashCommandsDir = join(__dirname, "../slash-commands");
  const normalCommandsDir = join(__dirname, "../commands");

  //Load slash commands
  const slashCommandsFiles = readdirSync(slashCommandsDir).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of slashCommandsFiles) {
    let command = require(`${slashCommandsDir}/${file}`);
    slashCommands.push(command);
    client.slashCommands.set(command.data.name, command);
  }

  //Load normal commands
  const normalCommandsFiles = readdirSync(normalCommandsDir).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of normalCommandsFiles) {
    let command = require(`${normalCommandsDir}/${file}`);
    normalCommands.push(command);
    client.commands.set(command.name, command);
  }

  //Register slash commands
  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN
  );

  rest
    .put(Routes.applicationCommands(process.env.BOT_AUTHOR_ID), {
      body: slashCommands.map((command) => command.data.toJSON()),
    })
    .then((data) => {
      logger("LOG", `Loaded ${data.length} slash commands`);
      logger("LOG", `Loaded ${normalCommands.length} commands`);
    })
    .catch((err) => {
      logger("ERROR", `${err}`);
    });
};
