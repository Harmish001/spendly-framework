import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PORT: z.string().optional().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_KEY: z.string().min(1),
});

// Parse environment variables
const env = envSchema.parse(process.env);

export const config = {
  supabase: {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  server: {
    port: parseInt(env.PORT, 10),
    env: env.NODE_ENV,
  },
  auth: {
    apiKey: env.API_KEY,
  },
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Replace with your actual domain
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  },
} as const;