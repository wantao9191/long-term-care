import type { APIContext } from 'astro';
import { z } from 'zod';
import { log } from '@/lib/utils';

// 验证中间件
export function validateRequest(schema: z.ZodSchema) {
  return async function (context: APIContext): Promise<{ success: boolean; data?: any; error?: string }> {
    const { request } = context;

    try {
      let data: any;

      // 根据Content-Type解析数据
      const contentType = request.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else if (contentType?.includes('multipart/form-data')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        // 尝试解析为JSON
        try {
          data = await request.json();
        } catch {
          data = {};
        }
      }

      // 验证数据
      const validatedData = schema.parse(data);

      // 将验证后的数据添加到context
      (context as any).validatedData = validatedData;

      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        log.warn('[验证中间件] 数据验证失败', {
          errors: error.errors,
          url: request.url
        });
        return { success: false, error: errorMessage };
      }

      log.error('[验证中间件] 验证过程发生错误', error);
      return { success: false, error: '数据验证失败' };
    }
  };
}

// 常用验证模式
export const validationSchemas = {
  // 登录验证
  login: z.object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(6, '密码至少6位'),
    code: z.string().length(4, '验证码必须是4位'),
  }),

  // 用户创建验证
  createUser: z.object({
    username: z.string().min(2, '用户名至少2位').max(20, '用户名最多20位'),
    email: z.string().email('邮箱格式不正确').optional(),
    password: z.string().min(6, '密码至少6位'),
    role: z.enum(['admin', 'user', 'manager'], { errorMap: () => ({ message: '角色必须是admin、user或manager' }) }),
  }),

  // 分页参数验证
  pagination: z.object({
    page: z.coerce.number().min(1, '页码必须大于0').default(1),
    pageSize: z.coerce.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    keyword: z.string().optional(),
  }),

  // 文件上传验证
  fileUpload: z.object({
    file: z.instanceof(File, { message: '请选择文件' }),
  }),
};