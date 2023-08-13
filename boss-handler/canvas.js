const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const { parseCanvasTime } = require("./parseUptime");
const { staticChannelList } = require("../queries/getChannelList");

//Generate a blank chart on bot startup
async function getFieldBossChart() {
  const channels = await staticChannelList;

  const canvas = createCanvas(468, 165);
  const ctx = canvas.getContext("2d");

  //Background Rectangle
  ctx.fillStyle = "#313338";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Channel Numbers
  ctx.font = "bold 16px Roboto";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("1", 10, 30);
  ctx.fillText("2", 10, 55);
  ctx.fillText("3", 10, 80);
  ctx.fillText("4", 10, 105);
  ctx.fillText("5", 10, 130);
  ctx.fillText("6", 10, 155);

  //Channel Names
  ctx.font = "bold 16px Roboto";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(channels[0].name.slice(0, 3).toLocaleUpperCase(), 48, 10);
  ctx.fillText(channels[6].name.slice(0, 3).toLocaleUpperCase(), 114, 10);
  ctx.fillText(channels[12].name.slice(0, 3).toLocaleUpperCase(), 178, 10);
  ctx.fillText(channels[18].name.slice(0, 3).toLocaleUpperCase(), 242, 10);
  ctx.fillText(channels[24].name.slice(0, 3).toLocaleUpperCase(), 308, 10);
  ctx.fillText(channels[32].name.slice(0, 3).toLocaleUpperCase(), 370, 10);
  ctx.fillText(channels[40].name.slice(0, 3).toLocaleUpperCase(), 434, 10);

  return canvas.toBuffer();
}

const fieldBossChart = getFieldBossChart();

/*
  Returns a cell color depending on the boss' health
  Green < 75
  Yellow >= 75 && < 50
  Orange >= 50 && < 25
  Red >= 25 && < 0
  Grey = 0
*/
function getFillColor(health, timeInSeconds) {
  const healthAsInt = parseInt(health);

  if (health === "??") {
    return "#487388";
  } else if (health === "Dead" || health === "Desp") {
    return "#616264";
  } else if (health === "DNS") {
    return "#3d3e40";
  } else if (timeInSeconds <= 60) {
    if (healthAsInt > 75) {
      return "#41a54a";
    } else if (healthAsInt <= 75 && healthAsInt > 50) {
      return "#eee369";
    } else if (healthAsInt <= 50 && healthAsInt > 25) {
      return "#da8b3c";
    } else if (healthAsInt <= 25 && healthAsInt > 0) {
      return "#921c1c";
    }
  } else {
    if (healthAsInt > 75) {
      return "#3d8146";
    } else if (healthAsInt <= 75 && healthAsInt > 50) {
      return "#a59f58";
    } else if (healthAsInt <= 50 && healthAsInt > 25) {
      return "#a4703d";
    } else {
      return "#6d2729";
    }
  }
}

/* 
  Create a chart using node-canvas to send in #boss-status
  World boss and field boss have different charts
*/
async function createChart(boss) {
  if (boss.isWorldBoss) {
    //World Boss Chart
    const canvas = createCanvas(65, 45);
    const ctx = canvas.getContext("2d");
    const bg = await loadImage("./assets/world-boss-chart.png");
    const [timeInSeconds, formattedTime] = parseCanvasTime(
      boss.status[0].updated
    );

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getFillColor(boss.status[0].currentHealth, timeInSeconds);
    ctx.fillRect(2, 22, 60, 20);
    ctx.font = "normal 12px Roboto";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";
    if (
      boss.status[0].currentHealth === "??" ||
      boss.status[0].currentHealth === "Desp" ||
      boss.status[0].currentHealth === "Dead"
    ) {
      ctx.fillText(`${boss.status[0].currentHealth}`, 3, 36);
    } else {
      ctx.fillText(`${boss.status[0].currentHealth}%`, 3, 36);
    }
    ctx.textAlign = "end";
    ctx.fillText(`${formattedTime}`, 61, 36);

    return new AttachmentBuilder(canvas.toBuffer(), {
      name: `${boss.name}.png`,
    });
  } else {
    //Field Boss Chart
    const canvas = createCanvas(468, 165);
    const ctx = canvas.getContext("2d");
    const bg = await loadImage(await fieldBossChart);

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    let col = 0;
    let row = 0;
    boss.status.forEach((b) => {
      const xPos = 20 + 64 * col;
      const yPos = 20 + (20 * row + 5 * row);

      if (b.channel.isArsha) {
        ctx.fillStyle = "#3d3e40";
        ctx.fillRect(xPos, yPos, 60, 20);
        ctx.font = "normal 12px Roboto";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        ctx.fillText(`DNS`, xPos + 1, yPos + 14);
      } else {
        const [timeInSeconds, formattedTime] = parseCanvasTime(b.updated);

        ctx.fillStyle = getFillColor(b.currentHealth, timeInSeconds);
        ctx.fillRect(xPos, yPos, 60, 20);
        ctx.font = "normal 12px Roboto";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        if (
          b.currentHealth === "??" ||
          b.currentHealth === "Desp" ||
          b.currentHealth === "Dead" ||
          b.currentHealth === "DNS"
        ) {
          ctx.fillText(`${b.currentHealth}`, xPos + 1, yPos + 14);
        } else {
          ctx.fillText(`${b.currentHealth}%`, xPos + 1, yPos + 14);
        }
        ctx.textAlign = "end";
        ctx.fillText(`${formattedTime}`, xPos + 59, yPos + 14);
      }

      //6 channels per channel group
      if (row + 1 === 6) {
        row = 0;
        col++;
      } else {
        row++;
      }
    });

    return new AttachmentBuilder(canvas.toBuffer(), {
      name: `${boss.name}.png`,
    });
  }
}

module.exports = { createChart };
