import type { APIContext } from 'astro';
import { z } from 'zod';
import { log } from '@/lib/utils';
import { ApiErrors } from './errorHandler';

// 表单内容校验中间件
export function formValidator(schema: z.ZodSchema, options?: {
  strict?: boolean; // 是否严格模式，严格模式下不允许额外字段
  customErrorMessages?: Record<string, string>; // 自定义错误消息
}) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    try {
      const { request } = context;
      
      // 解析请求数据
      const contentType = request.headers?.get?.('content-type') || '';
      let requestData: any;
      
      try {
        if (contentType?.includes('application/json')) {
          requestData = await request.json();
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          requestData = Object.fromEntries(formData.entries());
        } else if (contentType?.includes('multipart/form-data')) {
          const formData = await request.formData();
          requestData = Object.fromEntries(formData.entries());
        } else {
          throw ApiErrors.BadRequest('不支持的Content-Type');
        }
      } catch (error) {
        if (error instanceof ApiErrors.BadRequest) {
          throw error;
        }
        throw ApiErrors.BadRequest('请求数据解析失败');
      }

      // 执行表单验证
      let validatedData;
      
      if (options?.strict) {
        // 严格模式：不允许额外字段
        validatedData = (schema as any).strict().parse(requestData);
      } else {
        // 普通模式：允许额外字段
        validatedData = schema.parse(requestData);
      }

      // 将验证后的数据存储到context中
      (context as any).formData = validatedData;

      return await next();
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessage = JSON.parse(error as any)[0].message
        log.warn('[表单校验中间件] 表单校验失败', {
          errors: errorMessage,
          url: context.request.url
        });
        throw ApiErrors.BadRequest(`表单验证失败: ${errorMessage}`);
      }
      
      log.error('[表单校验中间件] 表单校验异常', {
        error: error.message,
        url: context.request.url
      });
      throw error;
    }
  };
}