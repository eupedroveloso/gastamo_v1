require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_MEMBERS = ["Pedro", "Letícia"];
const DEFAULT_BUDGETS = { geral: 10000, Pedro: 3000, Letícia: 3000 };
const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
];
const DEFAULT_CARDS = ["Nubank", "Itaú", "Dinheiro"];

async function main() {
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      members: DEFAULT_MEMBERS,
      budgets: DEFAULT_BUDGETS,
      categories: DEFAULT_CATEGORIES,
      cards: DEFAULT_CARDS,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
