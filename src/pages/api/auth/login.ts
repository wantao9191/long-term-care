import type { APIRoute, APIContext } from "astro";
import { db } from "@/lib/db";
import { log, verifyPassword, generateToken } from "@/lib/utils";
import { successResponse, ApiErrors } from "@/lib/middleware/errorHandler";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { composeMiddlewares } from "@/lib/middleware/compose";
import { requestValidator } from "@/lib/middleware/requestValidator";
import { formSchemas } from "@/lib/middleware/validation";
import { formValidator } from "@/lib/middleware/formValidator";
import { rateLimiter, rateLimitConfigs } from "@/lib/middleware/rateLimiter";

// 登录业务逻辑
async function loginHandler({ request, cookies }: APIContext): Promise<Response> {
  log.info(`[登录] 开始处理请求`, request);
  const { username, password, code } = await request.json();
  const captchaData = cookies.get('captcha')?.value;
  if (!captchaData) {
    throw ApiErrors.BadRequest('验证码已过期')
  }
  const { code: captchaCode, expires } = JSON.parse(captchaData);
  if (Date.now() > expires) {
    throw ApiErrors.BadRequest('验证码已过期')
  }
  if (code !== captchaCode) {
    throw ApiErrors.BadRequest('验证码错误')
  }

  // 根据用户名查询特定用户
  const userResult = await db.select().from(users).where(eq(users.username, username))
  if (userResult.length === 0) {
    throw ApiErrors.BadRequest('用户不存在');
  }
  const user = userResult[0]
  if (user.status !== 1) {
    throw ApiErrors.BadRequest('用户已被禁用');
  }
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw ApiErrors.BadRequest('密码错误');
  }
  // 获取组织信息
  const organizationResult = user.organizationId ? await db.select().from(organizations).where(eq(organizations.id, user.organizationId)) : []
  // 生成token
  const token = generateToken({
    username: user.username,
    id: user.id,
    roles: user.roles,
    organizationId: user.organizationId,
    organizationName: organizationResult[0]?.name,
  })
  // 设置cookie
  cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  cookies.delete('captcha');
  log.info(`[登录] 用户登录成功`, request, { username: user.username, userId: user.id });

  return successResponse(token, '登录成功');
}
// 使用中间件组合
export const POST: APIRoute = composeMiddlewares(
  rateLimiter(rateLimitConfigs.login),
  requestValidator(),
  formValidator(formSchemas.login),
  loginHandler
)
export const GET: APIRoute = ({ params, request }) => {
  console.log(params)
  return new Response(JSON.stringify({ message: 'Hello World' }), {
    status: 200
  })
}
