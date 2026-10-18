import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// LinkedIn OAuth tokens are stored as AES-256-GCM ciphertext under a
// purpose-specific key, in the same v1.<iv>.<tag>.<ciphertext> layout as the
// private application answers.

const ENCRYPTION_VERSION = 'v1';
const ENCRYPTION_AAD = Buffer.from('trackmyopt:linkedin-token:v1', 'utf8');

function encryptionKey(): Buffer {
  const encoded = process.env.LINKEDIN_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encoded) throw new Error('LinkedIn token encryption is not configured');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('LINKEDIN_TOKEN_ENCRYPTION_KEY must be 32 bytes in base64');
  return key;
}

export function isLinkedInTokenEncryptionConfigured(): boolean {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptLinkedInToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(ENCRYPTION_AAD);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return [
    ENCRYPTION_VERSION,
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptLinkedInToken(encrypted: string): string {
  const [version, ivText, tagText, ciphertextText, extra] = encrypted.split('.');
  if (version !== ENCRYPTION_VERSION || !ivText || !tagText || !ciphertextText || extra) {
    throw new Error('Unsupported LinkedIn token payload');
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAAD(ENCRYPTION_AAD);
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64url')), decipher.final()]).toString('utf8');
}
