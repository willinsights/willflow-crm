/**
 * Authentication Utilities for WillFlow CRM
 * Password hashing, verification, and auth-related emails
 */

import crypto from 'crypto';
import { sendEmail } from './email';
import { WillFlowEmailTemplates } from './email-templates';

// Password hashing using SHA-256 (for serverless compatibility)
// In production, consider using bcrypt with proper async handling
const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;

    const verifyHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a random password
 */
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  const template = WillFlowEmailTemplates.welcome(name, email, temporaryPassword);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send password changed notification email
 */
export async function sendPasswordChangedEmail(
  name: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const template = WillFlowEmailTemplates.passwordChanged(name);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const template = WillFlowEmailTemplates.passwordReset(name, email, newPassword);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export default {
  hashPassword,
  verifyPassword,
  generatePassword,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
};
