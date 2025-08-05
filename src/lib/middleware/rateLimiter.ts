import type { APIContext } from 'astro';
import { log } from '@/lib/utils';
import { ApiErrors } from './errorHandler';

// 简单的内存存储（生产环境建议使用Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 限流中间件
export function rateLimiter(options: {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求次数
  keyGenerator?: (context: APIContext) => string; // 自定义key生成器
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean; // 是否跳过失败请求
}) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    const { request } = context;
    
    // 生成限流key
    const key = options.keyGenerator ? 
      options.keyGenerator(context) : 
      `${request.headers.get('x-forwarded-for') || 'unknown'}:${request.url}`;

    const now = Date.now();
    const windowStart = now - options.windowMs;

    // 获取当前记录
    const record = rateLimitStore.get(key);
    
    if (record && record.resetTime > now) {
      // 在时间窗口内
      if (record.count >= options.maxRequests) {
        log.warn('[限流中间件] 请求被限流', {
          key,
          count: record.count,
          maxRequests: options.maxRequests,
          url: request.url
        });
        
        throw ApiErrors.BadRequest(`请求过于频繁，请稍后再试 (${options.windowMs / 1000}秒内最多${options.maxRequests}次)`);
      }
      
      // 增加计数
      record.count++;
    } else {
      // 新的时间窗口
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
    }

    // 清理过期的记录
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime <= now) {
        rateLimitStore.delete(k);
      }
    }

    return await next();
  };
}

// 常用限流配置
export const rateLimitConfigs = {
  // 登录接口限流
  login: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5, // 最多5次
    keyGenerator: (context: APIContext) => {
      const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
      return `login:${ip}`;
    }
  },

  // 通用API限流
  api: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100, // 最多100次
  },

  // 文件上传限流
  upload: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10, // 最多10次
  },
}; 