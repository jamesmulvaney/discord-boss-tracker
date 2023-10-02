const { readdirSync } = require("fs");
const { join } = require("path");
const Logger = require("../utils/logger");

module.exports = (client) => {
  const eventsPath = join(__dirname, "../events");
  const eventFiles = readdirSync(eventsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const event = require(`${eventsPath}/${file}`);

    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));
  }

  Logger.log(`Loaded ${eventFiles.length} events`);
};
