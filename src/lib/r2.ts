import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

/**
 * Cloudflare R2 Client Configuration
 * 
 * R2 provides:
 * - 10GB FREE storage monthly
 * - Unlimited free egress (no costs for serving images)
 * - Fast global CDN
 * 
 * Set up your R2 bucket and get credentials from Cloudflare Dashboard:
 * 1. Go to Cloudflare Dashboard → R2
 * 2. Create a bucket (e.g., 'taskmart-media')
 * 3. Enable Public Access for the bucket
 * 4. Create API Token with R2:Edit permissions
 * 5. Get Account ID from R2 dashboard
 * 6. Add credentials to .env file
 */

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'taskmart-media';
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''; // e.g., https://pub-xxxx.r2.dev

// Initialize S3 client for R2 (R2 is S3-compatible)
export const r2Client = accountId && accessKeyId && secretAccessKey
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

// Log R2 configuration status (for debugging)
if (!r2Client) {
  console.warn('⚠️  Cloudflare R2 client is not configured.');
  console.warn('   Missing environment variables:');
  if (!accountId) console.warn('     - CLOUDFLARE_ACCOUNT_ID');
  if (!accessKeyId) console.warn('     - CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!secretAccessKey) console.warn('     - CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  console.warn('   File uploads will fail until R2 is configured.');
  console.warn('   See R2_SETUP_GUIDE.md for setup instructions.');
} else {
  console.log('✅ Cloudflare R2 client initialized successfully');
  console.log(`   Bucket: ${bucketName}`);
  console.log(`   Public URL: ${publicUrl || 'Not set'}`);
}

/**
 * Upload a file to Cloudflare R2
 * @param fileBuffer - File buffer from multer
 * @param fileName - Unique file name (should include extension)
 * @param contentType - MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @param folder - Optional folder prefix (e.g., 'listings', 'profiles')
 * @returns Public CDN URL of the uploaded file
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'listings'
): Promise<string> {
  if (!r2Client) {
    throw new Error(
      'R2 client is not configured. Please set CLOUDFLARE_ACCOUNT_ID, ' +
      'CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, ' +
      'and CLOUDFLARE_R2_PUBLIC_URL in your .env file.'
    );
  }

  // Construct the object key (path in bucket)
  const objectKey = `${folder}/${fileName}`;

  try {
    // Upload file to R2 using streaming upload for better performance
    // Note: R2 uses public access via bucket policy, not ACL
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: contentType,
      },
    });

    await upload.done();

    // Construct and return the public CDN URL
    if (!publicUrl) {
      throw new Error('CLOUDFLARE_R2_PUBLIC_URL is not set in environment variables');
    }

    // Remove trailing slash if present
    const baseUrl = publicUrl.replace(/\/$/, '');
    const publicFileUrl = `${baseUrl}/${objectKey}`;

    return publicFileUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Cloudflare R2 (optional, for future use)
 */
export async function deleteFromR2(objectKey: string): Promise<void> {
  if (!r2Client) {
    throw new Error('R2 client is not configured.');
  }

  try {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

