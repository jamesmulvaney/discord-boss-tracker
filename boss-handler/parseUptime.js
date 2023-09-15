const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
dayjs.extend(utc);
dayjs.extend(duration);

function parseUptime(time, showSeconds) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  const duration = dayjs.duration(currTime.diff(startTime));
  let formattedTime = "";

  if (duration.hours() > 0) formattedTime += `${duration.hours()}h`;
  if (duration.minutes() > 0) formattedTime += `${duration.minutes()}m`;
  if (showSeconds) formattedTime += `${duration.seconds()}s`;

  return formattedTime;
}

function parseElapsed(time) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  const duration = dayjs.duration(currTime.diff(startTime));
  let formattedTime = "";

  if (duration.days() > 0) formattedTime += `${duration.days()}d`;
  if (duration.hours() > 0) formattedTime += `${duration.hours()}h`;
  formattedTime += `${duration.minutes()}m`;

  return formattedTime;
}

function parseForceDespawnTime(time, forceDespawnTime) {
  const startTime = dayjs(time).utc();
  const endTime = startTime.add(forceDespawnTime, "minutes");
  const duration = dayjs.duration(endTime.diff(startTime));
  let formattedTime = "";

  if (duration.hours() > 0) formattedTime += `${duration.hours()}h`;
  if (duration.minutes() > 0 || duration.asSeconds() >= 60)
    formattedTime += `${duration.minutes()}m`;
  formattedTime += `${duration.seconds()}s`;

  return formattedTime;
}

function parseTimeUntil(time) {
  const currTime = dayjs().utc();
  const startTime = dayjs(time).utc();
  const duration = dayjs.duration(startTime.diff(currTime));
  let formattedTime = "";

  if (duration.days() > 0) formattedTime += `${duration.days()}d`;
  if (duration.hours() > 0) formattedTime += `${duration.hours()}h`;
  formattedTime += `${duration.minutes()}m`;

  return formattedTime;
}

function parseCanvasTime(lastUpdate) {
  const updateTime = dayjs(lastUpdate).utc();
  const currTime = dayjs().utc();
  const duration = dayjs.duration(currTime.diff(updateTime));
  let timeInSeconds = duration.asSeconds();
  let formattedTime = "";

  if (duration.hours() > 0) {
    formattedTime += `${duration.hours()}h`;
  } else if (duration.hours() === 0 && duration.minutes() > 0) {
    formattedTime += `${duration.minutes()}m`;
  } else {
    formattedTime += `${duration.seconds()}s`;
  }

  return [timeInSeconds, formattedTime];
}

module.exports = {
  parseUptime,
  parseElapsed,
  parseTimeUntil,
  parseCanvasTime,
  parseForceDespawnTime,
};
