import { z } from 'zod'
export const loginSchema = z.object({
  username: z.string().trim().min(1, { message: '请输入用户名' }),
  password: z.string().trim().min(1, { message: '请输入密码' }),
  code: z.string().trim().length(4, { message: '验证码为4位' }),
})
export type LoginSchema = z.infer<typeof loginSchema>
