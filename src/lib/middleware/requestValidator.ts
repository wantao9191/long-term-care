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

      // 3. Content-Type 校验
      const contentType = request.headers.get('content-type');
      if (request.method !== 'GET' && !contentType) {
        throw ApiErrors.BadRequest('缺少Content-Type头');
      }

      // 4. 请求体大小校验
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB限制
        throw ApiErrors.BadRequest('请求体过大');
      }

      // 5. 解析请求数据
      let requestData: any = {};

      if (request.method !== 'GET') {
        try {
          if (contentType?.includes('application/json')) {
            requestData = await request.json();
          } else if (contentType?.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            requestData = Object.fromEntries(formData.entries());
          } else if (contentType?.includes('multipart/form-data')) {
            const formData = await request.formData();
            requestData = Object.fromEntries(formData.entries());
          }
        } catch (error) {
          throw ApiErrors.BadRequest('请求数据解析失败');
        }
      }

      // 6. 如果提供了schema，进行数据验证
      if (schema) {
        try {
          const validatedData = schema.parse(requestData);
          // 将验证后的数据存储到context中
          (context as any).validatedData = validatedData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errorMessage = JSON.parse(error as any)[0].message
            // const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw ApiErrors.BadRequest(`${errorMessage}`);
          }
          throw ApiErrors.BadRequest('数据验证失败');
        }
      } else {
        // 将原始数据存储到context中
        (context as any).requestData = requestData;
      }

      // 记录请求日志
      log.info('[请求校验中间件] 请求校验通过', request, {
        method: request.method,
        url: request.url,
        contentType: request.headers.get('content-type'),
        dataSize: JSON.stringify(requestData).length
      });

      // 继续执行下一个中间件
      return await next();

    } catch (error: any) {
      log.error('[请求校验中间件] 请求校验失败', {
        error: error.message,
        method: request.method,
        url: request.url
      });
      throw error;
    }
  };
}