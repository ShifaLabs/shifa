import { z } from "zod";

/**
 * Environment variable schema for validation
 */
const envSchema = z.object({
  // Database
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Email
  EMAIL_USER: z.string().email("EMAIL_USER must be a valid email"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  // Payment
  STORE_ID: z.string().min(1, "STORE_ID is required"),
  STORE_PASSWD: z.string().min(1, "STORE_PASSWD is required"),
  SSL_MODE: z.enum(["sandbox", "production"]),
  SANDBOX_LINK: z.string().url().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_UPLOAD_PRESET: z
    .string()
    .min(1, "CLOUDINARY_UPLOAD_PRESET is required"),

  // Stream
  STREAM_API_KEY: z.string().min(1, "STREAM_API_KEY is required"),
  STREAM_SECRET: z.string().min(1, "STREAM_SECRET is required"),
  STREAM_WEBHOOK_SECRET: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");

      throw new Error(
        `Invalid environment variables:\n${missingVars}\n\nPlease check your .env file.`,
      );
    }
    throw error;
  }
}

// Validate on import
let env: Env;

try {
  env = validateEnv();
} catch (error) {
  console.error(error);
  // In development, show error but don't crash
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
  // Provide defaults for development
  env = process.env as any;
}

/**
 * Type-safe environment variable access
 */
export const getEnv = () => env;

/**
 * Check if running in production
 */
export const isProduction = () => env.NODE_ENV === "production";

/**
 * Check if running in development
 */
export const isDevelopment = () => env.NODE_ENV === "development";
