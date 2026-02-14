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
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

// Initialize S3 client with credentials from environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'all-in-one-career-ashish';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SIGNED_URL_EXPIRY = 300; // 5 minutes

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
      Bucket: BUCKET_NAME,
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
      Bucket: BUCKET_NAME,
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
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

  } catch (error) {
    console.error('❌ S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Check if a file exists in S3
 * @param key - S3 key
 * @returns true if exists
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get file metadata from S3
 * @param key - S3 key
 * @returns File size and content type
 */
export async function getFileMetadata(key: string): Promise<{ size: number; contentType: string }> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('❌ Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
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
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  return validTypes.includes(contentType.toLowerCase());
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };

  return extensions[contentType.toLowerCase()] || 'bin';
}

