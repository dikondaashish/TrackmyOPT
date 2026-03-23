import { SignJWT, jwtVerify } from 'jose';
import { getServerSideEnv } from './env';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'trackmyopt-web';
const JWT_AUDIENCE = 'trackmyopt-extension';

/**
 * Get the secret key for JWT signing
 * Only call this on the server!
 */
function getSecretKey() {
  const env = getServerSideEnv();
  const secret = new TextEncoder().encode(env.JWT_SIGNING_SECRET);
  return secret;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  sub?: string; // Standard JWT subject claim
}

/**
 * Decoded JWT token result
 */
export interface DecodedToken {
  sub: string;
  email: string;
  userId: string;
}

/**
 * Sign a JWT token (alias for mintToken for convenience)
 * 
 * @param payload - User information to encode
 * @param expiresIn - Expiration time (e.g., '10m', '1h', '7d')
 * @returns Signed JWT token
 */
export async function signToken(
  payload: { userId: string; email: string },
  expiresIn: string = '10m'
): Promise<string> {
  const secret = getSecretKey();
  
  const token = await new SignJWT({ 
    userId: payload.userId,
    email: payload.email,
    sub: payload.userId, // Standard 'sub' claim for user ID
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Mint a short-lived JWT token for extension authentication
 * 
 * @param payload - User information to encode in the token
 * @param expiresInSeconds - Token expiration time (default: 5 minutes)
 * @returns Signed JWT token
 */
export async function mintToken(
  payload: Omit<JWTPayload, 'exp' | 'iat' | 'iss' | 'aud'>,
  expiresInSeconds: number = 300 // 5 minutes
): Promise<string> {
  const secret = getSecretKey();
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token to verify
 * @returns Decoded payload with userId and email, or null if invalid
 */
export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const secret = getSecretKey();
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Extract standard claims
    const decoded: DecodedToken = {
      sub: payload.sub as string,
      email: (payload as any).email || '',
      userId: (payload as any).userId || payload.sub as string,
    };

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Create a token response for the extension
 */
export function createTokenResponse(token: string, expiresInSeconds: number = 300) {
  return {
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresInSeconds,
  };
}

