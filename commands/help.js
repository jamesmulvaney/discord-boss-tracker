const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  name: "help",
  description: "A list of bot commands.",
  guildOnly: true,
  role: "mod",
  execute(msg) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      let commandList = "**List of Commands:**\n";

      msg.client.commands.forEach((command) => {
        commandList += `■ !${command.name} - ${command.description}\n`;
      });

      msg.channel.send({ content: commandList });
    }
  },
};
