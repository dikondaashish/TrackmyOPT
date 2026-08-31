/**
 * AWS S3 Document Storage Utility
 * 
 * Handles secure document uploads, downloads, and signed URL generation
 * All files are encrypted at rest (AES-256) via S3 bucket settings
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

// Initialize S3 client with credentials from environment
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // When static keys are not supplied, let the AWS SDK use its standard
  // runtime credential chain (for example an attached IAM role).
  ...(accessKeyId && secretAccessKey
    ? { credentials: { accessKeyId, secretAccessKey } }
    : {}),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SIGNED_URL_EXPIRY = 300; // 5 minutes

function getBucketName(): string {
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }
  return bucket;
}

/**
 * Generate a unique S3 key for a document
 * Format: documents/{userId}/{timestamp}-{hash}-{filename}
 */
export function generateS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const hash = createHash('md5').update(`${userId}${timestamp}${filename}`).digest('hex').substring(0, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return `documents/${userId}/${timestamp}-${hash}-${sanitizedFilename}`;
}

/**
 * Upload a document to S3
 * @param file - File buffer
 * @param key - S3 key (path)
 * @param contentType - MIME type
 * @returns S3 key on success
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ key: string; size: number }> {
  try {
    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }


    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: file,
      ContentType: contentType,
      ServerSideEncryption: 'AES256', // Enable encryption at rest
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);


    return {
      key,
      size: file.length,
    };
  } catch (error) {
    console.error('❌ S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a signed URL for secure file download
 * URL expires after 5 minutes
 * @param key - S3 key
 * @returns Signed URL
 */
export async function generateSignedUrl(key: string): Promise<string> {
  try {

    const command = new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: SIGNED_URL_EXPIRY, // 5 minutes
    });


    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Delete a document from S3
 * @param key - S3 key
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {

    const command = new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });

    await s3Client.send(command);

  } catch (error) {
    console.error('❌ S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Validate file type for document uploads
 * @param contentType - MIME type
 * @returns true if valid
 */
export function isValidDocumentType(contentType: string): boolean {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  return validTypes.includes(contentType.toLowerCase());
}
