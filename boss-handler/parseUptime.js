const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
dayjs.extend(utc);
dayjs.extend(duration);

function parseUptime(time) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  let formattedTime;

  if (currTime.diff(startTime, "seconds") <= 59) {
    formattedTime = `${currTime.diff(startTime, "seconds")}s`;
  } else if (
    currTime.diff(startTime, "seconds") >= 60 &&
    currTime.diff(startTime, "seconds") <= 3600
  ) {
    formattedTime = dayjs.duration(currTime.diff(startTime)).format("m[m]s[s]");
  } else {
    formattedTime = dayjs
      .duration(currTime.diff(startTime))
      .format("H[h]m[m]s[s]");
  }

  return formattedTime;
}

function parseElapsed(time) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  let formattedTime;

  if (currTime.diff(startTime, "seconds") <= 59) {
    formattedTime = `${currTime.diff(startTime, "seconds")}s`;
  } else if (
    currTime.diff(startTime, "seconds") >= 60 &&
    currTime.diff(startTime, "seconds") <= 3600
  ) {
    formattedTime = dayjs.duration(currTime.diff(startTime)).format("m[m]");
  } else if (
    currTime.diff(startTime, "seconds") >= 3600 &&
    currTime.diff(startTime, "seconds") < 86400
  ) {
    formattedTime = dayjs.duration(currTime.diff(startTime)).format("H[h]m[m]");
  } else {
    formattedTime = dayjs
      .duration(currTime.diff(startTime))
      .format("D[d]H[h]m[m]");
  }

  return formattedTime;
}

function parseForceDespawnTime(time, forceDespawnTime) {
  const startTime = dayjs(time).utc();
  const endTime = startTime.add(forceDespawnTime, "minutes");
  let formattedTime;

  if (endTime.diff(startTime, "seconds") < 3600) {
    formattedTime = dayjs.duration(endTime.diff(startTime)).format("m[m]s[s]");
  } else {
    formattedTime = dayjs
      .duration(endTime.diff(startTime))
      .format("H[h]m[m]s[s]");
  }

  return formattedTime;
}

function parseTimeUntil(time) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  let formattedTime;

  if (startTime.diff(currTime, "seconds") <= 59) {
    formattedTime = `${startTime.diff(currTime, "seconds")}s`;
  } else if (
    startTime.diff(currTime, "seconds") >= 60 &&
    startTime.diff(currTime, "seconds") < 3600
  ) {
    formattedTime = dayjs.duration(startTime.diff(currTime)).format("m[m]");
  } else if (
    startTime.diff(currTime, "seconds") >= 3600 &&
    startTime.diff(currTime, "seconds") < 86400
  ) {
    formattedTime = dayjs.duration(startTime.diff(currTime)).format("H[h]m[m]");
  } else if (
    startTime.diff(currTime, "seconds") >= 86400 &&
    startTime.diff(currTime, "seconds") < 604800
  ) {
    formattedTime = dayjs
      .duration(startTime.diff(currTime))
      .format("D[d]H[h]m[m]");
  }

  return formattedTime;
}

function parseCanvasTime(updateTime) {
  updateTime = dayjs(updateTime).utc();
  const currTime = dayjs().utc();
  let timeInSeconds;
  let formattedTime;

  if (currTime.diff(updateTime, "seconds") <= 59) {
    timeInSeconds = currTime.diff(updateTime, "seconds");
    formattedTime = timeInSeconds + "s";
  } else if (
    currTime.diff(updateTime, "seconds") >= 60 &&
    currTime.diff(updateTime, "seconds") <= 3600
  ) {
    timeInSeconds = dayjs.duration(
      dayjs(currTime, "DD/MM/YYYY HH:mm:ss").diff(
        dayjs(updateTime, "DD/MM/YYYY HH:mm:ss"),
        "seconds"
      ),
      "seconds"
    );
    formattedTime = timeInSeconds.format("m[m]");
  } else {
    timeInSeconds = dayjs.duration(
      dayjs(currTime, "DD/MM/YYYY HH:mm:ss").diff(
        dayjs(updateTime, "DD/MM/YYYY HH:mm:ss"),
        "seconds"
      ),
      "seconds"
    );
    formattedTime = timeInSeconds.format("H[h]");
  }

  return [timeInSeconds, formattedTime];
}

module.exports = {
  parseUptime,
  parseTimeUntil,
  parseCanvasTime,
  parseElapsed,
  parseForceDespawnTime,
};
