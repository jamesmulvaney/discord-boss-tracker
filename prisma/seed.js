const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


//Seeds database with default bosses and channels
async function main() {
  const timeNow = dayjs().utc()
  const timeOpen = timeNow.add(6, 'hours').toDate()
  const timeClose = timeNow.add(12, 'hours').toDate()

  /* 
    World Bosses
  */

  //Karanda
  await prisma.boss.upsert({
    where: {
      name: "Karanda",
    },
    update: {},
    create: {
      name: "Karanda",
      shortName: "Karanda",
      aliases: "kara?n?d?a?",
      avatar: "https://i.imgur.com/BuqwiBY.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Kzarka
  await prisma.boss.upsert({
    where: {
      name: "Kzarka",
    },
    update: {},
    create: {
      name: "Kzarka",
      shortName: "Kzarka",
      aliases: "kza?r?k?a?|zk",
      avatar: "https://i.imgur.com/akeH7ea.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Nouver
  await prisma.boss.upsert({
    where: {
      name: "Nouver",
    },
    update: {},
    create: {
      name: "Nouver",
      shortName: "Nouver",
      aliases: "nouv?e?r?|nv",
      avatar: "https://i.imgur.com/pj2kSjc.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Kutum
  await prisma.boss.upsert({
    where: {
      name: "Kutum",
    },
    update: {},
    create: {
      name: "Kutum",
      shortName: "Kutum",
      aliases: "kut?u?m?",
      avatar: "https://i.imgur.com/FCiAaRZ.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Vell
  await prisma.boss.upsert({
    where: {
      name: "Vell",
    },
    update: {},
    create: {
      name: "Vell",
      shortName: "Vell",
      aliases: "vell",
      avatar: "https://i.imgur.com/uTgRStR.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 60,
      forceClearTime: 61,
      isUber: false,
    },
  });

  //Garmoth
  await prisma.boss.upsert({
    where: {
      name: "Garmoth",
    },
    update: {},
    create: {
      name: "Garmoth",
      shortName: "Garmoth",
      aliases: "garm?o?t?h?",
      avatar: "https://i.imgur.com/JS1Snpr.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Quint
  await prisma.boss.upsert({
    where: {
      name: "Quint",
    },
    update: {},
    create: {
      name: "Quint",
      shortName: "Quint",
      aliases: "quin?t?",
      avatar: "https://i.imgur.com/6ztVGTB.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 15,
      forceClearTime: 16,
      isUber: false,
    },
  });

  //Muraka
  await prisma.boss.upsert({
    where: {
      name: "Muraka",
    },
    update: {},
    create: {
      name: "Muraka",
      shortName: "Muraka",
      aliases: "mura?k?a?",
      avatar: "https://i.imgur.com/tzTpKF5.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 15,
      forceClearTime: 16,
      isUber: false,
    },
  });

  //Offin
  await prisma.boss.upsert({
    where: {
      name: "Offin Tett",
    },
    update: {},
    create: {
      name: "Offin Tett",
      shortName: "Offin",
      aliases: "offi?n?|tett|offin\\s?tett|ot",
      avatar: "https://i.imgur.com/b322UAS.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Bulgasal
  await prisma.boss.upsert({
    where: {
      name: "Bulgasal",
    },
    update: {},
    create: {
      name: "Bulgasal",
      shortName: "Bulgasal",
      aliases: "bulg?a?s?a?l?",
      avatar: "https://i.imgur.com/qdhwnne.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Uturi
  await prisma.boss.upsert({
    where: {
      name: "Uturi",
    },
    update: {},
    create: {
      name: "Uturi",
      shortName: "Uturi",
      aliases: "utur?i?",
      avatar: "https://i.imgur.com/25kTsf5.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Sangoon
  await prisma.boss.upsert({
    where: {
      name: "Sangoon",
    },
    update: {},
    create: {
      name: "Sangoon",
      shortName: "Sangoon",
      aliases: "sang?o?o?n?",
      avatar: "https://i.imgur.com/V1t0qZS.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  //Golden Pig King
  await prisma.boss.upsert({
    where: {
      name: "Pig",
    },
    update: {},
    create: {
      name: "Pig",
      shortName: "Golden Pig King",
      aliases: "pi?g|golde?n?|king|pig\\s?king",
      avatar: "https://i.imgur.com/DqXrZak.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: false,
    },
  });

  /* 
    Empowered World Bosses
  */

  //Stormbringer Karanda
  await prisma.boss.upsert({
    where: {
      name: "Stormbringer Karanda",
    },
    update: {},
    create: {
      name: "Stormbringer Karanda",
      shortName: "SBKaranda",
      aliases: "sbka?r?a?n?d?a?|stormb?r?i?n?g?e?r?",
      avatar: "https://i.imgur.com/L8CJQY0.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: true,
      uberOf: 1,
    },
  });

  //Nightmarish Kzarka
  await prisma.boss.upsert({
    where: {
      name: "Nightmarish Kzarka",
    },
    update: {},
    create: {
      name: "Nightmarish Kzarka",
      shortName: "NMKzarka",
      aliases: "nmkz?a?r?k?a?|nightm?a?r?e?",
      avatar: "https://i.imgur.com/LGMKP3X.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: true,
      uberOf: 2,
    },
  });

  //Bloodstorm Nouver
  await prisma.boss.upsert({
    where: {
      name: "Bloodstorm Nouver",
    },
    update: {},
    create: {
      name: "Bloodstorm Nouver",
      shortName: "BSNouver",
      aliases: "bsn?v?|bsn?o?u?v?e?r?|bloods?t?o?r?m?",
      avatar: "https://i.imgur.com/6le0FPP.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: true,
      uberOf: 3,
    },
  });

  //Thundercloud Kutum
  await prisma.boss.upsert({
    where: {
      name: "Thundercloud Kutum",
    },
    update: {},
    create: {
      name: "Thundercloud Kutum",
      shortName: "TCKutum",
      aliases: "tcku?t?u?m?|thunderc?l?o?u?d?",
      avatar: "https://i.imgur.com/02ayGyr.png",
      isWorldBoss: true,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 30,
      forceClearTime: 31,
      isUber: true,
      uberOf: 4,
    },
  });

  /* 
    Field Bosses
  */

  //Bheg
  await prisma.boss.upsert({
    where: {
      name: "Dastard Bheg",
    },
    update: {},
    create: {
      name: "Dastard Bheg",
      shortName: "Bheg",
      aliases: "dastard|bhe?g?|dastard\\s?bheg",
      avatar: "https://i.imgur.com/vxMKkKh.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 687,
      forceDespawnTime: 65,
      forceClearTime: 197,
    },
  });

  //Red Nose
  await prisma.boss.upsert({
    where: {
      name: "Red Nose",
    },
    update: {},
    create: {
      name: "Red Nose",
      shortName: "RedNose",
      aliases: "rd|nose|rn|red\\s?nose",
      avatar: "https://i.imgur.com/UczJEFQ.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 133,
      forceClearTime: 197,
    },
  });

  //Dim Tree
  await prisma.boss.upsert({
    where: {
      name: "Dim Tree",
    },
    update: {},
    create: {
      name: "Dim Tree",
      shortName: "Tree",
      aliases: "dim|tree?|dt|dim\\s?tree",
      avatar: "https://i.imgur.com/Ul1oao6.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 196,
      forceClearTime: 197,
    },
  });

  //Mudster
  await prisma.boss.upsert({
    where: {
      name: "Giant Mudster",
    },
    update: {},
    create: {
      name: "Giant Mudster",
      shortName: "Mudster",
      aliases: "giant|muds?t?e?r?|giant\\s?muds?t?e?r?",
      avatar: "https://i.imgur.com/FGPpI6D.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 655,
      forceDespawnTime: 65,
      forceClearTime: 131,
    },
  });

  //Katzvariak
  await prisma.boss.upsert({
    where: {
      name: "Katzvariak",
    },
    update: {},
    create: {
      name: "Katzvariak",
      shortName: "Katzvar",
      aliases: "katz?v?a?r?i?a?k?",
      avatar: "https://i.imgur.com/rW9EwBD.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 130,
      forceClearTime: 131,
    },
  });

  //Black Shadow
  await prisma.boss.upsert({
    where: {
      name: "Black Shadow",
    },
    update: {},
    create: {
      name: "Black Shadow",
      shortName: "Shadow",
      aliases: "(black)?\\s?sha?d?o?w?",
      avatar: "https://i.imgur.com/yUg6ej8.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 0,
      forceDespawnTime: 180,
      forceClearTime: 181,
    },
  });

  //Rawr-Rawr
  await prisma.boss.upsert({
    where: {
      name: "Rawr-Rawr",
    },
    update: {},
    create: {
      name: "Rawr-Rawr",
      shortName: "Rawr-Rawr",
      aliases: "rawr?|rr",
      avatar: "https://i.imgur.com/jQ15DzX.png",
      isWorldBoss: false,
      status: [{}],
      windowCooldown: 580,
      forceDespawnTime: 45,
      forceClearTime: 46,
    },
  });

  /* 
    Channels
  */

  //Kamasylvia
  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 1",
    },
    update: {},
    create: {
      name: "Kamasylvia 1",
      shortName: "K1",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 2",
    },
    update: {},
    create: {
      name: "Kamasylvia 2",
      shortName: "K2",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 3",
    },
    update: {},
    create: {
      name: "Kamasylvia 3",
      shortName: "K3",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 4",
    },
    update: {},
    create: {
      name: "Kamasylvia 4",
      shortName: "K4",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 5",
    },
    update: {},
    create: {
      name: "Kamasylvia 5",
      shortName: "K5",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Kamasylvia 6",
    },
    update: {},
    create: {
      name: "Kamasylvia 6",
      shortName: "K6",
      aliases: "k(?:a|am|ama|amas|amasy|amasyl|amasylv|amasylvi|amasylvia)?\\s?6",
      isArsha: false,
      isSeason: false,
    },
  });

  //Balenos
  await prisma.channel.upsert({
    where: {
      name: "Balenos 1",
    },
    update: {},
    create: {
      name: "Balenos 1",
      shortName: "B1",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Balenos 2",
    },
    update: {},
    create: {
      name: "Balenos 2",
      shortName: "B2",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Balenos 3",
    },
    update: {},
    create: {
      name: "Balenos 3",
      shortName: "B3",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Balenos 4",
    },
    update: {},
    create: {
      name: "Balenos 4",
      shortName: "B4",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Balenos 5",
    },
    update: {},
    create: {
      name: "Balenos 5",
      shortName: "B5",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Balenos 6",
    },
    update: {},
    create: {
      name: "Balenos 6",
      shortName: "B6",
      aliases: "b(?:a|al|ale|alen|aleno|alenos)?\\s?6",
      isArsha: false,
      isSeason: false,
    },
  });

  //Serendia
  await prisma.channel.upsert({
    where: {
      name: "Serendia 1",
    },
    update: {},
    create: {
      name: "Serendia 1",
      shortName: "Ser1",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Serendia 2",
    },
    update: {},
    create: {
      name: "Serendia 2",
      shortName: "Ser2",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Serendia 3",
    },
    update: {},
    create: {
      name: "Serendia 3",
      shortName: "Ser3",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Serendia 4",
    },
    update: {},
    create: {
      name: "Serendia 4",
      shortName: "Ser4",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Serendia 5",
    },
    update: {},
    create: {
      name: "Serendia 5",
      shortName: "Ser5",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Serendia 6",
    },
    update: {},
    create: {
      name: "Serendia 6",
      shortName: "Ser6",
      aliases: "ser(?:e|en|end|endi|endia)?\\s?6",
      isArsha: false,
      isSeason: false,
    },
  });

  //Calpheon
  await prisma.channel.upsert({
    where: {
      name: "Calpheon 1",
    },
    update: {},
    create: {
      name: "Calpheon 1",
      shortName: "C1",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Calpheon 2",
    },
    update: {},
    create: {
      name: "Calpheon 2",
      shortName: "C2",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Calpheon 3",
    },
    update: {},
    create: {
      name: "Calpheon 3",
      shortName: "C3",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Calpheon 4",
    },
    update: {},
    create: {
      name: "Calpheon 4",
      shortName: "C4",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Calpheon 5",
    },
    update: {},
    create: {
      name: "Calpheon 5",
      shortName: "C5",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Calpheon 6",
    },
    update: {},
    create: {
      name: "Calpheon 6",
      shortName: "C6",
      aliases: "c(?:a|al|alp|alph|alphe|alpheo|alpheon)?\\s?6",
      isArsha: true,
      isSeason: false,
    },
  });

  //Mediah
  await prisma.channel.upsert({
    where: {
      name: "Mediah 1",
    },
    update: {},
    create: {
      name: "Mediah 1",
      shortName: "M1",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Mediah 2",
    },
    update: {},
    create: {
      name: "Mediah 2",
      shortName: "M2",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Mediah 3",
    },
    update: {},
    create: {
      name: "Mediah 3",
      shortName: "M3",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Mediah 4",
    },
    update: {},
    create: {
      name: "Mediah 4",
      shortName: "M4",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Mediah 5",
    },
    update: {},
    create: {
      name: "Mediah 5",
      shortName: "M5",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Mediah 6",
    },
    update: {},
    create: {
      name: "Mediah 6",
      shortName: "M6",
      aliases: "m(?:e|ed|edi|edia|ediah)?\\s?6",
      isArsha: true,
      isSeason: false,
    },
  });

  //Valencia
  await prisma.channel.upsert({
    where: {
      name: "Valencia 1",
    },
    update: {},
    create: {
      name: "Valencia 1",
      shortName: "V1",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?1",
      isArsha: true,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Valencia 2",
    },
    update: {},
    create: {
      name: "Valencia 2",
      shortName: "V2",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?2",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Valencia 3",
    },
    update: {},
    create: {
      name: "Valencia 3",
      shortName: "V3",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?3",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Valencia 4",
    },
    update: {},
    create: {
      name: "Valencia 4",
      shortName: "V4",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?4",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Valencia 5",
    },
    update: {},
    create: {
      name: "Valencia 5",
      shortName: "V5",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?5",
      isArsha: false,
      isSeason: false,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Valencia 6",
    },
    update: {},
    create: {
      name: "Valencia 6",
      shortName: "V6",
      aliases: "v(?:a|al|ale|alen|alenc|alenci|alencia)?\\s?6",
      isArsha: false,
      isSeason: false,
    },
  });

  //Season
  await prisma.channel.upsert({
    where: {
      name: "Season 1",
    },
    update: {},
    create: {
      name: "Season 1",
      shortName: "Sea1",
      aliases: "sea(?:s|so|son)?\\s?1",
      isArsha: false,
      isSeason: true,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Season 2",
    },
    update: {},
    create: {
      name: "Season 2",
      shortName: "Sea2",
      aliases: "sea(?:s|so|son)?\\s?2",
      isArsha: false,
      isSeason: true,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Season 3",
    },
    update: {},
    create: {
      name: "Season 3",
      shortName: "Sea3",
      aliases: "sea(?:s|so|son)?\\s?3",
      isArsha: false,
      isSeason: true,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Season 4",
    },
    update: {},
    create: {
      name: "Season 4",
      shortName: "Sea4",
      aliases: "sea(?:s|so|son)?\\s?4",
      isArsha: false,
      isSeason: true,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Season 5",
    },
    update: {},
    create: {
      name: "Season 5",
      shortName: "Sea5",
      aliases: "sea(?:s|so|son)?\\s?5",
      isArsha: false,
      isSeason: true,
    },
  });

  await prisma.channel.upsert({
    where: {
      name: "Season 6",
    },
    update: {},
    create: {
      name: "Season 6",
      shortName: "Sea6",
      aliases: "sea(?:s|so|son)?\\s?6",
      isArsha: false,
      isSeason: true,
    },
  });

  //Config
  await prisma.config.create({
    data: {
      isMaintenance: false,
      isSeason: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
