import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Validates that required environment variables are set
 */
export const validateEnv = (): void => {
  const requiredEnvVars = ['DATABASE_URL'];
  // Cloudflare R2 credentials are optional (needed for media uploads)
  // Supabase credentials are optional (only needed if using backend uploads)
  const optionalEnvVars = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_PUBLIC_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please create a .env file in the backend directory with the required variables.\n` +
      `See README.md for setup instructions.`
    );
  }
};

/**
 * Get environment variable or throw error if not set
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value;
};

