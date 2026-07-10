import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "@/lib/env";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

let prisma: PrismaClient;

const connectionString = process.env.DATABASE_URL;
const isExternalDb = connectionString?.includes("supabase.co") || connectionString?.includes("neon.tech") || connectionString?.includes("aivencloud.com");

const poolConfig = {
  connectionString,
  ssl: isExternalDb ? { rejectUnauthorized: false } : undefined,
  max: process.env.NODE_ENV === "production" ? 2 : 10, // Cap pool size in serverless environments
};

if (process.env.NODE_ENV === "production") {
  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    global.prismaPool = pool;
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;

