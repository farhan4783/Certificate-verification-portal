import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters long in production"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Cloudinary configuration (optional fallback permitted locally, warning logged)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Resend configuration (optional fallback permitted locally, warning logged)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("certificates@yourdomain.com"),
  
  // Redis configuration (used for global queues/rate-limiting, fallback locally)
  REDIS_URL: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation failed on startup:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === "production") {
      throw new Error("Strict environment validation failed. Process exiting.");
    }
  }

  return result.success ? result.data : process.env as any;
}

export const env = validateEnv();
export default env;
