const { config } = require("./config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
const { updateIsMaintenance } = require("../queries/setConfig");
dayjs.extend(utc);
dayjs.extend(duration);

async function checkMaintenanceMode() {
  if (!config[0].isMaintenance && config[0].maintStart) {
    const maintStart = dayjs(config[0].maintStart).utc();
    const maintEnd = dayjs(config[0].maintEnd).utc();
    const timeNow = dayjs().utc();

    //check if now is between maint start and end
    if (timeNow.isAfter(maintStart) && timeNow.isBefore(maintEnd)) {
      await updateIsMaintenance(true, maintStart, maintEnd);
      config[0].isMaintenance = true;
    }
  } else if (config[0].isMaintenance && config[0].maintStart) {
    const maintEnd = dayjs(config[0].maintEnd).utc();
    const timeNow = dayjs().utc();

    if (timeNow.isAfter(maintEnd)) {
      await updateIsMaintenance(false, false);
      config[0].isMaintenance = false;
      config[0].maintStart = null;
      config[0].maintEnd = null;
    }
  }

  return config;
}

module.exports = { checkMaintenanceMode };
