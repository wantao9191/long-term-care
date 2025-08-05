import type { APIContext } from 'astro';
import { z } from 'zod';
import { log } from '@/lib/utils';
import { ApiErrors } from './errorHandler';

// 通用请求校验中间件
export function requestValidator(schema?: z.ZodSchema) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    const { request } = context;
    
    try {
      // 1. 基础请求校验
      if (!request) {
        throw ApiErrors.BadRequest('无效的请求对象');
      }

      // 2. 请求方法校验
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!allowedMethods.includes(request.method)) {
        throw ApiErrors.BadRequest(`不支持的请求方法: ${request.method}`);
      }

      // 3. Content-Type 校验 - 安全获取headers
      const contentType = request.headers?.get?.('content-type') || '';
      if (request.method !== 'GET' && !contentType) {
        throw ApiErrors.BadRequest('缺少Content-Type头');
      }

      // 4. 请求体大小校验 - 安全获取headers
      const contentLength = request.headers?.get?.('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB限制
        throw ApiErrors.BadRequest('请求体过大');
      }

      // 5. 请求体解析由后续中间件处理，这里只做基础校验

      // 继续执行下一个中间件
      return await next();
      
    } catch (error: any) {
      log.error('[请求校验中间件] 请求校验失败', {
        error: error.message,
      });
      throw error;
    }
  };
}