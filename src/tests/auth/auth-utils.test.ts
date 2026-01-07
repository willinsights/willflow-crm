/**
 * Tests for authentication utilities
 */
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generatePassword } from '@/lib/auth-utils';

describe('Authentication Utils', () => {
  describe('Password Generation', () => {
    it('should generate password with correct length', () => {
      const password = generatePassword(12);
      expect(password).toHaveLength(12);
    });

    it('should generate password with custom length', () => {
      const password = generatePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should generate different passwords on each call', () => {
      const password1 = generatePassword(12);
      const password2 = generatePassword(12);
      expect(password1).not.toBe(password2);
    });

    it('should only contain valid characters', () => {
      const password = generatePassword(100);
      const validChars = /^[a-zA-Z0-9!@#$%^&*]+$/;
      expect(password).toMatch(validChars);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toContain(':'); // Should have salt:hash format
      
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32); // Salt should be 16 bytes = 32 hex chars
      expect(parts[1]).toHaveLength(128); // Hash should be 64 bytes = 128 hex chars
    });

    it('should generate different hashes for same password', () => {
      const password = 'TestPassword123!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
    });

    it('should handle empty password', () => {
      const hash = hashPassword('');
      expect(hash).toBeDefined();
      expect(hash).toContain(':');
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      const isValid = verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password verification', () => {
      const hash = hashPassword('somepassword');
      const isValid = verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', () => {
      const isValid = verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });

    it('should handle missing salt or hash', () => {
      const isValid1 = verifyPassword('password', ':hash');
      const isValid2 = verifyPassword('password', 'salt:');
      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
    });

    it('should verify multiple passwords correctly', () => {
      const password1 = 'Password1!';
      const password2 = 'Password2@';
      const password3 = 'Password3#';
      
      const hash1 = hashPassword(password1);
      const hash2 = hashPassword(password2);
      const hash3 = hashPassword(password3);
      
      // Verify correct passwords
      expect(verifyPassword(password1, hash1)).toBe(true);
      expect(verifyPassword(password2, hash2)).toBe(true);
      expect(verifyPassword(password3, hash3)).toBe(true);
      
      // Verify cross-password verification fails
      expect(verifyPassword(password1, hash2)).toBe(false);
      expect(verifyPassword(password2, hash3)).toBe(false);
      expect(verifyPassword(password3, hash1)).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should use different salts for same password', () => {
      const password = 'TestPassword123!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      const salt1 = hash1.split(':')[0];
      const salt2 = hash2.split(':')[0];
      
      expect(salt1).not.toBe(salt2);
    });

    it('should handle special characters in password', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = hashPassword(password);
      
      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters in password', () => {
      const password = 'Senha123!çãõáé';
      const hash = hashPassword(password);
      
      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle long passwords', () => {
      const password = 'A'.repeat(100) + '123!';
      const hash = hashPassword(password);
      
      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
  });
});
