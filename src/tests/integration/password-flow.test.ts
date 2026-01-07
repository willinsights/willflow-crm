/**
 * Integration tests for complete password flow
 * Tests the end-to-end flow of password generation, hashing, and verification
 */
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generatePassword } from '@/lib/auth-utils';

describe('Password Flow Integration Tests', () => {
  describe('User Creation Flow', () => {
    it('should create a user with generated password and verify login', () => {
      // Simulate POST /api/users flow
      
      // 1. Generate password (as in user creation)
      const plainPassword = generatePassword(12);
      expect(plainPassword).toHaveLength(12);
      
      // 2. Hash the password for storage
      const hashedPassword = hashPassword(plainPassword);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toContain(':');
      
      // 3. Simulate login - verify the plain password against hash
      const isValid = verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
      
      // 4. Ensure wrong password fails
      const wrongPassword = 'wrongpassword123';
      const isWrongValid = verifyPassword(wrongPassword, hashedPassword);
      expect(isWrongValid).toBe(false);
    });
    
    it('should work with multiple users created in sequence', () => {
      // Simulate creating multiple users
      const users = [
        { email: 'user1@example.com', password: generatePassword(12) },
        { email: 'user2@example.com', password: generatePassword(12) },
        { email: 'user3@example.com', password: generatePassword(12) },
      ];
      
      // Hash all passwords
      const hashedUsers = users.map(user => ({
        ...user,
        hashedPassword: hashPassword(user.password),
      }));
      
      // Verify each user can login with their password
      hashedUsers.forEach((user, index) => {
        const isValid = verifyPassword(users[index].password, user.hashedPassword);
        expect(isValid).toBe(true);
      });
      
      // Verify cross-verification fails
      expect(verifyPassword(users[0].password, hashedUsers[1].hashedPassword)).toBe(false);
      expect(verifyPassword(users[1].password, hashedUsers[2].hashedPassword)).toBe(false);
      expect(verifyPassword(users[2].password, hashedUsers[0].hashedPassword)).toBe(false);
    });
  });
  
  describe('Password Reset Flow', () => {
    it('should reset password and allow login with new password', () => {
      // 1. Create user with initial password
      const initialPassword = generatePassword(12);
      let userPassword = hashPassword(initialPassword);
      
      // 2. Verify initial login works
      expect(verifyPassword(initialPassword, userPassword)).toBe(true);
      
      // 3. Simulate password reset - generate new password
      const newPassword = generatePassword(12);
      userPassword = hashPassword(newPassword);
      
      // 4. Verify old password no longer works
      expect(verifyPassword(initialPassword, userPassword)).toBe(false);
      
      // 5. Verify new password works
      expect(verifyPassword(newPassword, userPassword)).toBe(true);
    });
  });
  
  describe('Password Change Flow', () => {
    it('should change password and verify with new password', () => {
      // 1. User created with generated password
      const tempPassword = generatePassword(12);
      let userPassword = hashPassword(tempPassword);
      
      // 2. User logs in with temp password (first login)
      expect(verifyPassword(tempPassword, userPassword)).toBe(true);
      
      // 3. User changes to their own password
      const userChosenPassword = 'MySecurePassword123!';
      userPassword = hashPassword(userChosenPassword);
      
      // 4. Verify temp password no longer works
      expect(verifyPassword(tempPassword, userPassword)).toBe(false);
      
      // 5. Verify new password works
      expect(verifyPassword(userChosenPassword, userPassword)).toBe(true);
    });
    
    it('should handle password change for different user roles', () => {
      const roles = ['admin', 'editor_edicao', 'freelancer_captacao'];
      
      roles.forEach(role => {
        // Generate password for user
        const tempPassword = generatePassword(12);
        let userPassword = hashPassword(tempPassword);
        
        // Verify initial password
        expect(verifyPassword(tempPassword, userPassword)).toBe(true);
        
        // Change password
        const newPassword = `${role}NewPassword123!`;
        userPassword = hashPassword(newPassword);
        
        // Verify new password works
        expect(verifyPassword(newPassword, userPassword)).toBe(true);
        expect(verifyPassword(tempPassword, userPassword)).toBe(false);
      });
    });
  });
  
  describe('Email Normalization Consistency', () => {
    it('should handle email normalization consistently across flows', () => {
      // Email normalization ensures that emails are stored and compared consistently
      // (lowercase + trim) to prevent authentication issues
      const emails = [
        'test@example.com',
        'Test@Example.com',
        'TEST@EXAMPLE.COM',
        '  test@example.com  ',
      ];
      
      const password = generatePassword(12);
      const hashedPassword = hashPassword(password);
      
      // All normalized versions should work with same password
      emails.forEach(email => {
        const normalizedEmail = email.toLowerCase().trim();
        expect(normalizedEmail).toBe('test@example.com');
      });
      
      // Password verification is independent of email
      expect(verifyPassword(password, hashedPassword)).toBe(true);
    });
  });
  
  describe('Edge Cases and Security', () => {
    it('should handle special characters in passwords', () => {
      const specialPasswords = [
        'Pass@word!123',
        'P@$$w0rd#2024',
        'Sεñh@123!çã',
        '密码Password123!',
      ];
      
      specialPasswords.forEach(password => {
        const hashed = hashPassword(password);
        expect(verifyPassword(password, hashed)).toBe(true);
      });
    });
    
    it('should generate unique salts for same password', () => {
      const password = 'SamePassword123!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      const hash3 = hashPassword(password);
      
      // Hashes should be different (different salts)
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);
      
      // But all should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
      expect(verifyPassword(password, hash3)).toBe(true);
    });
    
    it('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(100) + 'B'.repeat(100) + '123!@#';
      const hashed = hashPassword(longPassword);
      expect(verifyPassword(longPassword, hashed)).toBe(true);
    });
    
    it('should fail gracefully with malformed hash', () => {
      const password = 'TestPassword123!';
      
      // Test various malformed hashes
      expect(verifyPassword(password, 'invalid')).toBe(false);
      expect(verifyPassword(password, 'no:colon:here')).toBe(false);
      expect(verifyPassword(password, ':onlyhash')).toBe(false);
      expect(verifyPassword(password, 'onlysalt:')).toBe(false);
      expect(verifyPassword(password, '')).toBe(false);
    });
  });
  
  describe('Seeded User Scenarios', () => {
    it('should support the admin user scenario', () => {
      // Simulate admin created by seed with known password
      const adminPassword = 'admin123';
      const hashedPassword = hashPassword(adminPassword);
      
      // Admin can login
      expect(verifyPassword(adminPassword, hashedPassword)).toBe(true);
      expect(verifyPassword('wrongpassword', hashedPassword)).toBe(false);
    });
    
    it('should support freelancer users with generated passwords', () => {
      // Simulate freelancers created by seed or API
      const freelancerPassword = 'filmmaker123';
      const hashedPassword = hashPassword(freelancerPassword);
      
      // Freelancer can login with generated password
      expect(verifyPassword(freelancerPassword, hashedPassword)).toBe(true);
      
      // Then changes password on first login
      const newPassword = 'MyNewSecurePass123!';
      const newHashed = hashPassword(newPassword);
      
      expect(verifyPassword(newPassword, newHashed)).toBe(true);
      expect(verifyPassword(freelancerPassword, newHashed)).toBe(false);
    });
    
    it('should support editor users with generated passwords', () => {
      const editorPassword = 'editor123';
      const hashedPassword = hashPassword(editorPassword);
      
      // Editor can login
      expect(verifyPassword(editorPassword, hashedPassword)).toBe(true);
      
      // Editor changes password
      const newPassword = 'EditorSecure2024!';
      const newHashed = hashPassword(newPassword);
      
      expect(verifyPassword(newPassword, newHashed)).toBe(true);
      expect(verifyPassword(editorPassword, newHashed)).toBe(false);
    });
  });
  
  describe('Concurrent User Scenarios', () => {
    it('should handle multiple users with same password securely', () => {
      // In real scenario, multiple users might choose same password
      // But hashes should be different due to unique salts
      const commonPassword = 'CommonPass123!';
      
      const user1Hash = hashPassword(commonPassword);
      const user2Hash = hashPassword(commonPassword);
      const user3Hash = hashPassword(commonPassword);
      
      // All hashes should be different
      expect(user1Hash).not.toBe(user2Hash);
      expect(user2Hash).not.toBe(user3Hash);
      
      // But all should verify correctly with the common password
      expect(verifyPassword(commonPassword, user1Hash)).toBe(true);
      expect(verifyPassword(commonPassword, user2Hash)).toBe(true);
      expect(verifyPassword(commonPassword, user3Hash)).toBe(true);
    });
    
    it('should isolate password verification per user', () => {
      // Create 3 users with different passwords
      const users = [
        { id: '1', password: generatePassword(12) },
        { id: '2', password: generatePassword(12) },
        { id: '3', password: generatePassword(12) },
      ];
      
      const hashedUsers = users.map(u => ({
        ...u,
        hashedPassword: hashPassword(u.password),
      }));
      
      // Each user can only login with their own password
      hashedUsers.forEach((hashedUser, i) => {
        // Correct password works
        expect(verifyPassword(users[i].password, hashedUser.hashedPassword)).toBe(true);
        
        // Other users' passwords don't work
        hashedUsers.forEach((otherUser, j) => {
          if (i !== j) {
            expect(verifyPassword(users[i].password, otherUser.hashedPassword)).toBe(false);
          }
        });
      });
    });
  });
});
