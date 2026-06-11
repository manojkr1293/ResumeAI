import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  // ---------- General ----------
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('ResumeAI'),
  APP_VERSION: z.string().default('1.0.0'),

  // ---------- Backend Server ----------
  SERVER_PORT: z.coerce.number().default(5000),
  SERVER_HOST: z.string().default('localhost'),
  API_PREFIX: z.string().default('/api/v1'),

  // ---------- Database ----------
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL environment variable is required',
  }).url('DATABASE_URL must be a valid connection string URL'),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // ---------- JWT Authentication ----------
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  JWT_ISSUER: z.string().default('resumeai.local'),
  ADMIN_EMAILS: z.string().optional().default(''),

  // ---------- Google OAuth 2.0 ----------
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional().or(z.string().length(0)),

  // ---------- OpenAI ----------
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_ORG_ID: z.string().optional().or(z.string().length(0)),
  OPENAI_DEFAULT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_PREMIUM_MODEL: z.string().default('gpt-4o'),
  OPENAI_MAX_RETRIES: z.coerce.number().default(3),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(30000),

  // ---------- Gemini ----------
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // ---------- Rate Limiting ----------
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_FREE: z.coerce.number().default(60),
  RATE_LIMIT_MAX_PRO: z.coerce.number().default(300),

  // ---------- CORS ----------
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  OWNER_EMAILS: z.string().optional().default(''),

  // ---------- Logging ----------
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.string().default('combined'),
  LOG_DIR: z.string().default('logs'),

  // ---------- File Upload ----------
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),

  // ---------- Encryption ----------
  ENCRYPTION_KEY: z.string().min(16, 'ENCRYPTION_KEY must be at least 16 characters'),

  // ---------- Feature Flags ----------
  FEATURE_AI_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  FEATURE_GOOGLE_AUTH_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  FEATURE_RAZORPAY_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  FEATURE_EXPORT_DOCX_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorMap = error.errors.map((err) => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
    const message = `❌ Invalid environment configuration:\n${errorMap}`;
    console.error(message);
    throw new Error(message);
  }
  throw error;
}

export const env = parsedEnv;
export default env;
