import type { APIContext } from 'astro';
import { log } from '@/lib/utils';
import { ApiErrors } from './errorHandler';

// 限流数据接口
interface RateLimitData {
  count: number;
  resetTime: number;
}

// 限流中间件
export function rateLimiter(options: {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求次数
  keyGenerator?: (context: APIContext) => string; // 自定义key生成器
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean; // 是否跳过失败请求
}) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    const { request, cookies } = context;
    
    // 生成限流key
    const key = options.keyGenerator ? 
      options.keyGenerator(context) : 
      `${request.headers.get('x-forwarded-for') || 'unknown'}:${request.url}`;

    const now = Date.now();
    const cookieName = `rate_limit_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // 从cookie中获取限流数据
    let rateLimitData: RateLimitData | null = null;
    const cookieValue = cookies.get(cookieName)?.value;
    
    if (cookieValue) {
      try {
        rateLimitData = JSON.parse(cookieValue);
      } catch (error) {
        log.warn('[限流中间件] 解析cookie数据失败', { cookieValue, error });
      }
    }
    
    if (rateLimitData && rateLimitData.resetTime > now) {
      // 在时间窗口内
      if (rateLimitData.count >= options.maxRequests) {
        log.warn('[限流中间件] 请求被限流', {
          key,
          count: rateLimitData.count,
          maxRequests: options.maxRequests,
          url: request.url
        });
        
        throw ApiErrors.BadRequest(`请求过于频繁，请稍后再试 (${options.windowMs / 1000}秒内最多${options.maxRequests}次)`);
      }
      
      // 增加计数
      rateLimitData.count++;
    } else {
      // 新的时间窗口
      rateLimitData = {
        count: 1,
        resetTime: now + options.windowMs
      };
    }

    // 将限流数据存储到cookie中
    cookies.set(cookieName, JSON.stringify(rateLimitData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.ceil(options.windowMs / 1000), // 转换为秒
      path: '/',
      sameSite: 'strict'
    });

    return await next();
  };
}

// 常用限流配置
export const rateLimitConfigs = {
  // 登录接口限流
  login: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 20, // 最多5次
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