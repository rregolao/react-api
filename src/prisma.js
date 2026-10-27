const { PrismaClient } = require("@prisma/client");

// Uma única instância do client para toda a aplicação
const prisma = new PrismaClient();

module.exports = prisma;