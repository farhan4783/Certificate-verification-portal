import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "@/lib/env";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

let prisma: PrismaClient;

// Hardcoded production fallback so Vercel can always reach Neon DB even if DATABASE_URL env is missing in Vercel settings
const DEFAULT_NEON_DB = "postgresql://neondb_owner:npg_QHA4eCGTjox3@ep-restless-resonance-ayi0ykdo.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";
const connectionString = process.env.DATABASE_URL || DEFAULT_NEON_DB;

const isLocal = !connectionString || connectionString.includes("127.0.0.1") || connectionString.includes("localhost");
const isExternalDb = !isLocal;

const poolConfig = {
  connectionString,
  ssl: isExternalDb ? { rejectUnauthorized: false } : undefined,
  max: 2, // Keep connection pool light in serverless functions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

if (!global.prisma) {
  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  global.prismaPool = pool;
  global.prisma = new PrismaClient({ adapter });
}
prisma = global.prisma;

export default prisma;
