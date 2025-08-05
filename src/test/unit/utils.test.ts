import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  generateRandomString,
  formatDate,
  getClientIP,
  log
} from '@/lib/utils';

describe('工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('密码加密和验证', () => {
    it('应该正确加密密码', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('应该正确验证密码', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token 生成和验证', () => {
    it('应该生成有效的 JWT token', () => {
      const payload = { userId: 1, username: 'testuser' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('应该验证有效的 JWT token', () => {
      const payload = { userId: 1, username: 'testuser' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.username).toBe(payload.username);
    });

    it('应该拒绝无效的 JWT token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it('应该处理过期的 JWT token', () => {
      // 创建一个过期的 token（需要设置很短的过期时间）
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      process.env.JWT_EXPIRES_IN = '1ms';
      
      const payload = { userId: 1, username: 'testuser' };
      const token = generateToken(payload);
      
      // 等待 token 过期
      setTimeout(() => {
        const decoded = verifyToken(token);
        expect(decoded).toBeNull();
      }, 10);
      
      // 恢复原始设置
      process.env.JWT_EXPIRES_IN = originalExpiresIn;
    });
  });

  describe('随机字符串生成', () => {
    it('应该生成指定长度的随机字符串', () => {
      const length = 10;
      const randomString = generateRandomString(length);
      
      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
      expect(typeof randomString).toBe('string');
    });

    it('应该生成默认长度的随机字符串', () => {
      const randomString = generateRandomString();
      
      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(8);
      expect(typeof randomString).toBe('string');
    });

    it('应该生成不同的随机字符串', () => {
      const string1 = generateRandomString(10);
      const string2 = generateRandomString(10);
      
      expect(string1).not.toBe(string2);
    });
  });

  describe('日期格式化', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toBe('2023-12-25');
    });

    it('应该处理当前日期', () => {
      const now = new Date();
      const formatted = formatDate(now);
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('客户端IP获取', () => {
    it('应该从 x-forwarded-for 获取IP', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
      });
      
      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('应该从 x-real-ip 获取IP', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2'
        }
      });
      
      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('应该在没有IP头时返回unknown', () => {
      const request = new Request('http://localhost:3000');
      
      const ip = getClientIP(request);
      expect(ip).toBe('unknown');
    });
  });

  describe('日志工具', () => {
    it('应该记录信息日志', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const request = new Request('http://localhost:3000');
      
      log.info('测试信息', request, { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('应该记录错误日志', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = new Error('测试错误');
      
      log.error('测试错误信息', error);
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('应该记录警告日志', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      log.warn('测试警告信息', { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
}); 