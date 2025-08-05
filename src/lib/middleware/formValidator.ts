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
      // 获取之前中间件解析的数据
      const requestData = (context as any).validatedData || (context as any).requestData;

      if (!requestData) {
        throw ApiErrors.BadRequest('请求数据未找到，请确保请求校验中间件已执行');
      }

      // 执行表单验证
      let validatedData;

      if (options?.strict) {
        // 严格模式：不允许额外字段
        validatedData = schema.strict().parse(requestData);
      } else {
        // 普通模式：允许额外字段
        validatedData = schema.parse(requestData);
      }

      // 应用自定义错误消息
      if (options?.customErrorMessages) {
        // 这里可以添加自定义错误消息处理逻辑
      }

      // 将验证后的数据存储到context中
      (context as any).formData = validatedData;

      log.info('[表单校验中间件] 表单校验通过', context.request, {
        url: context.request.url,
        dataKeys: Object.keys(validatedData)
      });

      return await next();

    } catch (error: any) {
      if (error instanceof z.ZodError) {

        const errorMessage = JSON.parse(error as any)[0].message
        log.warn('[表单校验中间件] 表单校验失败', {
          errors: errorMessage,
          url: context.request.url
        });
        throw ApiErrors.BadRequest(`${errorMessage}`);
      }

      log.error('[表单校验中间件] 表单校验异常', {
        error: error.message,
        url: context.request.url
      });
      throw error;
    }
  };
}
