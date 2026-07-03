import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let prisma: PrismaClient;
let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
    prismaPool?: Pool;
  };

  if (!globalWithPrisma.prisma) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalWithPrisma.prismaPool = pool;
    globalWithPrisma.prisma = new PrismaClient({ adapter });
  }
  
  prisma = globalWithPrisma.prisma;
}

export default prisma;
export { pool };
