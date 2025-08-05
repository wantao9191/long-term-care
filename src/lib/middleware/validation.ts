import { z } from 'zod';

// 常用表单验证模式
export const formSchemas = {
  // 登录表单
  login: z.object({
    username: z.string().min(1, '用户名不能为空').max(50, '用户名过长'),
    password: z.string().min(6, '密码至少6位').max(100, '密码过长'),
    code: z.string().length(4, '验证码必须是4位'),
    remember: z.boolean().optional(),
  }),

  // 用户注册表单
  register: z.object({
    username: z.string().min(2, '用户名至少2位').max(20, '用户名最多20位'),
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少6位').max(100, '密码过长'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine(val => val === true, '必须同意用户协议'),
  }).refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }),

  // 用户信息更新表单
  updateUser: z.object({
    nickname: z.string().min(1, '昵称不能为空').max(50, '昵称过长').optional(),
    email: z.string().email('邮箱格式不正确').optional(),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
    avatar: z.string().url('头像URL格式不正确').optional(),
  }),

  // 分页查询表单
  pagination: z.object({
    page: z.coerce.number().min(1, '页码必须大于0').default(1),
    pageSize: z.coerce.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    keyword: z.string().optional(),
    filters: z.record(z.any()).optional(),
  }),
}; 