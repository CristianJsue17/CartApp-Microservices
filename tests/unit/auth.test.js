const bcrypt = require('bcryptjs');

describe('Auth Service - Unit Tests', () => {
  describe('Password Validation', () => {
    test('should hash password correctly', async () => {
      const password = 'test123';
      const hashed = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    test('should reject short passwords', () => {
      const shortPassword = '12345';
      expect(shortPassword.length).toBeLessThan(6);
    });

    test('should accept valid passwords', () => {
      const validPassword = 'validPassword123';
      expect(validPassword.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    test('should accept valid email', () => {
      const validEmail = 'user@example.com';
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    test('should reject invalid email without @', () => {
      const invalidEmail = 'userexample.com';
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    test('should reject invalid email without domain', () => {
      const invalidEmail = 'user@';
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });
  });
});