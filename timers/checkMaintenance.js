const { config } = require("./config");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
const { updateIsMaintenance } = require("../queries/setConfig");
dayjs.extend(utc);
dayjs.extend(duration);

async function checkMaintenanceMode() {
  if (!config[0].isMaintenance && config[0].nextMaintenance) {
    const maintStart = dayjs(config[0].nextMaintenance).utc();
    const maintEnd = maintStart.add(config[0].maintenanceLength, "minutes");
    const timeNow = dayjs().utc();

    //check if now is between maint start and end
    if (timeNow.isAfter(maintStart) && timeNow.isBefore(maintEnd)) {
      await updateIsMaintenance(true, maintEnd);
      config[0].isMaintenance = true;
    }
  } else if (config[0].isMaintenance && config[0].nextMaintenance) {
    const maintStart = dayjs(config[0].nextMaintenance).utc();
    const maintEnd = maintStart.add(config[0].maintenanceLength, "minutes");
    const timeNow = dayjs().utc();

    if (timeNow.isAfter(maintEnd)) {
      await updateIsMaintenance(false, false);
      config[0].isMaintenance = false;
      config[0].nextMaintenance = null;
      config[0].maintenanceLength = null;
    }
  }

  return config;
}

module.exports = { checkMaintenanceMode };
