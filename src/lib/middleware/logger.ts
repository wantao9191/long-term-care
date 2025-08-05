import type { APIContext } from 'astro';
import { log } from '@/lib/utils';

// 请求日志中间件
export function requestLogger(options?: {
  logRequestBody?: boolean; // 是否记录请求体
  logResponseBody?: boolean; // 是否记录响应体
  sensitiveFields?: string[]; // 敏感字段（会被脱敏）
}) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    const { request } = context;
    const startTime = Date.now();

    // 记录请求开始
    log.info('[请求日志] 开始处理请求', request, {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      timestamp: new Date().toISOString()
    });

    // 记录请求体（如果需要）
    if (options?.logRequestBody && request.method !== 'GET') {
      try {
        const requestData = (context as any).validatedData || (context as any).requestData;
        if (requestData) {
          const sanitizedData = sanitizeData(requestData, options.sensitiveFields);
          log.info('[请求日志] 请求数据', request, { data: sanitizedData });
        }
      } catch (error) {
        log.warn('[请求日志] 记录请求体失败');
      }
    }

    // 执行下一个中间件
    const response = await next();

    // 计算处理时间
    const duration = Date.now() - startTime;

    // 记录响应
    log.info('[请求日志] 请求处理完成', request, {
      method: request.method,
      url: request.url,
      status: response.status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return response;
  };
}

// 数据脱敏函数
function sanitizeData(data: any, sensitiveFields?: string[]): any {
  if (!sensitiveFields || sensitiveFields.length === 0) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        const value = sanitized[field];
        if (typeof value === 'string' && value.length > 0) {
          sanitized[field] = value.length > 2 ?
            value.charAt(0) + '*'.repeat(value.length - 2) + value.charAt(value.length - 1) :
            '*'.repeat(value.length);
        }
      }
    }

    return sanitized;
  }

  return data;
} 