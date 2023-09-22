const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

function logger(type, message) {
  const currentTime = dayjs().utc().format("HH:mm:ss.SSS");

  console.log(`[${currentTime}][${type}] ${message}`);
}

module.exports = {
  logger,
};
