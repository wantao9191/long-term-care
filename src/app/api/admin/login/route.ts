import { NextRequest } from 'next/server'
import { createHandler } from '../../_utils/handler'
import { cookies } from 'next/headers'
import { decryptJson } from '@/lib/crypto'
import { loginSchema } from '@/lib/validations'
import { error, ok } from '../../_utils/response'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { User } from '@/types'
import { verifyPassword } from '@/lib/password'
import { signAccessToken } from '@/lib/jwt'
export const POST = createHandler(async (request: NextRequest) => {
  const params = loginSchema.safeParse(await request.json())
  if (!params.success) {
    return error(params.error.errors[0].message)
  }
  const { username, password, code } = params.data
  const cookieStore = await cookies()
  const captcha = cookieStore.get('captcha')
  cookieStore.delete('captcha')
  if (!captcha) {
    return error('验证码已过期')
  }
  const captchaData = await decryptJson(captcha.value)
  if (captchaData.code !== code) {
    return error('验证码错误')
  }
  const user: User[] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  const currentUser = user[0]
  if (!currentUser) {
    return error('用户不存在')
  }
  const { password: userPassword, ...userInfo } = currentUser
  if (!(await verifyPassword(password, userPassword))) {
    return error('密码错误')
  }
  const token = await signAccessToken(JSON.parse(JSON.stringify(userInfo)))
  return ok({ token, userInfo }, '登录成功')
})