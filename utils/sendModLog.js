const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function sendModLog(client, channel, log, user, note) {
  const currentTime = dayjs().utc().toISOString();
  const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
  const shouldMention = logChannel.permissionsFor(user).has("ViewChannel")
    ? false
    : true;

  await logChannel.send({
    content: `\`${currentTime}\` ${channel} ${
      shouldMention ? user : `${user.username} *${user.id}*`
    } \`${log}\` ${note ? `\`${note}\`` : ""}`,
  });
}

module.exports = {
  sendModLog,
};
