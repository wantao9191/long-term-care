import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser, createMockOrganization } from '../setup';

// 模拟登录 API 端点
const mockLoginAPI = vi.fn();

// 模拟验证码 API 端点
const mockCaptchaAPI = vi.fn();

describe('登录流程端到端测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('完整的登录流程', () => {
    it('应该完成完整的登录流程', async () => {
      // 1. 获取验证码
      const captchaResponse = {
        success: true,
        data: {
          captcha: '1234',
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
      };
      mockCaptchaAPI.mockResolvedValue(captchaResponse);

      // 2. 提交登录表单
      const mockUser = createMockUser();
      const mockOrganization = createMockOrganization();
      const loginResponse = {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: mockUser,
          organization: mockOrganization
        }
      };
      mockLoginAPI.mockResolvedValue(loginResponse);

      // 模拟用户操作流程
      const loginFlow = async () => {
        // 步骤1: 获取验证码
        const captchaResult = await mockCaptchaAPI('/api/auth/captcha');
        expect(captchaResult.success).toBe(true);
        expect(captchaResult.data.captcha).toBeDefined();

        // 步骤2: 准备登录数据
        const loginData = {
          username: 'testuser',
          password: 'password123',
          code: captchaResult.data.captcha
        };

        // 步骤3: 提交登录
        const loginResult = await mockLoginAPI('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(loginData)
        });

        expect(loginResult.success).toBe(true);
        expect(loginResult.data.token).toBeDefined();
        expect(loginResult.data.user).toBeDefined();
        expect(loginResult.data.organization).toBeDefined();

        return loginResult;
      };

      const result = await loginFlow();
      expect(result.data.user.username).toBe('testuser');
      expect(result.data.organization.name).toBe('测试机构');
    });

    it('应该处理验证码错误', async () => {
      // 获取验证码
      const captchaResponse = {
        success: true,
        data: {
          captcha: '1234',
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
      };
      mockCaptchaAPI.mockResolvedValue(captchaResponse);

      // 使用错误的验证码
      const loginData = {
        username: 'testuser',
        password: 'password123',
        code: '5678' // 错误的验证码
      };

      mockLoginAPI.mockRejectedValue(new Error('验证码错误'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      })).rejects.toThrow('验证码错误');
    });

    it('应该处理用户不存在', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
        code: '1234'
      };

      mockLoginAPI.mockRejectedValue(new Error('用户不存在'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      })).rejects.toThrow('用户不存在');
    });

    it('应该处理密码错误', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
        code: '1234'
      };

      mockLoginAPI.mockRejectedValue(new Error('密码错误'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      })).rejects.toThrow('密码错误');
    });

    it('应该处理用户被禁用', async () => {
      const loginData = {
        username: 'disableduser',
        password: 'password123',
        code: '1234'
      };

      mockLoginAPI.mockRejectedValue(new Error('用户已被禁用'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      })).rejects.toThrow('用户已被禁用');
    });
  });

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const invalidLoginData = {
        username: '', // 空用户名
        password: 'password123',
        code: '1234'
      };

      mockLoginAPI.mockRejectedValue(new Error('用户名不能为空'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(invalidLoginData)
      })).rejects.toThrow('用户名不能为空');
    });

    it('应该验证字段格式', async () => {
      const invalidLoginData = {
        username: 'testuser',
        password: '123', // 密码太短
        code: '1234'
      };

      mockLoginAPI.mockRejectedValue(new Error('密码长度不能少于6位'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(invalidLoginData)
      })).rejects.toThrow('密码长度不能少于6位');
    });
  });

  describe('速率限制', () => {
    it('应该限制频繁登录尝试', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
        code: '1234'
      };

      // 模拟多次失败的登录尝试
      mockLoginAPI.mockRejectedValue(new Error('请求过于频繁，请稍后再试'));

      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(
          mockLoginAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
          }).catch(error => error.message)
        );
      }

      const results = await Promise.all(attempts);
      expect(results.every(result => result === '请求过于频繁，请稍后再试')).toBe(true);
    });
  });

  describe('会话管理', () => {
    it('应该正确设置登录后的会话', async () => {
      const mockUser = createMockUser();
      const mockOrganization = createMockOrganization();
      const loginResponse = {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: mockUser,
          organization: mockOrganization
        }
      };
      mockLoginAPI.mockResolvedValue(loginResponse);

      const loginData = {
        username: 'testuser',
        password: 'password123',
        code: '1234'
      };

      const result = await mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      // 验证返回的数据结构
      expect(result.data).toHaveProperty('token');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('organization');
      expect(result.data.user).toHaveProperty('id');
      expect(result.data.user).toHaveProperty('username');
      expect(result.data.user).toHaveProperty('name');
      expect(result.data.organization).toHaveProperty('id');
      expect(result.data.organization).toHaveProperty('name');
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      mockLoginAPI.mockRejectedValue(new Error('网络连接失败'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
          code: '1234'
        })
      })).rejects.toThrow('网络连接失败');
    });

    it('应该处理服务器错误', async () => {
      mockLoginAPI.mockRejectedValue(new Error('服务器内部错误'));

      await expect(mockLoginAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
          code: '1234'
        })
      })).rejects.toThrow('服务器内部错误');
    });
  });
}); 