const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = {
  name: "help",
  description: "A list of bot commands.",
  guildOnly: true,
  execute(msg) {
    if (msg.channelId === process.env.MOD_CHANNEL_ID) {
      if (msg.member?.roles.cache.has(process.env.MOD_ROLE_ID)) {
        let commandList = "**List of Commands:**\n";

        msg.client.commands.forEach((command) => {
          commandList += `■ !${command.name} - ${command.description}\n`;
        });

        msg.channel.send({ content: commandList });
      }
    }
  },
};
