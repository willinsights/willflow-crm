/**
 * JWT Token Management for WillFlow CRM
 * Handles token generation, verification, and session management
 */

import crypto from 'crypto';

const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

/**
 * Get JWT secret with runtime validation
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production!');
  }
  
  // Use a fallback only in development/test
  return secret || 'dev-secret-change-in-production';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const SECRET = getJwtSecret();
  const now = Math.floor(Date.now() / 1000); // JWT uses seconds since epoch
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const SECRET = getJwtSecret();
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration (payload.exp is in seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowInSeconds) {
      return null;
    }

    return payload;
  } catch (error) {
    // Log error without sensitive information
    console.error('Error verifying token:', error instanceof Error ? error.message : 'Invalid token format');
    return null;
  }
}

/**
 * Refresh token if it's close to expiration
 */
export function refreshTokenIfNeeded(token: string): string | null {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Refresh if less than 1 hour remaining (both in seconds now)
  const oneHour = 60 * 60;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp - nowInSeconds < oneHour) {
    return generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  }

  return token;
}

export default {
  generateToken,
  verifyToken,
  refreshTokenIfNeeded,
};
