const { PrismaClient } = require("@prisma/client");

//Load PrismaClient
const prisma = new PrismaClient();

module.exports = {
  prisma,
};
