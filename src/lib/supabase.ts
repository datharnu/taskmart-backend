import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';

/**
 * Supabase client configuration
 * 
 * NOTE: For image/video uploads, it's recommended to handle uploads from the frontend
 * for better user experience. However, this client is available for backend use if needed.
 * 
 * To use Supabase Storage:
 * 1. Get your Supabase URL and anon key from your Supabase project dashboard
 * 2. Add them to your .env file:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_ANON_KEY=your-anon-key
 * 3. Create a storage bucket for listings (e.g., 'listings') in Supabase dashboard
 * 4. Set up proper RLS (Row Level Security) policies for the bucket
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client (only if credentials are provided)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload a file to Supabase Storage
 * @param bucketName - Name of the storage bucket (e.g., 'listings')
 * @param filePath - Path where the file should be stored
 * @param file - File buffer or Blob
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToSupabase(
  bucketName: string,
  filePath: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType,
      upsert: false, // Set to true if you want to overwrite existing files
    });

  if (error) {
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file');
  }

  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path of the file to delete
 */
export async function deleteFromSupabase(
  bucketName: string,
  filePath: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file from Supabase: ${error.message}`);
  }
}





