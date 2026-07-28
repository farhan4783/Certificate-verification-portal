import { z } from "zod";

const DEFAULT_DB_URL = "postgresql://neondb_owner:npg_QHA4eCGTjox3@ep-restless-resonance-ayi0ykdo.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";
const DEFAULT_JWT_SECRET = "local-dev-jwt-secret-key-1234567890";

const envSchema = z.object({
  DATABASE_URL: z.string().default(DEFAULT_DB_URL),
  JWT_SECRET: z.string().default(DEFAULT_JWT_SECRET),
  NEXT_PUBLIC_APP_URL: z.string().default("https://kodetocareer.com"),
  
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("certificates@kodetocareer.com"),
  
  REDIS_URL: z.string().optional(),
  SIGNING_PRIVATE_KEY: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DB_URL,
    JWT_SECRET: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://kodetocareer.com",
    ...process.env,
  });

  if (!result.success) {
    console.warn("⚠️ Environment configuration warning:", result.error.flatten().fieldErrors);
  }

  return result.success ? result.data : process.env as any;
}

export const env = validateEnv();
export default env;
