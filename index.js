const dotenv = require("dotenv");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");

//Load environment variables
dotenv.config();

//Set Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

//Create Collections
client.commands = new Collection();
client.slashCommands = new Collection();

//Load handlers
const handlersDir = join(__dirname, "./handlers");
const handlersDirFiles = readdirSync(handlersDir).filter((file) =>
  file.endsWith(".js")
);

for (const file of handlersDirFiles) {
  require(`${handlersDir}/${file}`)(client);
}

//Connect to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
