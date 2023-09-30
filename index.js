const dotenv = require("dotenv");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const { checkMessage } = require("./boss-handler/handleMessages");
const {
  scheduleNotification,
} = require("./boss-schedule/scheduleNotification");
const { timersMessage } = require("./timers/timersMessage");
const { config } = require("./config");
const { getConfig } = require("./queries/getConfig");
const Logger = require("./utils/logger");

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

//Load Commands
client.commands = new Collection();
const commandFiles = readdirSync("./commands/").filter((f) =>
  f.endsWith(".js")
);

for (const f of commandFiles) {
  const command = require(`./commands/${f}`);

  client.commands.set(command.name, command);
}

//Bot Loaded
client.once(Events.ClientReady, async (c) => {
  Logger.log("BDO Boss Tracker started successfully!");
  Logger.log(`Logged in as ${c.user.tag}`);
  config.push(await getConfig());
  await scheduleNotification(client);
  await timersMessage(client);

  client.channels.fetch(process.env.MOD_CHANNEL_ID).then((channel) => {
    channel.send({ content: "Bot online and ready!" });
  });
});

//Reconnect
client.on(Events.ShardReconnecting, () => {
  Logger.warn("Reconnecting to Discord...");
});

//Command Listener
const PREFIX = "!";
client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const [commandName, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      command.execute(message, args);
    } catch (err) {
      console.error(err);
      message.reply({
        content: `Error running command "${commandName}"`,
      });
    }
  }

  if (message.channelId === process.env.STATUS_CHANNEL_ID) {
    checkMessage(message);
  }
});

client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  if (newMessage.author.bot) return;

  if (newMessage.channelId === process.env.STATUS_CHANNEL_ID) {
    checkMessage(newMessage);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
