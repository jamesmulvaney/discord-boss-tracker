const colors = require("@colors/colors");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = class Logger {
  static time() {
    return dayjs().utc().format("HH:mm:ss.SSS");
  }

  static log(message) {
    console.log(`[${this.time()}] LOG | ${message}`.gray);
  }

  static info(message) {
    console.log(`[${this.time()}] INFO | ${message}`.brightBlue);
  }

  static debug(message) {
    console.log(`[${this.time()}] DEBUG | ${message}`.cyan);
  }

  static warn(message) {
    console.log(`[${this.time()}] WARN | ${message}`.yellow);
  }

  static error(err) {
    const message = err.message || err || "Unknown error occured";

    console.error(`[${this.time()}] ERROR | ${message}`.red);
  }
};
