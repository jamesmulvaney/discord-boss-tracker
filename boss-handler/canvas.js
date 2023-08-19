const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const { parseCanvasTime } = require("./parseUptime");
const { staticChannelList } = require("../queries/getChannelList");

//Generate a blank chart on bot startup
async function getFieldBossChart() {
  const channelList = await staticChannelList;

  const canvas = createCanvas((channelList.length / 6) * 64 + 20, 165);
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

  //Support for if they add more channels in the future
  let channelPos = 0;
  for (let i = 0; i <= channelList.length - 1; i = i + 6) {
    ctx.fillText(
      channelList[i].name.slice(0, 3).toLocaleUpperCase(),
      48 + 64 * channelPos,
      10
    );
    channelPos++;
  }

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
  Dark Grey = Did not spawn
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
  if (boss.bossInfo.isWorldBoss) {
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
      name: `${boss.bossInfo.name}.png`,
    });
  } else {
    //Field Boss Chart
    const channelList = await staticChannelList;
    const canvas = createCanvas((channelList.length / 6) * 64 + 20, 165);
    const ctx = canvas.getContext("2d");
    const bg = await loadImage(await fieldBossChart);

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    let col = 0;
    let row = 0;
    for (const status of boss.status) {
      const xPos = 20 + 64 * col;
      const yPos = 20 + (20 * row + 5 * row);

      if (status.channel.isArsha) {
        ctx.fillStyle = "#3d3e40";
        ctx.fillRect(xPos, yPos, 60, 20);
        ctx.font = "normal 12px Roboto";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        ctx.fillText(`DNS`, xPos + 1, yPos + 14);
      } else {
        const [timeInSeconds, formattedTime] = parseCanvasTime(status.updated);

        ctx.fillStyle = getFillColor(status.currentHealth, timeInSeconds);
        ctx.fillRect(xPos, yPos, 60, 20);
        ctx.font = "normal 12px Roboto";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        if (
          status.currentHealth === "??" ||
          status.currentHealth === "Desp" ||
          status.currentHealth === "Dead" ||
          status.currentHealth === "DNS"
        ) {
          ctx.fillText(`${status.currentHealth}`, xPos + 1, yPos + 14);
        } else {
          ctx.fillText(`${status.currentHealth}%`, xPos + 1, yPos + 14);
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
    }

    return new AttachmentBuilder(canvas.toBuffer(), {
      name: `${boss.bossInfo.name}.png`,
    });
  }
}

module.exports = { createChart };
