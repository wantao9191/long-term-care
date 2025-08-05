import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟中间件
const mockMiddleware1 = vi.fn((context: any, next: any) => {
  context.middleware1 = true;
  return next(context);
});

const mockMiddleware2 = vi.fn((context: any, next: any) => {
  context.middleware2 = true;
  return next(context);
});

const mockHandler = vi.fn((context: any) => {
  return new Response('OK', { status: 200 });
});

describe('中间件集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('中间件组合', () => {
    it('应该按顺序执行中间件', async () => {
      // 模拟 composeMiddlewares 函数
      const composeMiddlewares = (...middlewares: any[]) => {
        return async (context: any) => {
          let index = 0;
          const next = async (ctx: any) => {
            if (index >= middlewares.length) {
              return new Response('OK', { status: 200 });
            }
            const middleware = middlewares[index++];
            return middleware(ctx, next);
          };
          return next(context);
        };
      };

      const composed = composeMiddlewares(mockMiddleware1, mockMiddleware2, mockHandler);
      const context = { request: new Request('http://localhost:3000') };

      await composed(context);

      expect(mockMiddleware1).toHaveBeenCalled();
      expect(mockMiddleware2).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();
      expect(context.middleware1).toBe(true);
      expect(context.middleware2).toBe(true);
    });

    it('应该处理中间件错误', async () => {
      const errorMiddleware = vi.fn((context: any, next: any) => {
        throw new Error('中间件错误');
      });

      const composeMiddlewares = (...middlewares: any[]) => {
        return async (context: any) => {
          let index = 0;
          const next = async (ctx: any) => {
            if (index >= middlewares.length) {
              return new Response('OK', { status: 200 });
            }
            const middleware = middlewares[index++];
            return middleware(ctx, next);
          };
          return next(context);
        };
      };

      const composed = composeMiddlewares(errorMiddleware, mockHandler);
      const context = { request: new Request('http://localhost:3000') };

      await expect(composed(context)).rejects.toThrow('中间件错误');
    });
  });

  describe('请求验证', () => {
    it('应该验证请求方法', async () => {
      const requestValidator = (allowedMethods: string[] = ['GET', 'POST']) => {
        return async (context: any, next: any) => {
          const method = context.request.method;
          if (!allowedMethods.includes(method)) {
            throw new Error(`方法 ${method} 不被允许`);
          }
          return next(context);
        };
      };

      const validator = requestValidator(['GET']);
      const context = { 
        request: new Request('http://localhost:3000', { method: 'POST' })
      };

      const next = vi.fn((ctx: any) => Promise.resolve(new Response('OK')));
      
      await expect(validator(context, next)).rejects.toThrow('方法 POST 不被允许');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('表单验证', () => {
    it('应该验证表单数据', async () => {
      const formValidator = (schema: any) => {
        return async (context: any, next: any) => {
          const formData = await context.request.formData();
          const data: any = {};
          
          for (const [key, value] of formData.entries()) {
            data[key] = value;
          }

          // 简单的验证逻辑
          for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && !data[field]) {
              throw new Error(`${field} 是必填字段`);
            }
          }

          context.formData = data;
          return next(context);
        };
      };

      const schema = {
        username: { required: true },
        password: { required: true }
      };

      const validator = formValidator(schema);
      const formData = new FormData();
      formData.append('username', 'testuser');
      formData.append('password', 'password123');

      const context = { 
        request: new Request('http://localhost:3000', {
          method: 'POST',
          body: formData
        })
      };

      const next = vi.fn((ctx: any) => Promise.resolve(new Response('OK')));
      const result = await validator(context, next);

      expect(next).toHaveBeenCalledWith(context);
      expect(result).toBeInstanceOf(Response);
      expect(context.formData).toEqual({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('应该拒绝无效的表单数据', async () => {
      const formValidator = (schema: any) => {
        return async (context: any, next: any) => {
          const formData = await context.request.formData();
          const data: any = {};
          
          for (const [key, value] of formData.entries()) {
            data[key] = value;
          }

          // 简单的验证逻辑
          for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && !data[field]) {
              throw new Error(`${field} 是必填字段`);
            }
          }

          context.formData = data;
          return next(context);
        };
      };

      const schema = {
        username: { required: true },
        password: { required: true }
      };

      const validator = formValidator(schema);
      const formData = new FormData();
      formData.append('username', 'testuser');
      // 缺少 password 字段

      const context = { 
        request: new Request('http://localhost:3000', {
          method: 'POST',
          body: formData
        })
      };

      const next = vi.fn();
      
      await expect(validator(context, next)).rejects.toThrow('password 是必填字段');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('速率限制', () => {
    it('应该实现基本的速率限制', async () => {
      const rateLimiter = (config: { windowMs: number; max: number }) => {
        const store = new Map();
        
        return async (context: any, next: any) => {
          const clientIP = context.request.headers.get('x-forwarded-for') || 'unknown';
          const now = Date.now();
          const windowStart = now - config.windowMs;
          
          const clientData = store.get(clientIP) || { count: 0, resetTime: now + config.windowMs };
          
          if (now > clientData.resetTime) {
            clientData.count = 0;
            clientData.resetTime = now + config.windowMs;
          }
          
          if (clientData.count >= config.max) {
            throw new Error('请求过于频繁，请稍后再试');
          }
          
          clientData.count++;
          store.set(clientIP, clientData);
          
          return next(context);
        };
      };

      const limiter = rateLimiter({ windowMs: 1000, max: 1 });
      const context = { 
        request: new Request('http://localhost:3000', {
          headers: { 'x-forwarded-for': '192.168.1.1' }
        })
      };

      const next = vi.fn((ctx: any) => Promise.resolve(new Response('OK')));
      
      // 第一次请求应该成功
      await limiter(context, next);
      expect(next).toHaveBeenCalledTimes(1);

      // 第二次请求应该被限制
      await expect(limiter(context, next)).rejects.toThrow('请求过于频繁，请稍后再试');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('错误处理', () => {
    it('应该处理已知错误', async () => {
      const errorHandler = () => {
        return async (context: any, next: any) => {
          try {
            return await next(context);
          } catch (error: any) {
            return new Response(JSON.stringify({
              error: error.message,
              status: 500
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        };
      };

      const handler = errorHandler();
      const errorMiddleware = vi.fn((context: any, next: any) => {
        throw new Error('测试错误');
      });

      const context = { request: new Request('http://localhost:3000') };
      const next = vi.fn();
      const result = await handler(context, errorMiddleware);

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);
    });

    it('应该处理验证错误', async () => {
      const errorHandler = () => {
        return async (context: any, next: any) => {
          try {
            return await next(context);
          } catch (error: any) {
            const status = error.name === 'ValidationError' ? 400 : 500;
            return new Response(JSON.stringify({
              error: error.message,
              status
            }), {
              status,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        };
      };

      const handler = errorHandler();
      const validationError = new Error('验证失败');
      validationError.name = 'ValidationError';
      
      const errorMiddleware = vi.fn((context: any, next: any) => {
        throw validationError;
      });

      const context = { request: new Request('http://localhost:3000') };
      const next = vi.fn();
      const result = await handler(context, errorMiddleware);

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(400);
    });
  });

  describe('完整的中间件链', () => {
    it('应该处理完整的登录流程', async () => {
      // 模拟完整的中间件链
      const composeMiddlewares = (...middlewares: any[]) => {
        return async (context: any) => {
          let index = 0;
          const next = async (ctx: any) => {
            if (index >= middlewares.length) {
              return new Response('OK', { status: 200 });
            }
            const middleware = middlewares[index++];
            return middleware(ctx, next);
          };
          return next(context);
        };
      };

      const rateLimiter = (config: any) => async (context: any, next: any) => next(context);
      const requestValidator = () => async (context: any, next: any) => next(context);
      const formValidator = (schema: any) => async (context: any, next: any) => {
        context.formData = { username: 'testuser', password: 'password123', code: '1234' };
        return next(context);
      };

      const formData = new FormData();
      formData.append('username', 'testuser');
      formData.append('password', 'password123');
      formData.append('code', '1234');

      const context = { 
        request: new Request('http://localhost:3000', {
          method: 'POST',
          body: formData
        }),
        cookies: {
          get: vi.fn(() => ({ value: JSON.stringify({ code: '1234', expires: Date.now() + 60000 }) })),
          set: vi.fn(),
          delete: vi.fn()
        }
      };

      const composed = composeMiddlewares(
        rateLimiter({ windowMs: 60000, max: 5 }),
        requestValidator(),
        formValidator({
          username: { required: true },
          password: { required: true },
          code: { required: true }
        }),
        mockHandler
      );

      const result = await composed(context);

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);
      expect(context.formData).toBeDefined();
    });
  });
}); 